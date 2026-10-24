# The Property Empire (TPE) - MLM Application

> **IMPORTANT:** Read this file at the start of every conversation. Update it after every task to keep it current.

## Project Overview

MLM (multi-level marketing) web application for The Property Empire — a luxury real estate platform with referral bonuses. Single admin user, multiple regular users, referral/sponsor system.

**Client:** The Property Empire
**Status:** Auth module + Dashboard + Network/Referral system + TPE ID system complete

## Tech Stack

| Layer    | Technology                  | Version  |
|----------|-----------------------------|----------|
| Frontend | React + Vite                | React 19, Vite 8.3 |
| Backend  | Spring Boot + Spring Security | 3.4.4   |
| Database | PostgreSQL                  | Local    |
| Auth     | JWT (HS512, jjwt 0.12.6)   | Stateless |
| Email    | Spring Mail (Gmail SMTP)    | Async, real sending |
| Java     | OpenJDK                     | 26       |
| Node     | Node.js                     | 26       |

**Note:** Lombok is NOT used — incompatible with Java 26. All classes use explicit getters/setters/builders.

## TPE ID System

- **Format:** `TPE` + 7 random digits (e.g., `TPE6756678`)
- **Primary unique identifier** for every user — replaces email as login credential
- Stored in `tpeId` column (unique constraint, DB column `tpe_id`)
- Email and phone number CAN be duplicate across users
- Admin has fixed ID: `TPE0000001`
- Login, forgot password, and reset password all use TPE ID
- JWT subject contains TPE ID (not email)
- `SecurityContextHolder.getContext().getAuthentication().getName()` returns TPE ID

## Project Structure

```
ThePropertyEmpire/
├── CLAUDE.md
├── CompanyLogo.jpeg
├── Welcome Poster.jpeg
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/tpe/propertyempire/
│       ├── ThePropertyEmpireApplication.java  ← @EnableAsync
│       ├── config/
│       │   ├── DataInitializer.java      ← Seeds admin (TPE0000001), handles migration
│       │   └── SecurityConfig.java       ← CORS, JWT filter, BCrypt
│       ├── controller/
│       │   ├── AuthController.java       ← /api/auth/** (public)
│       │   └── UserController.java       ← /api/user/** (JWT protected, uses TPE ID)
│       ├── dto/
│       │   ├── ApiResponse.java          ← { success, message, data }
│       │   ├── AuthResponse.java         ← { token, email, fullName, role, tpeId }
│       │   ├── DashboardDTO.java         ← { fullName, email, tpeId, countryCode, ... }
│       │   ├── ForgotPasswordRequest.java ← { userId } (TPE ID)
│       │   ├── LevelInfoDTO.java         ← { level, memberCount }
│       │   ├── LoginRequest.java         ← { userId, password } (TPE ID)
│       │   ├── RegistrationSuccessDTO.java ← { tpeId, fullName, email, countryCode, mobile, joinedDate }
│       │   ├── ResendOtpRequest.java     ← { tpeId, otpType }
│       │   ├── ResetPasswordRequest.java ← { userId, otp, newPassword, confirmNewPassword }
│       │   ├── SignupRequest.java        ← { fullName, email, countryCode, mobile, password, ... }
│       │   ├── TeamMemberDTO.java        ← { ..., countryCode, ... }
│       │   ├── TreeNodeDTO.java
│       │   ├── UpdateProfileRequest.java ← { fullName?, mobile?, countryCode? }
│       │   ├── UserProfileDTO.java       ← { ..., countryCode, ... }
│       │   └── VerifyOtpRequest.java     ← { tpeId, otp, otpType }
│       ├── entity/
│       │   ├── Otp.java                  ← email + tpeId fields
│       │   └── User.java                ← tpeId (unique), countryCode, email (NOT unique)
│       ├── enums/
│       │   ├── OtpType.java             ← REGISTRATION, FORGOT_PASSWORD
│       │   └── Role.java                ← ADMIN, USER
│       ├── exception/
│       │   └── GlobalExceptionHandler.java
│       ├── repository/
│       │   ├── OtpRepository.java       ← findByTpeId + findByEmail lookups
│       │   └── UserRepository.java      ← findByTpeId (primary), findByEmail, existsByTpeId
│       ├── security/
│       │   ├── CustomUserDetailsService.java ← loads by tpeId
│       │   ├── JwtAuthenticationFilter.java  ← extracts TPE ID from JWT
│       │   └── JwtTokenProvider.java         ← JWT subject = TPE ID
│       └── service/
│           ├── AuthService.java          ← signup, login(userId), forgotPassword(userId), resetPassword(userId)
│           ├── EmailService.java         ← @Async, sendOtpEmail, sendWelcomeEmail
│           ├── NetworkService.java       ← BFS team traversal, recursive tree, level info
│           ├── OtpService.java           ← saveOtp(tpeId, email, ...), verifyOtp(tpeId, ...)
│           └── UserService.java          ← profile CRUD (by tpeId), dashboard aggregation
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── public/assets/
    └── src/
        ├── App.jsx                       ← All routes including /registration-success
        ├── main.jsx                      ← BrowserRouter + AuthProvider + Toaster
        ├── index.css
        ├── api/
        │   ├── auth.js                   ← Auth API (no JWT header)
        │   └── user.js                   ← User API (auto JWT header, 401 → logout)
        ├── context/
        │   └── AuthContext.jsx           ← Auth state: user, token, login(), logout(), updateUser()
        ├── data/
        │   └── countryCodes.js           ← Static COUNTRY_CODES array (41 countries)
        ├── components/
        │   ├── AuthLayout.jsx            ← Auth page wrapper (dark bg + card + logo)
        │   ├── DashboardLayout.jsx       ← Sidebar + topbar + Outlet
        │   └── ProtectedRoute.jsx        ← Redirects to /login if unauthenticated
        ├── pages/
        │   ├── Login.jsx                 ← TPE ID + password login
        │   ├── Signup.jsx                ← Country code dropdown + 10-digit phone validation
        │   ├── VerifyOtp.jsx             ← Uses tpeId for verification
        │   ├── ForgotPassword.jsx        ← Enter TPE ID → OTP sent to email
        │   ├── ResetPassword.jsx         ← Uses TPE ID
        │   ├── RegistrationSuccess.jsx   ← Shows user details + login button + email notice
        │   └── dashboard/
        │       ├── Home.jsx
        │       ├── Profile.jsx           ← Country code dropdown in edit mode
        │       ├── MyDirect.jsx          ← Shows countryCode + phone
        │       ├── MyTeam.jsx
        │       ├── GenerationTree.jsx
        │       ├── LevelInfo.jsx
        │       └── ReferAndEarn.jsx
        └── styles/
            ├── auth.css                  ← Auth pages theme + registration success + phone input styles
            └── dashboard.css
```

