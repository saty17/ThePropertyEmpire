package com.tpe.propertyempire.config;

import com.tpe.propertyempire.service.OtpService;
import com.tpe.propertyempire.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(CleanupScheduler.class);

    private final OtpService otpService;
    private final RefreshTokenService refreshTokenService;

    public CleanupScheduler(OtpService otpService, RefreshTokenService refreshTokenService) {
        this.otpService = otpService;
        this.refreshTokenService = refreshTokenService;
    }

    @Scheduled(cron = "0 0 */6 * * *")
    public void cleanupExpiredTokens() {
        log.info("Running scheduled cleanup of expired OTPs and refresh tokens");
        otpService.cleanupExpiredOtps();
        refreshTokenService.cleanupExpiredTokens();
        log.info("Cleanup complete");
    }
}