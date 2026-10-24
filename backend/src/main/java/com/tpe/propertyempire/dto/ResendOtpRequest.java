package com.tpe.propertyempire.dto;

import com.tpe.propertyempire.enums.OtpType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ResendOtpRequest {

    @NotBlank(message = "TPE ID is required")
    private String tpeId;

    @NotNull(message = "OTP type is required")
    private OtpType otpType;

    public String getTpeId() { return tpeId; }
    public void setTpeId(String tpeId) { this.tpeId = tpeId; }
    public OtpType getOtpType() { return otpType; }
    public void setOtpType(OtpType otpType) { this.otpType = otpType; }
}
