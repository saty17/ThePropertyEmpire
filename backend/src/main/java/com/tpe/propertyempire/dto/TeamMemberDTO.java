package com.tpe.propertyempire.dto;

import com.tpe.propertyempire.entity.User;

import java.time.format.DateTimeFormatter;

public class TeamMemberDTO {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private Long id;
    private String fullName;
    private String email;
    private String countryCode;
    private String mobile;
    private String tpeId;
    private String sponsorId;
    private int level;
    private String joinedDate;
    private String status;

    public TeamMemberDTO() {}

    public static TeamMemberDTO fromUser(User user, int level) {
        TeamMemberDTO dto = new TeamMemberDTO();
        dto.id = user.getId();
        dto.fullName = user.getFullName();
        dto.email = user.getEmail();
        dto.countryCode = user.getCountryCode();
        dto.mobile = user.getMobile();
        dto.tpeId = user.getTpeId();
        dto.sponsorId = user.getSponsorId();
        dto.level = level;
        dto.joinedDate = user.getCreatedAt() != null ? user.getCreatedAt().format(FMT) : null;
        dto.status = user.isEnabled() ? "Active" : "Inactive";
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
    public String getTpeId() { return tpeId; }
    public void setTpeId(String tpeId) { this.tpeId = tpeId; }
    public String getSponsorId() { return sponsorId; }
    public void setSponsorId(String sponsorId) { this.sponsorId = sponsorId; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
