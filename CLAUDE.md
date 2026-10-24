# The Property Empire (TPE) - MLM Application

> **IMPORTANT:** Read this file at the start of every conversation. Update it after every task to keep it current.

## Project Overview

MLM (multi-level marketing) web application for The Property Empire — a luxury real estate platform with referral bonuses. Single admin user, multiple regular users, referral/sponsor system.

**Client:** The Property Empire
**Status:** Auth + Dashboard + Network + TPE ID + Admin features complete

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
- Forgot password and reset password use TPE ID
- JWT subject contains TPE ID (not email)
- `SecurityContextHolder.getContext().getAuthentication().getName()` returns TPE ID

## Auth System

- **Registration:** No OTP — account created directly, welcome email sent, redirect to success page
- **Login:** OTP-based — TPE ID + password → OTP sent to email → verify OTP → JWT issued
- **OTP types:** `LOGIN`, `FORGOT_PASSWORD` (no REGISTRATION OTP)
- **User status:** `AccountStatus` enum (ACTIVE/INACTIVE), defaults to INACTIVE
- **Activation:** `activationDate` field, set when user makes first transaction (future wallet feature)
- **Admin seeding:** Checks `existsByRole(Role.ADMIN)` — creates admin only if no admin exists

## Project Structure

```
ThePropertyEmpire/
├── CLAUDE.md
├── .gitignore
├── .env.example                  ← Documents all required env vars
├── CompanyLogo.jpeg
├── Welcome Poster.jpeg
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/tpe/propertyempire/
│       ├── ThePropertyEmpireApplication.java  ← @EnableAsync
│       ├── config/
│       │   ├── DataInitializer.java      ← Seeds admin, checks by Role.ADMIN
│       │   └── SecurityConfig.java       ← CORS, JWT filter, BCrypt
│       ├── controller/
│       │   ├── AuthController.java       ← /api/auth/** (public, includes verify-login-otp)
│       │   └── UserController.java       ← /api/user/** (JWT protected, admin endpoints)
│       ├── dto/
│       │   ├── ApiResponse.java          ← { success, message, data }
│       │   ├── AuthResponse.java         ← { token, email, fullName, role, tpeId }
│       │   ├── DashboardDTO.java         ← { ..., status, totalSystemUsers, independentMembers }
│       │   ├── ForgotPasswordRequest.java ← { userId } (TPE ID)
│       │   ├── LevelInfoDTO.java         ← { level, memberCount }
│       │   ├── LoginRequest.java         ← { userId, password } (TPE ID)
│       │   ├── RegistrationSuccessDTO.java ← { tpeId, fullName, email, countryCode, mobile, joinedDate }
│       │   ├── ResendOtpRequest.java     ← { tpeId, otpType }
│       │   ├── ResetPasswordRequest.java ← { userId, otp, newPassword, confirmNewPassword }
│       │   ├── SignupRequest.java        ← { fullName, email, countryCode, mobile, password, ... }
│       │   ├── TeamMemberDTO.java        ← { ..., sponsorName, status, activationDate }
│       │   ├── TreeNodeDTO.java
│       │   ├── UpdateProfileRequest.java ← { fullName?, mobile?, countryCode? }
│       │   ├── UserProfileDTO.java       ← { ..., status, activationDate }
│       │   └── VerifyOtpRequest.java     ← { tpeId, otp, otpType? }
│       ├── entity/
│       │   ├── Otp.java                  ← email + tpeId fields
│       │   └── User.java                ← tpeId (unique), status (AccountStatus), activationDate
│       ├── enums/
│       │   ├── AccountStatus.java        ← ACTIVE, INACTIVE
│       │   ├── OtpType.java             ← LOGIN, FORGOT_PASSWORD
│       │   └── Role.java                ← ADMIN, USER
│       ├── exception/
│       │   └── GlobalExceptionHandler.java
│       ├── repository/
│       │   ├── OtpRepository.java       ← findByTpeId lookups
│       │   └── UserRepository.java      ← findByTpeId, findByRole, countByRole, existsByRole
│       ├── security/
│       │   ├── CustomUserDetailsService.java ← loads by tpeId
│       │   ├── JwtAuthenticationFilter.java  ← extracts TPE ID from JWT
│       │   └── JwtTokenProvider.java         ← generateToken(String userId), JWT subject = TPE ID
│       └── service/
│           ├── AuthService.java          ← signup (direct), login (OTP), verifyLoginOtp, forgotPassword, resetPassword
│           ├── EmailService.java         ← @Async, sendOtpEmail, sendWelcomeEmail (no OTP logged)
│           ├── NetworkService.java       ← BFS traversal, tree, level info, getAllMembers, getLevelMembers
│           ├── OtpService.java           ← saveOtp(tpeId, ...), verifyOtp(tpeId, ...)
│           └── UserService.java          ← profile CRUD, dashboard (admin stats included)
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── public/assets/
    └── src/
        ├── App.jsx                       ← All routes including /all-members
        ├── main.jsx                      ← BrowserRouter + AuthProvider + Toaster
        ├── index.css
        ├── api/
        │   ├── auth.js                   ← Auth API (signup, login, verifyLoginOtp, verifyOtp, resendOtp, ...)
        │   └── user.js                   ← User API (getAllMembers, getLevelMembers, ...)
        ├── context/
        │   └── AuthContext.jsx           ← Auth state: user, token, login(), logout(), updateUser()
        ├── data/
        │   └── countryCodes.js           ← Static COUNTRY_CODES array (41 countries)
        ├── components/
        │   ├── AuthLayout.jsx            ← Auth page wrapper (dark bg + card + logo)
        │   ├── DashboardLayout.jsx       ← Sidebar + topbar, dynamic nav (admin sees All Members)
        │   └── ProtectedRoute.jsx        ← Redirects to /login if unauthenticated
        ├── pages/
        │   ├── Login.jsx                 ← TPE ID + password → OTP sent → redirect to VerifyOtp
        │   ├── Signup.jsx                ← Direct registration, no OTP, redirect to RegistrationSuccess
        │   ├── VerifyOtp.jsx             ← Handles login OTP (→ JWT → dashboard) and forgot-password OTP
        │   ├── ForgotPassword.jsx        ← Enter TPE ID → OTP sent to email
        │   ├── ResetPassword.jsx         ← Uses TPE ID
        │   ├── RegistrationSuccess.jsx   ← Shows user details + login button + email notice
        │   └── dashboard/
        │       ├── Home.jsx              ← Stats grid (admin: Total Users, Independent Members)
        │       ├── Profile.jsx           ← Country code dropdown in edit mode
        │       ├── MyDirect.jsx          ← Shows countryCode + phone
        │       ├── MyTeam.jsx
        │       ├── GenerationTree.jsx    ← Admin: TPE ID search to view any user's tree
        │       ├── LevelInfo.jsx         ← Clickable levels → expands member table
        │       ├── AllMembers.jsx        ← Admin-only: filter tabs (All/My Network/Independent) + search
        │       └── ReferAndEarn.jsx
        └── styles/
            ├── auth.css                  ← Auth pages theme + registration success + phone input styles
            └── dashboard.css             ← Dashboard + filter tabs + search bar + status badges + mobile cards
```

