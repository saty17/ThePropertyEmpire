package com.tpe.propertyempire.service;

import com.tpe.propertyempire.dto.*;
import com.tpe.propertyempire.entity.User;
import com.tpe.propertyempire.enums.OtpType;
import com.tpe.propertyempire.enums.Role;
import com.tpe.propertyempire.repository.UserRepository;
import com.tpe.propertyempire.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    private static final String DIGITS = "0123456789";
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       OtpService otpService, EmailService emailService,
                       JwtTokenProvider jwtTokenProvider, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public ApiResponse signup(SignupRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ApiResponse.error("Passwords do not match");
        }

        if (request.getSponsorId() != null && !request.getSponsorId().isBlank()) {
            boolean sponsorExists = userRepository.findByTpeId(request.getSponsorId()).isPresent();
            if (!sponsorExists) {
                return ApiResponse.error("Invalid sponsor/referral code");
            }
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .countryCode(request.getCountryCode())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .sponsorId(request.getSponsorId())
                .tpeId(generateTpeId())
                .enabled(false)
                .build();

        userRepository.save(user);

        String otp = otpService.generateOtp();
        otpService.saveOtp(user.getTpeId(), request.getEmail(), otp, OtpType.REGISTRATION);
        emailService.sendOtpEmail(request.getEmail(), otp, "Account Registration");

        return ApiResponse.success(
                "Registration successful. Please verify your email with the OTP sent.",
                Map.of("tpeId", user.getTpeId())
        );
    }

    @Transactional
    public ApiResponse verifyRegistrationOtp(VerifyOtpRequest request) {
        OtpType otpType = request.getOtpType() != null ? request.getOtpType() : OtpType.REGISTRATION;
        boolean valid = otpService.verifyOtp(request.getTpeId(), request.getOtp(), otpType);
        if (!valid) {
            return ApiResponse.error("Invalid or expired OTP");
        }

        if (otpType == OtpType.REGISTRATION) {
            User user = userRepository.findByTpeId(request.getTpeId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setEnabled(true);
            userRepository.save(user);

            RegistrationSuccessDTO dto = new RegistrationSuccessDTO();
            dto.setTpeId(user.getTpeId());
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setCountryCode(user.getCountryCode());
            dto.setMobile(user.getMobile());
            dto.setJoinedDate(user.getCreatedAt() != null ? user.getCreatedAt().format(FMT) : null);

            emailService.sendWelcomeEmail(user);

            return ApiResponse.success("Email verified successfully.", dto);
        }

        return ApiResponse.success("OTP verified.");
    }

    public ApiResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUserId(), request.getPassword())
            );

            String token = jwtTokenProvider.generateToken(authentication);

            User user = userRepository.findByTpeId(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AuthResponse authResponse = AuthResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .tpeId(user.getTpeId())
                    .build();

            return ApiResponse.success("Login successful", authResponse);

        } catch (DisabledException e) {
            return ApiResponse.error("Account not verified. Please verify your email first.");
        } catch (BadCredentialsException e) {
            return ApiResponse.error("Invalid User ID or password");
        }
    }

    @Transactional
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByTpeId(request.getUserId()).orElse(null);
        if (user == null) {
            return ApiResponse.error("No account found with this User ID");
        }

        String otp = otpService.generateOtp();
        otpService.saveOtp(user.getTpeId(), user.getEmail(), otp, OtpType.FORGOT_PASSWORD);
        emailService.sendOtpEmail(user.getEmail(), otp, "Password Reset");

        return ApiResponse.success("OTP sent to your registered email for password reset");
    }

    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            return ApiResponse.error("Passwords do not match");
        }

        boolean valid = otpService.verifyOtp(request.getUserId(), request.getOtp(), OtpType.FORGOT_PASSWORD);
        if (!valid) {
            return ApiResponse.error("Invalid or expired OTP");
        }

        User user = userRepository.findByTpeId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ApiResponse.success("Password reset successfully. You can now login with your new password.");
    }

    @Transactional
    public ApiResponse resendOtp(String tpeId, OtpType otpType) {
        User user = userRepository.findByTpeId(tpeId).orElse(null);
        if (user == null) {
            return ApiResponse.error("No account found with this User ID");
        }

        String purpose = otpType == OtpType.REGISTRATION ? "Account Registration" : "Password Reset";

        String otp = otpService.generateOtp();
        otpService.saveOtp(tpeId, user.getEmail(), otp, otpType);
        emailService.sendOtpEmail(user.getEmail(), otp, purpose);

        return ApiResponse.success("OTP resent to your email");
    }

    public ApiResponse validateSponsor(String tpeId) {
        return userRepository.findByTpeId(tpeId)
                .map(user -> {
                    java.util.Map<String, String> data = new java.util.HashMap<>();
                    data.put("name", user.getFullName());
                    data.put("tpeId", user.getTpeId());
                    return ApiResponse.success("Sponsor found", data);
                })
                .orElse(ApiResponse.error("Invalid referral code"));
    }

    private String generateTpeId() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("TPE");
            for (int i = 0; i < 7; i++) {
                sb.append(DIGITS.charAt(secureRandom.nextInt(DIGITS.length())));
            }
            code = sb.toString();
        } while (userRepository.existsByTpeId(code));
        return code;
    }
}
