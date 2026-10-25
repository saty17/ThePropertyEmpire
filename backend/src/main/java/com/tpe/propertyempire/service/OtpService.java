package com.tpe.propertyempire.service;

import com.tpe.propertyempire.entity.Otp;
import com.tpe.propertyempire.enums.OtpType;
import com.tpe.propertyempire.repository.OtpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(OtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    public String generateOtp() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }

    @Transactional
    public Otp saveOtp(String tpeId, String email, String otpCode, OtpType otpType) {
        Otp otp = Otp.builder()
                .tpeId(tpeId)
                .email(email)
                .otpCode(otpCode)
                .otpType(otpType)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();
        return otpRepository.save(otp);
    }

    @Transactional
    public boolean verifyOtp(String tpeId, String otpCode, OtpType otpType) {
        Optional<Otp> otpOpt = otpRepository
                .findTopByTpeIdAndOtpTypeAndUsedFalseOrderByIdDesc(tpeId, otpType);

        if (otpOpt.isEmpty()) {
            return false;
        }

        Otp otp = otpOpt.get();

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            return false;
        }

        otp.setUsed(true);
        otpRepository.save(otp);
        return true;
    }

    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}