## API Endpoints

### Auth (public — `/api/auth/**`)

| Method | Endpoint                          | Request Key Fields                        | Purpose                          |
|--------|-----------------------------------|-------------------------------------------|----------------------------------|
| POST   | `/api/auth/signup`                | fullName, email, countryCode, mobile, password, confirmPassword, sponsorId? | Register (no OTP), returns user details |
| POST   | `/api/auth/login`                 | userId (TPE ID), password                 | Validate credentials, send OTP to email |
| POST   | `/api/auth/verify-login-otp`      | tpeId, otp                                | Verify login OTP, returns JWT + user info |
| POST   | `/api/auth/verify-otp`            | tpeId, otp                                | Verify forgot-password OTP       |
| POST   | `/api/auth/forgot-password`       | userId (TPE ID)                           | Send reset OTP to user's email   |
| POST   | `/api/auth/reset-password`        | userId, otp, newPassword, confirmNewPassword | Verify OTP + set new password  |
| POST   | `/api/auth/resend-otp`            | tpeId, otpType (LOGIN/FORGOT_PASSWORD)    | Resend OTP                       |
| GET    | `/api/auth/validate-sponsor/{code}` |                                         | Validate referral code           |

### User (JWT protected — `/api/user/**`)

| Method | Endpoint                          | Purpose                          |
|--------|-----------------------------------|----------------------------------|
| GET    | `/api/user/profile`               | Get current user profile         |
| PUT    | `/api/user/profile`               | Update name/mobile/countryCode   |
| GET    | `/api/user/dashboard`             | Dashboard stats (admin: includes totalSystemUsers, independentMembers) |
| GET    | `/api/user/my-directs`            | Direct referrals list            |
| GET    | `/api/user/my-team`               | All team members (BFS, max 10 levels) |
| GET    | `/api/user/generation-tree`       | Recursive tree (max 5 levels)    |
| GET    | `/api/user/generation-tree?rootCode=X` | View any user's tree (admin)  |
| GET    | `/api/user/level-info`            | Member count per network level   |
| GET    | `/api/user/level-members?level=X` | Members at a specific level      |
| GET    | `/api/user/all-members?filter=X`  | **Admin only.** Filter: ALL, MY_NETWORK, INDEPENDENT |
| GET    | `/api/user/referral-link`         | Get formatted referral link      |

