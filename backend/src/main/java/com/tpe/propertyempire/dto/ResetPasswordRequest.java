package com.tpe.propertyempire.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 40, message = "Password must be between 6 and 40 characters")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmNewPassword;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    public String getConfirmNewPassword() { return confirmNewPassword; }
    public void setConfirmNewPassword(String confirmNewPassword) { this.confirmNewPassword = confirmNewPassword; }
}
