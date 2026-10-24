package com.tpe.propertyempire.dto;

public class DashboardDTO {

    private String fullName;
    private String email;
    private String countryCode;
    private String tpeId;
    private String role;
    private String joinedDate;
    private int totalDirects;
    private int totalTeamSize;
    private int todayDirects;
    private int level;

    public DashboardDTO() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
    public String getTpeId() { return tpeId; }
    public void setTpeId(String tpeId) { this.tpeId = tpeId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }
    public int getTotalDirects() { return totalDirects; }
    public void setTotalDirects(int totalDirects) { this.totalDirects = totalDirects; }
    public int getTotalTeamSize() { return totalTeamSize; }
    public void setTotalTeamSize(int totalTeamSize) { this.totalTeamSize = totalTeamSize; }
    public int getTodayDirects() { return todayDirects; }
    public void setTodayDirects(int todayDirects) { this.todayDirects = todayDirects; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
}
