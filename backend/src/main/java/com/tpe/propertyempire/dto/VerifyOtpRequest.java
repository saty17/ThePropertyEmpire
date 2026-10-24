package com.tpe.propertyempire.dto;

import com.tpe.propertyempire.enums.OtpType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VerifyOtpRequest {

    @NotBlank(message = "TPE ID is required")
    private String tpeId;

    @NotBlank(message = "OTP is required")
    private String otp;

    private OtpType otpType;

    public String getTpeId() { return tpeId; }
    public void setTpeId(String tpeId) { this.tpeId = tpeId; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public OtpType getOtpType() { return otpType; }
    public void setOtpType(OtpType otpType) { this.otpType = otpType; }
}
