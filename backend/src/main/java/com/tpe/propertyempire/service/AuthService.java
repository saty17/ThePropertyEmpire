package com.tpe.propertyempire.service;

import com.tpe.propertyempire.dto.*;
import com.tpe.propertyempire.entity.User;
import com.tpe.propertyempire.enums.OtpType;
import com.tpe.propertyempire.enums.Role;
import com.tpe.propertyempire.repository.UserRepository;
import com.tpe.propertyempire.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String DIGITS = "0123456789";
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       OtpService otpService, EmailService emailService,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
        this.jwtTokenProvider = jwtTokenProvider;
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
                .enabled(true)
                .build();

        userRepository.save(user);

        emailService.sendWelcomeEmail(user);

        RegistrationSuccessDTO dto = new RegistrationSuccessDTO();
        dto.setTpeId(user.getTpeId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setCountryCode(user.getCountryCode());
        dto.setMobile(user.getMobile());
        dto.setJoinedDate(user.getCreatedAt() != null ? user.getCreatedAt().format(FMT) : null);

        return ApiResponse.success("Registration successful!", dto);
    }

    public ApiResponse login(LoginRequest request) {
        User user = userRepository.findByTpeId(request.getUserId()).orElse(null);
        if (user == null) {
            return ApiResponse.error("Invalid User ID or password");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ApiResponse.error("Invalid User ID or password");
        }

        if (!user.isEnabled()) {
            return ApiResponse.error("Account is disabled. Please contact support.");
        }

        String otp = otpService.generateOtp();
        otpService.saveOtp(user.getTpeId(), user.getEmail(), otp, OtpType.LOGIN);
        emailService.sendOtpEmail(user.getEmail(), otp, "Login Verification");

        String maskedEmail = maskEmail(user.getEmail());

        Map<String, String> data = new HashMap<>();
        data.put("tpeId", user.getTpeId());
        data.put("email", maskedEmail);

        return ApiResponse.success("OTP sent to your registered email", data);
    }

    @Transactional
    public ApiResponse verifyLoginOtp(String userId, String otp) {
        boolean valid = otpService.verifyOtp(userId, otp, OtpType.LOGIN);
        if (!valid) {
            return ApiResponse.error("Invalid or expired OTP");
        }

        User user = userRepository.findByTpeId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtTokenProvider.generateToken(userId);

        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .tpeId(user.getTpeId())
                .build();

        return ApiResponse.success("Login successful", authResponse);
    }

    public ApiResponse verifyForgotPasswordOtp(String tpeId, String otp) {
        boolean valid = otpService.verifyOtp(tpeId, otp, OtpType.FORGOT_PASSWORD);
        if (!valid) {
            return ApiResponse.error("Invalid or expired OTP");
        }
        return ApiResponse.success("OTP verified.");
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

        String purpose = otpType == OtpType.LOGIN ? "Login Verification" : "Password Reset";

        String otp = otpService.generateOtp();
        otpService.saveOtp(tpeId, user.getEmail(), otp, otpType);
        emailService.sendOtpEmail(user.getEmail(), otp, purpose);

        return ApiResponse.success("OTP resent to your email");
    }

    public ApiResponse validateSponsor(String tpeId) {
        return userRepository.findByTpeId(tpeId)
                .map(user -> {
                    Map<String, String> data = new HashMap<>();
                    data.put("name", user.getFullName());
                    data.put("tpeId", user.getTpeId());
                    return ApiResponse.success("Sponsor found", data);
                })
                .orElse(ApiResponse.error("Invalid referral code"));
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) return email;
        return email.charAt(0) + "***" + email.substring(atIndex - 1);
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
