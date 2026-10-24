package com.tpe.propertyempire.entity;

import com.tpe.propertyempire.enums.OtpType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otps")
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column
    private String tpeId;

    @Column(nullable = false)
    private String otpCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OtpType otpType;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used;

    public Otp() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTpeId() { return tpeId; }
    public void setTpeId(String tpeId) { this.tpeId = tpeId; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    public OtpType getOtpType() { return otpType; }
    public void setOtpType(OtpType otpType) { this.otpType = otpType; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }

    public static OtpBuilder builder() { return new OtpBuilder(); }

    public static class OtpBuilder {
        private String email;
        private String tpeId;
        private String otpCode;
        private OtpType otpType;
        private LocalDateTime expiresAt;
        private boolean used;

        public OtpBuilder email(String email) { this.email = email; return this; }
        public OtpBuilder tpeId(String tpeId) { this.tpeId = tpeId; return this; }
        public OtpBuilder otpCode(String otpCode) { this.otpCode = otpCode; return this; }
        public OtpBuilder otpType(OtpType otpType) { this.otpType = otpType; return this; }
        public OtpBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public OtpBuilder used(boolean used) { this.used = used; return this; }

        public Otp build() {
            Otp otp = new Otp();
            otp.email = this.email;
            otp.tpeId = this.tpeId;
            otp.otpCode = this.otpCode;
            otp.otpType = this.otpType;
            otp.expiresAt = this.expiresAt;
            otp.used = this.used;
            return otp;
        }
    }
}