## API Endpoints

### Auth (public — `/api/auth/**`)

| Method | Endpoint                          | Request Key Fields                        | Purpose                          |
|--------|-----------------------------------|-------------------------------------------|----------------------------------|
| POST   | `/api/auth/signup`                | fullName, email, countryCode, mobile, password, confirmPassword, sponsorId? | Register new user, returns `{ tpeId }` |
| POST   | `/api/auth/verify-otp`            | tpeId, otp, otpType                       | Verify OTP; for REGISTRATION returns user details |
| POST   | `/api/auth/login`                 | userId (TPE ID), password                 | Authenticate, returns JWT + user info |
| POST   | `/api/auth/forgot-password`       | userId (TPE ID)                           | Send reset OTP to user's email   |
| POST   | `/api/auth/reset-password`        | userId, otp, newPassword, confirmNewPassword | Verify OTP + set new password  |
| POST   | `/api/auth/resend-otp`            | tpeId, otpType                            | Resend OTP                       |
| GET    | `/api/auth/validate-sponsor/{code}` |                                         | Validate referral code           |

### User (JWT protected — `/api/user/**`)

| Method | Endpoint                          | Purpose                          |
|--------|-----------------------------------|----------------------------------|
| GET    | `/api/user/profile`               | Get current user profile (includes countryCode) |
| PUT    | `/api/user/profile`               | Update name/mobile/countryCode   |
| GET    | `/api/user/dashboard`             | Dashboard stats                  |
| GET    | `/api/user/my-directs`            | Direct referrals (includes countryCode) |
| GET    | `/api/user/my-team`               | All team members (BFS, max 10 levels) |
| GET    | `/api/user/generation-tree`       | Recursive tree (max 5 levels)    |
| GET    | `/api/user/level-info`            | Member count per network level   |
| GET    | `/api/user/referral-link`         | Get formatted referral link      |

## Auth Flows

**Registration:** Signup → OTP email → Verify OTP → Registration Success page (shows TPE ID, details) → Welcome email sent → Login
**Login:** TPE ID + password → JWT → AuthContext → redirect to /dashboard
**Forgot Password:** Enter TPE ID → OTP sent to registered email → Enter OTP + new password → Reset
**Referral:** Each user gets TPE ID. Share via link `?ref=TPEXXXXXXX`, WhatsApp, Telegram, Email.
**Network:** BFS traversal from user's tpeId. Tree built recursively. Level = depth from user.

