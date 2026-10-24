package com.tpe.propertyempire.entity;

import com.tpe.propertyempire.enums.Role;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String countryCode;

    private String mobile;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String sponsorId;

    @Column(unique = true, nullable = false)
    private String tpeId;

    @Column(nullable = false)
    private boolean enabled;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public User() {}

    public User(Long id, String fullName, String email, String countryCode, String mobile,
                String password, Role role, String sponsorId, String tpeId,
                boolean enabled, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.countryCode = countryCode;
        this.mobile = mobile;
        this.password = password;
        this.role = role;
        this.sponsorId = sponsorId;
        this.tpeId = tpeId;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getSponsorId() { return sponsorId; }
    public void setSponsorId(String sponsorId) { this.sponsorId = sponsorId; }
    public String getTpeId() { return tpeId; }
    public void setTpeId(String tpeId) { this.tpeId = tpeId; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private Long id;
        private String fullName;
        private String email;
        private String countryCode;
        private String mobile;
        private String password;
        private Role role;
        private String sponsorId;
        private String tpeId;
        private boolean enabled;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder countryCode(String countryCode) { this.countryCode = countryCode; return this; }
        public UserBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder sponsorId(String sponsorId) { this.sponsorId = sponsorId; return this; }
        public UserBuilder tpeId(String tpeId) { this.tpeId = tpeId; return this; }
        public UserBuilder enabled(boolean enabled) { this.enabled = enabled; return this; }

        public User build() {
            User user = new User();
            user.id = this.id;
            user.fullName = this.fullName;
            user.email = this.email;
            user.countryCode = this.countryCode;
            user.mobile = this.mobile;
            user.password = this.password;
            user.role = this.role;
            user.sponsorId = this.sponsorId;
            user.tpeId = this.tpeId;
            user.enabled = this.enabled;
            return user;
        }
    }
}