## Auth Flows

**Registration:** Signup → Account created (enabled=true, status=INACTIVE) → Welcome email → Registration Success page → Login
**Login:** TPE ID + password → OTP sent to email → Verify OTP → JWT issued → Dashboard
**Forgot Password:** Enter TPE ID → OTP sent to registered email → Enter OTP + new password → Reset
**Referral:** Each user gets TPE ID. Share via link `?ref=TPEXXXXXXX`, WhatsApp, Telegram, Email.
**Network:** BFS traversal from user's tpeId. Tree built recursively. Level = depth from user.

## Admin Features

- **Dashboard:** Extra stat cards — Total Users, Independent Members
- **All Members page:** Table with filter tabs (All Members / My Network / Independent), search by TPE ID/name/email, columns include Status and Activation Date
- **Generation Tree:** Search box to enter any TPE ID and view their tree
- **Level Info:** Clickable levels expand to show member details (Sr.No, User ID, Name, Sponsor ID, Sponsor Name, Status)
- **Sidebar:** Admin sees "All Members" nav item; regular users don't
- **Admin-only endpoint:** `GET /api/user/all-members` returns 403 for non-admin users

## Frontend Routes

| Path | Component | Auth? | Admin? |
|------|-----------|-------|--------|
| `/login` | Login (TPE ID) | No | — |
| `/signup` | Signup (with country code) | No | — |
| `/verify-otp` | VerifyOtp (login/forgot flows) | No | — |
| `/forgot-password` | ForgotPassword (TPE ID) | No | — |
| `/reset-password` | ResetPassword (TPE ID) | No | — |
| `/registration-success` | RegistrationSuccess | No | — |
| `/dashboard` | Home | Yes | No |
| `/dashboard/profile` | Profile (with country code) | Yes | No |
| `/dashboard/network/my-direct` | MyDirect | Yes | No |
| `/dashboard/network/my-team` | MyTeam | Yes | No |
| `/dashboard/network/generation-tree` | GenerationTree (admin: TPE ID search) | Yes | No |
| `/dashboard/network/level-info` | LevelInfo (expandable levels) | Yes | No |
| `/dashboard/refer` | ReferAndEarn | Yes | No |
| `/dashboard/all-members` | AllMembers (filter tabs + search) | Yes | Yes |

## Key Configuration

**Backend** (`backend/src/main/resources/application.yml`):
- All secrets via environment variables (see `.env.example`)
- Spring profile: defaults to `local` (`application-local.yml` for dev secrets, gitignored)
- DB: `${DB_URL}`, `${DB_USERNAME}`, `${DB_PASSWORD}` (defaults to localhost postgres)
- Mail: `${MAIL_USERNAME}`, `${MAIL_PASSWORD}` (required, no defaults — use `application-local.yml` for IDE run)
- JWT: `${JWT_SECRET}` (has default, override in production)
- Admin: `${ADMIN_EMAIL}`, `${ADMIN_PASSWORD}`, `${ADMIN_NAME}` (has defaults)
- JWT expiry: 24 hours
- `open-in-view: false` (production best practice)

