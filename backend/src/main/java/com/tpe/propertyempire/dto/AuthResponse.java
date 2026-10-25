package com.tpe.propertyempire.dto;

public class AuthResponse {

    private String token;
    private String refreshToken;
    private String email;
    private String fullName;
    private String role;
    private String tpeId;

    public AuthResponse() {}

    public AuthResponse(String token, String refreshToken, String email, String fullName, String role, String tpeId) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.tpeId = tpeId;
    }

    public static AuthResponseBuilder builder() { return new AuthResponseBuilder(); }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getTpeId() { return tpeId; }
    public void setTpeId(String tpeId) { this.tpeId = tpeId; }

    public static class AuthResponseBuilder {
        private String token;
        private String refreshToken;
        private String email;
        private String fullName;
        private String role;
        private String tpeId;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder tpeId(String tpeId) { this.tpeId = tpeId; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, refreshToken, email, fullName, role, tpeId);
        }
    }
}