## Frontend Routes

| Path | Component | Auth? |
|------|-----------|-------|
| `/login` | Login (TPE ID) | No (redirects to /dashboard if logged in) |
| `/signup` | Signup (with country code) | No |
| `/verify-otp` | VerifyOtp | No |
| `/forgot-password` | ForgotPassword (TPE ID) | No |
| `/reset-password` | ResetPassword (TPE ID) | No |
| `/registration-success` | RegistrationSuccess | No |
| `/dashboard` | Home | Yes |
| `/dashboard/profile` | Profile (with country code) | Yes |
| `/dashboard/network/my-direct` | MyDirect | Yes |
| `/dashboard/network/my-team` | MyTeam | Yes |
| `/dashboard/network/generation-tree` | GenerationTree | Yes |
| `/dashboard/network/level-info` | LevelInfo | Yes |
| `/dashboard/refer` | ReferAndEarn | Yes |

## Key Configuration

**Backend** (`backend/src/main/resources/application.yml`):
- All secrets via environment variables (see `.env.example`)
- DB: `${DB_URL}`, `${DB_USERNAME}`, `${DB_PASSWORD}` (defaults to localhost postgres)
- Mail: `${MAIL_USERNAME}`, `${MAIL_PASSWORD}` (required, no defaults)
- JWT: `${JWT_SECRET}` (has default, override in production)
- Admin: `${ADMIN_EMAIL}`, `${ADMIN_PASSWORD}`, `${ADMIN_NAME}` (has defaults)
- JWT expiry: 24 hours

**Frontend**:
- Dev server: port 5173
- Auth API: `http://localhost:8080/api/auth`
- User API: `http://localhost:8080/api/user` (auto-attaches JWT Bearer header)
- CORS allowed origins: `localhost:5173`, `localhost:3000`

## How to Run

```bash
# 1. Create fresh PostgreSQL database (IMPORTANT: drop old DB if migrating from email-based auth)
psql -U postgres -c "DROP DATABASE IF EXISTS property_empire;"
psql -U postgres -c "CREATE DATABASE property_empire;"

# 2. Set environment variables (see .env.example for all options)
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-gmail-app-password

# 3. Start backend
cd backend && mvn spring-boot:run

# 4. Start frontend
cd frontend && npm run dev
```

**If migrating an existing database** (instead of fresh DB), run:
```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS uk_6dotkott2kjsp8vw4d0m25fb7;  -- Hibernate-generated name
```

## Design System

- **Theme:** Dark luxury — near-black backgrounds, green & gold accents
- **Primary green:** `#0B6623` | **Gold:** `#D4AF37` / `#C5A55A` | **Background:** `#0a0f1a`
- **Cards:** Glassmorphism with backdrop-filter, gold border glow
- **Buttons:** Gold gradient, dark text, shimmer on hover
- **Sidebar:** Dark gradient (#0d1220 → #131b2e), gold accents on active items
- **Tables:** Dark theme, alternating row opacity, gold header accents
- **Tree:** CSS-only connector lines, green/blue avatar circles, expand/collapse
- **Country Code Select:** Dark bg, matching border/focus styles
- **CSS variables in:** `frontend/src/styles/auth.css` and `frontend/src/styles/dashboard.css`

## Conventions

- All API responses wrapped in `ApiResponse { success, message, data }`
- Frontend accesses response data via `res.data.data` (axios response → ApiResponse → data)
- Auth state managed via React Context (`AuthContext`)
- JWT stored in localStorage, subject = TPE ID, auto-attached by `api/user.js` interceptor
- 401 responses trigger auto-logout + redirect to /login
- No Lombok — Java 26 incompatibility
- Network traversal uses BFS with depth limits (10 for team, 5 for tree)
- OTP linked to tpeId, not email — enables duplicate emails
- Email sending is @Async — fire-and-forget, errors logged but don't block the flow
- Phone numbers: max 10 digits, stored separately from country code

## What's Next (TODO)

- [x] Auth module (login, signup, OTP, forgot password)
- [x] User dashboard with stats
- [x] Network pages (My Direct, My Team, Generation Tree, Level Info)
- [x] Profile management (view/edit)
- [x] Referral sharing (link copy, WhatsApp, Telegram, Email)
- [x] TPE ID system (unique ID per user, login by ID, country code, registration success page)
- [x] Real email sending (SMTP configured, OTP + welcome emails)
- [ ] Admin dashboard (manage users, view all networks)
- [ ] Referral bonus/commission system
- [ ] KYC verification
- [ ] Payment integration / wallet system
- [ ] Deployment configuration
