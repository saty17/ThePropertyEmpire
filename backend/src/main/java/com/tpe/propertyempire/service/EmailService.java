package com.tpe.propertyempire.service;

import com.tpe.propertyempire.entity.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendOtpEmail(String to, String otp, String purpose) {
        log.info("OTP for {} [{}]: {}", to, purpose, otp);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("The Property Empire - Your OTP Code");
            helper.setText(buildOtpEmailHtml(otp, purpose), true);

            mailSender.send(message);
            log.info("OTP email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(User user) {
        log.info("Sending welcome email to {}", user.getEmail());
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Welcome to The Property Empire - Your Account Details");
            helper.setText(buildWelcomeEmailHtml(user), true);

            mailSender.send(message);
            log.info("Welcome email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    private String buildOtpEmailHtml(String otp, String purpose) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px; }
                        .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0d1b0e 0%%, #1a2e1c 100%%); border-radius: 16px; padding: 40px; border: 1px solid #2d5a2e; }
                        .logo { text-align: center; margin-bottom: 24px; }
                        .logo h1 { color: #c8a84e; font-size: 24px; margin: 0; }
                        .logo span { color: #4CAF50; }
                        .otp-box { background: rgba(200, 168, 78, 0.1); border: 2px solid #c8a84e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
                        .otp-code { font-size: 36px; font-weight: bold; color: #c8a84e; letter-spacing: 8px; }
                        .message { color: #a0a0a0; font-size: 14px; line-height: 1.6; text-align: center; }
                        .footer { text-align: center; margin-top: 24px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <h1>The <span>Property</span> Empire</h1>
                        </div>
                        <p class="message">Your one-time password for <strong>%s</strong>:</p>
                        <div class="otp-box">
                            <div class="otp-code">%s</div>
                        </div>
                        <p class="message">This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
                        <div class="footer">
                            <p>&copy; 2024 The Property Empire. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(purpose, otp);
    }

    private String buildWelcomeEmailHtml(User user) {
        String phone = (user.getCountryCode() != null ? user.getCountryCode() + " " : "") +
                        (user.getMobile() != null ? user.getMobile() : "-");
        String joinedDate = user.getCreatedAt() != null ? user.getCreatedAt().format(FMT) : "-";

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px; }
                        .container { max-width: 520px; margin: 0 auto; background: linear-gradient(135deg, #0d1b0e 0%%, #1a2e1c 100%%); border-radius: 16px; padding: 40px; border: 1px solid #2d5a2e; }
                        .logo { text-align: center; margin-bottom: 24px; }
                        .logo h1 { color: #c8a84e; font-size: 24px; margin: 0; }
                        .logo span { color: #4CAF50; }
                        .welcome { text-align: center; color: #c8a84e; font-size: 20px; margin-bottom: 8px; }
                        .subtitle { text-align: center; color: #a0a0a0; font-size: 14px; margin-bottom: 24px; }
                        .id-box { background: rgba(200, 168, 78, 0.1); border: 2px solid #c8a84e; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
                        .id-label { color: #a0a0a0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
                        .id-value { font-size: 28px; font-weight: bold; color: #c8a84e; letter-spacing: 4px; margin-top: 8px; }
                        .details { margin: 24px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
                        .detail-label { color: #a0a0a0; font-size: 13px; }
                        .detail-value { color: #ffffff; font-size: 13px; font-weight: 500; }
                        .message { color: #a0a0a0; font-size: 13px; line-height: 1.6; text-align: center; margin-top: 24px; }
                        .footer { text-align: center; margin-top: 24px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <h1>The <span>Property</span> Empire</h1>
                        </div>
                        <div class="welcome">Welcome, %s!</div>
                        <div class="subtitle">Your registration is complete. Here are your account details.</div>
                        <div class="id-box">
                            <div class="id-label">Your TPE User ID</div>
                            <div class="id-value">%s</div>
                        </div>
                        <div class="details">
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr><td style="color:#a0a0a0;font-size:13px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">Full Name</td><td style="color:#fff;font-size:13px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right">%s</td></tr>
                                <tr><td style="color:#a0a0a0;font-size:13px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">Email</td><td style="color:#fff;font-size:13px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right">%s</td></tr>
                                <tr><td style="color:#a0a0a0;font-size:13px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">Phone</td><td style="color:#fff;font-size:13px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right">%s</td></tr>
                                <tr><td style="color:#a0a0a0;font-size:13px;padding:10px 0;">Joined</td><td style="color:#fff;font-size:13px;padding:10px 0;text-align:right">%s</td></tr>
                            </table>
                        </div>
                        <p class="message">Please keep your User ID safe. You will need it to log in to your account.</p>
                        <div class="footer">
                            <p>&copy; 2024 The Property Empire. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                    user.getFullName(),
                    user.getTpeId(),
                    user.getFullName(),
                    user.getEmail(),
                    phone,
                    joinedDate
                );
    }
}
