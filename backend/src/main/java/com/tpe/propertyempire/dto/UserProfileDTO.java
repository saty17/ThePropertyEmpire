package com.tpe.propertyempire.dto;

import com.tpe.propertyempire.entity.User;

import java.time.format.DateTimeFormatter;

public class UserProfileDTO {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private Long id;
    private String fullName;
    private String email;
    private String countryCode;
    private String mobile;
    private String role;
    private String tpeId;
    private String sponsorId;
    private String sponsorName;
    private boolean enabled;
    private String createdAt;

    public UserProfileDTO() {}

    public static UserProfileDTO fromUser(User user, String sponsorName) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.id = user.getId();
        dto.fullName = user.getFullName();
        dto.email = user.getEmail();
        dto.countryCode = user.getCountryCode();
        dto.mobile = user.getMobile();
        dto.role = user.getRole().name();
        dto.tpeId = user.getTpeId();
        dto.sponsorId = user.getSponsorId();
        dto.sponsorName = sponsorName;
        dto.enabled = user.isEnabled();
        dto.createdAt = user.getCreatedAt() != null ? user.getCreatedAt().format(FMT) : null;
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getTpeId() { return tpeId; }
    public void setTpeId(String tpeId) { this.tpeId = tpeId; }
    public String getSponsorId() { return sponsorId; }
    public void setSponsorId(String sponsorId) { this.sponsorId = sponsorId; }
    public String getSponsorName() { return sponsorName; }
    public void setSponsorName(String sponsorName) { this.sponsorName = sponsorName; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