**Frontend**:
- Dev server: port 5173
- Auth API: `http://localhost:8080/api/auth`
- User API: `http://localhost:8080/api/user` (auto-attaches JWT Bearer header)
- CORS allowed origins: `localhost:5173`, `localhost:3000`

## How to Run

```bash
# 1. Create fresh PostgreSQL database
psql -U postgres -c "DROP DATABASE IF EXISTS property_empire;"
psql -U postgres -c "CREATE DATABASE property_empire;"

# 2. Configure secrets (Option A: application-local.yml for IDE run button)
# Create backend/src/main/resources/application-local.yml (gitignored):
# spring:
#   mail:
#     username: your-email@gmail.com
#     password: your-gmail-app-password

# 2. Configure secrets (Option B: env vars for terminal)
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD="your-gmail-app-password"

# 3. Start backend
cd backend && mvn spring-boot:run

# 4. Start frontend
cd frontend && npm run dev
```

## Design System

- **Theme:** Dark luxury — near-black backgrounds, green & gold accents
- **Primary green:** `#0B6623` | **Gold:** `#D4AF37` / `#C5A55A` | **Background:** `#0a0f1a`
- **Cards:** Glassmorphism with backdrop-filter, gold border glow
- **Buttons:** Gold gradient, dark text, shimmer on hover
- **Sidebar:** Dark gradient (#0d1220 → #131b2e), gold accents on active items
- **Tables:** Dark theme, alternating row opacity, gold header accents
- **Tree:** CSS-only connector lines, green/blue avatar circles, expand/collapse
- **Filter tabs:** Gold border on active, count badge
- **Status badges:** Green (Active), Orange (Inactive)
- **Search bar:** Dark bg, subtle border, icon prefix
- **CSS variables in:** `frontend/src/styles/auth.css` and `frontend/src/styles/dashboard.css`

## Conventions

- All API responses wrapped in `ApiResponse { success, message, data }`
- Frontend accesses response data via `res.data.data` (axios response → ApiResponse → data)
- Auth state managed via React Context (`AuthContext`), user object has `role` field
- JWT stored in localStorage, subject = TPE ID, auto-attached by `api/user.js` interceptor
- 401 responses trigger auto-logout + redirect to /login
- Admin-only features check `user.role === 'ADMIN'` (frontend) or `user.getRole() == Role.ADMIN` (backend)
- No Lombok — Java 26 incompatibility
- Network traversal uses BFS with depth limits (10 for team, 5 for tree)
- OTP linked to tpeId, not email — enables duplicate emails
- OTP types: LOGIN (for login flow), FORGOT_PASSWORD (for password reset)
- Email sending is @Async — fire-and-forget, errors logged but don't block the flow
- Phone numbers: max 10 digits, stored separately from country code
- Secrets externalized: `application-local.yml` (gitignored) for IDE, env vars for terminal/production
- `findByEmail` returns `List<User>` (not Optional) since email is not unique

## What's Next (TODO)

- [x] Auth module (login with OTP, signup direct, forgot password)
- [x] User dashboard with stats
- [x] Network pages (My Direct, My Team, Generation Tree, Level Info)
- [x] Level Info drill-down (click level → member table)
- [x] Profile management (view/edit)
- [x] Referral sharing (link copy, WhatsApp, Telegram, Email)
- [x] TPE ID system (unique ID per user, login by ID, country code, registration success page)
- [x] Real email sending (SMTP configured, OTP + welcome emails, no OTP in logs)
- [x] User status system (ACTIVE/INACTIVE, activationDate field)
- [x] Admin features (All Members page, tree search, dashboard stats)
- [x] Secrets externalized (env vars + Spring profiles, .env.example, application-local.yml)
- [x] Git repo setup (GitHub, .gitignore, proper git identity)
- [ ] Referral bonus/commission system
- [ ] KYC verification
- [ ] Payment integration / wallet system (activates user status)
- [ ] Deployment configuration
