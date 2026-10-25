# The Property Empire (TPE) - MLM Application

> **IMPORTANT:** Read this file at the start of every conversation. Update it after every task to keep it current.

## Project Overview

MLM (multi-level marketing) web application for The Property Empire — a luxury real estate platform with referral bonuses. Single admin user, multiple regular users, referral/sponsor system.

**Client:** The Property Empire
**Status:** Auth + Dashboard + Network + TPE ID + Admin features + Refresh tokens + Excel export complete
**Git Repo:** https://github.com/saty17/ThePropertyEmpire.git (identity: Maurya Umesh / mauryau103@gmail.com)

## Tech Stack

| Layer    | Technology                  | Version  |
|----------|-----------------------------|----------|
| Frontend | React + Vite                | React 19, Vite 8.3 |
| Backend  | Spring Boot + Spring Security | 3.4.4   |
| Database | PostgreSQL                  | Local (Supabase for prod planned) |
| Auth     | JWT (HS512, jjwt 0.12.6)   | Stateless, refresh tokens |
| Email    | Spring Mail (Gmail SMTP)    | Async, real sending |
| Excel    | SheetJS (xlsx)              | Frontend export |
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
- **Login:** OTP-based — TPE ID + password → OTP sent to email → verify OTP → JWT + refresh token issued
- **OTP types:** `LOGIN`, `FORGOT_PASSWORD` (no REGISTRATION OTP)
- **OTP expiry:** 10 minutes, hardcoded in `OtpService.OTP_EXPIRY_MINUTES` and email template in `EmailService`
- **JWT:** Access token (15 min, 900000ms) + refresh token (7 days, stored in `refresh_tokens` DB table)
- **Token refresh flow:** Access token expires → frontend interceptor catches 401 → calls `/api/auth/refresh-token` → gets new access + refresh tokens → retries original request silently. Queues concurrent requests during refresh. If refresh token also expired → clears storage → redirects to /login with "Session expired" toast.
- **Session expiry handling:** Backend `SecurityConfig` has custom `AuthenticationEntryPoint` returning 401 (not default 403) for unauthenticated requests. Frontend `Login.jsx` checks `session_expired` localStorage flag on mount.
- **User status:** `AccountStatus` enum (ACTIVE/INACTIVE), defaults to INACTIVE
- **Activation:** `activationDate` field, set when user makes first transaction (future wallet feature)
- **Admin seeding:** Checks `existsByRole(Role.ADMIN)` — creates admin only if no admin exists

## Scheduled Tasks

- **`CleanupScheduler`** — Runs every 6 hours (`0 0 */6 * * *`), deletes expired OTPs and expired refresh tokens from DB
- Enabled via `@EnableScheduling` on main application class

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
│       ├── ThePropertyEmpireApplication.java  ← @EnableAsync, @EnableScheduling
│       ├── config/
│       │   ├── CleanupScheduler.java     ← Cron: cleanup expired OTPs + refresh tokens every 6h
│       │   ├── DataInitializer.java      ← Seeds admin, checks by Role.ADMIN
│       │   └── SecurityConfig.java       ← CORS, JWT filter, BCrypt, AuthenticationEntryPoint (401)
│       ├── controller/
│       │   ├── AuthController.java       ← /api/auth/** (public: login, verify-login-otp, refresh-token, etc.)
│       │   └── UserController.java       ← /api/user/** (JWT protected, rootCode param, admin endpoints)
│       ├── dto/
│       │   ├── ApiResponse.java          ← { success, message, data }
│       │   ├── AuthResponse.java         ← { token, refreshToken, email, fullName, role, tpeId }
│       │   ├── DashboardDTO.java         ← { ..., status, totalSystemUsers, independentMembers }
│       │   ├── ForgotPasswordRequest.java ← { userId } (TPE ID)
│       │   ├── LevelInfoDTO.java         ← { level, memberCount }
│       │   ├── LoginRequest.java         ← { userId, password } (TPE ID)
│       │   ├── RegistrationSuccessDTO.java ← { tpeId, fullName, email, countryCode, mobile, joinedDate }
│       │   ├── RefreshTokenRequest.java   ← { refreshToken }
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
│       │   ├── RefreshToken.java         ← token (unique UUID), tpeId, expiresAt
│       │   └── User.java                ← tpeId (unique), status (AccountStatus), activationDate
│       ├── enums/
│       │   ├── AccountStatus.java        ← ACTIVE, INACTIVE
│       │   ├── OtpType.java             ← LOGIN, FORGOT_PASSWORD
│       │   └── Role.java                ← ADMIN, USER
│       ├── exception/
│       │   └── GlobalExceptionHandler.java
│       ├── repository/
│       │   ├── OtpRepository.java       ← findByTpeId lookups, deleteByExpiresAtBefore
│       │   ├── RefreshTokenRepository.java ← findByToken, deleteByTpeId, deleteByExpiresAtBefore
│       │   └── UserRepository.java      ← findByTpeId, findByRole, countByRole, existsByRole
│       ├── security/
│       │   ├── CustomUserDetailsService.java ← loads by tpeId
│       │   ├── JwtAuthenticationFilter.java  ← extracts TPE ID from JWT
│       │   └── JwtTokenProvider.java         ← generateToken(String userId), JWT subject = TPE ID
│       └── service/
│           ├── AuthService.java          ← signup, login (OTP), verifyLoginOtp, refreshToken, forgotPassword, resetPassword
│           ├── EmailService.java         ← @Async, sendOtpEmail, sendWelcomeEmail (no OTP logged)
│           ├── NetworkService.java       ← BFS traversal, tree, level info, getAllMembers, getLevelMembers (sponsorName populated)
│           ├── OtpService.java           ← saveOtp, verifyOtp, cleanupExpiredOtps (10 min expiry)
│           ├── RefreshTokenService.java  ← create, find, delete, cleanupExpiredTokens
│           └── UserService.java          ← profile CRUD, dashboard (admin stats included)
└── frontend/
    ├── package.json                      ← Includes xlsx (SheetJS) for Excel export
    ├── vite.config.js
    ├── public/assets/
    └── src/
        ├── App.jsx                       ← All routes including /all-members
        ├── main.jsx                      ← BrowserRouter + AuthProvider + Toaster
        ├── index.css
        ├── api/
        │   ├── auth.js                   ← Auth API (signup, login, verifyLoginOtp, refreshToken, verifyOtp, resendOtp, ...)
        │   └── user.js                   ← User API (rootCode params, silent 401 refresh interceptor with queue)
        ├── context/
        │   └── AuthContext.jsx           ← Auth state: user, token, refreshToken, login(), logout(), updateUser()
        ├── data/
        │   └── countryCodes.js           ← Static COUNTRY_CODES array (41 countries)
        ├── components/
        │   ├── AuthLayout.jsx            ← Auth page wrapper (dark bg + card + logo)
        │   ├── DashboardLayout.jsx       ← Sidebar + topbar, ordered nav (admin sees All Members after Network)
        │   └── ProtectedRoute.jsx        ← Redirects to /login if unauthenticated
        ├── pages/
        │   ├── Login.jsx                 ← TPE ID + password, session_expired toast on mount
        │   ├── Signup.jsx                ← Direct registration, no OTP, redirect to RegistrationSuccess
        │   ├── VerifyOtp.jsx             ← Handles login OTP (→ JWT → dashboard) and forgot-password OTP
        │   ├── ForgotPassword.jsx        ← Enter TPE ID → OTP sent to email
        │   ├── ResetPassword.jsx         ← Uses TPE ID
        │   ├── RegistrationSuccess.jsx   ← Shows user details + login button + email notice
        │   └── dashboard/
        │       ├── Home.jsx              ← Stats grid (admin: Total Users, Independent Members)
        │       ├── Profile.jsx           ← Country code dropdown in edit mode
        │       ├── MyDirect.jsx          ← rootCode nav state support, back button when viewing other user
        │       ├── MyTeam.jsx            ← rootCode nav state support, back button when viewing other user
        │       ├── GenerationTree.jsx    ← rootCode + rootName nav state, admin TPE ID search
        │       ├── LevelInfo.jsx         ← rootCode nav state, action menu per member row in drill-down
        │       ├── AllMembers.jsx        ← Admin: filters, search, date range, sponsor search, Excel export, pagination, action menu
        │       └── ReferAndEarn.jsx
        └── styles/
            ├── auth.css                  ← Auth pages theme + registration success + phone input styles
            └── dashboard.css             ← Dashboard + filters + action menu + pagination + date filters
```

## API Endpoints

### Auth (public — `/api/auth/**`)

| Method | Endpoint                          | Request Key Fields                        | Purpose                          |
|--------|-----------------------------------|-------------------------------------------|----------------------------------|
| POST   | `/api/auth/signup`                | fullName, email, countryCode, mobile, password, confirmPassword, sponsorId? | Register (no OTP), returns user details |
| POST   | `/api/auth/login`                 | userId (TPE ID), password                 | Validate credentials, send OTP to email |
| POST   | `/api/auth/verify-login-otp`      | tpeId, otp                                | Verify login OTP, returns JWT + refresh token + user info |
| POST   | `/api/auth/verify-otp`            | tpeId, otp                                | Verify forgot-password OTP       |
| POST   | `/api/auth/forgot-password`       | userId (TPE ID)                           | Send reset OTP to user's email   |
| POST   | `/api/auth/reset-password`        | userId, otp, newPassword, confirmNewPassword | Verify OTP + set new password  |
| POST   | `/api/auth/refresh-token`         | refreshToken                              | Get new access + refresh tokens (returns 401 if expired) |
| POST   | `/api/auth/resend-otp`            | tpeId, otpType (LOGIN/FORGOT_PASSWORD)    | Resend OTP                       |
| GET    | `/api/auth/validate-sponsor/{code}` |                                         | Validate referral code           |

### User (JWT protected — `/api/user/**`)

| Method | Endpoint                          | Purpose                          |
|--------|-----------------------------------|----------------------------------|
| GET    | `/api/user/profile`               | Get current user profile         |
| PUT    | `/api/user/profile`               | Update name/mobile/countryCode   |
| GET    | `/api/user/dashboard`             | Dashboard stats (admin: includes totalSystemUsers, independentMembers) |
| GET    | `/api/user/my-directs?rootCode=X` | Direct referrals (optional rootCode to view any user's directs) |
| GET    | `/api/user/my-team?rootCode=X`    | All team members (BFS, optional rootCode) |
| GET    | `/api/user/generation-tree?rootCode=X` | Recursive tree (optional rootCode) |
| GET    | `/api/user/level-info?rootCode=X` | Member count per level (optional rootCode) |
| GET    | `/api/user/level-members?level=X&rootCode=Y` | Members at a specific level (optional rootCode) |
| GET    | `/api/user/all-members?filter=X`  | **Admin only.** Filter: ALL, MY_NETWORK, INDEPENDENT |
| GET    | `/api/user/referral-link`         | Get formatted referral link      |

## Auth Flows

**Registration:** Signup → Account created (enabled=true, status=INACTIVE) → Welcome email → Registration Success page → Login
**Login:** TPE ID + password → OTP sent to email → Verify OTP → JWT + refresh token issued → Dashboard
**Token Refresh:** Access token expires (15 min) → frontend auto-calls `/api/auth/refresh-token` → new tokens issued → original request retried silently. Refresh token expires (7 days) → user redirected to login with "Session expired" toast.
**Forgot Password:** Enter TPE ID → OTP sent to registered email → Enter OTP + new password → Reset
**Referral:** Each user gets TPE ID. Share via link `?ref=TPEXXXXXXX`, WhatsApp, Telegram, Email.
**Network:** BFS traversal from user's tpeId. Tree built recursively. Level = depth from user.

## Admin Features

- **Dashboard:** Extra stat cards — Total Users, Independent Members
- **All Members page:** Filter tabs (All/My Network/Independent), text search (TPE ID/name/email), sponsor ID search (hidden in Independent tab), date range filters (Joined/Activation), Excel export of filtered data, pagination (configurable PAGE_SIZE, currently 5 for testing — change to 100 for prod), action dropdown per row.
- **Action menu (3-dot dropdown):** View Tree, View Direct, View Team, Level Info. Available on All Members + Level Info drill-down tables. Navigates with `rootCode` + `rootName` in state.
- **Network drill-down:** All network pages (My Direct, My Team, Generation Tree, Level Info) accept `rootCode` query param — admin or any user can view another user's network. Shows user name in title + Back button.
- **Generation Tree:** Admin search box to enter any TPE ID and view their tree
- **Independent tab:** Hides Sponsor ID and Sponsor Name columns + sponsor search since they're always empty
- **Sidebar order:** Dashboard, Profile, Network, All Members (admin only), Refer & Earn, Settings, Support
- **Admin-only endpoint:** `GET /api/user/all-members` returns 403 for non-admin users

## Frontend Routes

| Path | Component | Auth? | Admin? |
|------|-----------|-------|--------|
| `/login` | Login (TPE ID, session expired toast) | No | — |
| `/signup` | Signup (with country code) | No | — |
| `/verify-otp` | VerifyOtp (login/forgot flows) | No | — |
| `/forgot-password` | ForgotPassword (TPE ID) | No | — |
| `/reset-password` | ResetPassword (TPE ID) | No | — |
| `/registration-success` | RegistrationSuccess | No | — |
| `/dashboard` | Home | Yes | No |
| `/dashboard/profile` | Profile (with country code) | Yes | No |
| `/dashboard/network/my-direct` | MyDirect (rootCode support) | Yes | No |
| `/dashboard/network/my-team` | MyTeam (rootCode support) | Yes | No |
| `/dashboard/network/generation-tree` | GenerationTree (rootCode + admin search) | Yes | No |
| `/dashboard/network/level-info` | LevelInfo (rootCode + action menu) | Yes | No |
| `/dashboard/refer` | ReferAndEarn | Yes | No |
| `/dashboard/all-members` | AllMembers (filters + export + pagination) | Yes | Yes |

## Key Configuration

**Backend** (`backend/src/main/resources/application.yml`):
- All secrets via environment variables (see `.env.example`)
- Spring profile: defaults to `local` (`application-local.yml` for dev secrets, gitignored)
- DB: `${DB_URL}`, `${DB_USERNAME}`, `${DB_PASSWORD}` (defaults to localhost postgres)
- Mail: `${MAIL_USERNAME}`, `${MAIL_PASSWORD}` (required, no defaults — use `application-local.yml` for IDE run)
- JWT: `${JWT_SECRET}` (has default, override in production)
- Admin: `${ADMIN_EMAIL}`, `${ADMIN_PASSWORD}`, `${ADMIN_NAME}` (has defaults)
- Access token expiry: 15 minutes (900000ms) — `app.jwt.expiration`
- Refresh token expiry: 7 days — `app.jwt.refresh-expiration-days` / `REFRESH_TOKEN_EXPIRY_DAYS`
- OTP expiry: 10 minutes — hardcoded in `OtpService`
- Cleanup scheduler: every 6 hours — `CleanupScheduler`
- `open-in-view: false` (production best practice)

**Frontend**:
- Dev server: port 5173
- Auth API: `http://localhost:8080/api/auth`
- User API: `http://localhost:8080/api/user` (auto-attaches JWT Bearer header, silent refresh on 401)
- CORS allowed origins: `localhost:5173`, `localhost:3000`
- AllMembers PAGE_SIZE: currently 5 (testing) — **change to 100 for production** in `AllMembers.jsx`

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
- **Action menu:** Dark dropdown (#1a1f2e), gold hover, 3-dot trigger button
- **Date filters:** Dark input with calendar icon, inline row layout
- **Pagination:** Gold-bordered prev/next buttons, centered info text
- **Search bars:** Dark bg, subtle border, icon prefix
- **CSS variables in:** `frontend/src/styles/auth.css` and `frontend/src/styles/dashboard.css`

## Conventions

- All API responses wrapped in `ApiResponse { success, message, data }`
- Frontend accesses response data via `res.data.data` (axios response → ApiResponse → data)
- Auth state managed via React Context (`AuthContext`), user object has `role` field
- JWT + refresh token stored in localStorage, access token auto-attached by `api/user.js` interceptor
- 401 responses trigger silent token refresh with request queueing; if refresh fails, redirect to /login with "Session expired" toast
- Admin-only features check `user.role === 'ADMIN'` (frontend) or `user.getRole() == Role.ADMIN` (backend)
- No Lombok — Java 26 incompatibility
- Network traversal uses BFS with depth limits (10 for team, 5 for tree)
- All network endpoints support optional `rootCode` param to view any user's data; `resolveRootCode()` helper in UserController
- `sponsorName` is resolved and populated in `getTeamMembers()`, `getDirectReferrals()`, `getAllMembers()`, and `getLevelMembers()`
- OTP linked to tpeId, not email — enables duplicate emails
- OTP types: LOGIN (for login flow), FORGOT_PASSWORD (for password reset)
- Email sending is @Async — fire-and-forget, errors logged but don't block the flow
- Phone numbers: max 10 digits, stored separately from country code
- Secrets externalized: `application-local.yml` (gitignored) for IDE, env vars for terminal/production
- `findByEmail` returns `List<User>` (not Optional) since email is not unique
- Date filtering: backend sends "dd MMM yyyy" format; frontend uses `toLocalDate()` helper to avoid UTC/local timezone mismatch when comparing with HTML date input values
- Excel export uses SheetJS (`xlsx`), exports only the currently filtered data, respects column visibility (e.g., no sponsor columns in Independent)
- Sidebar nav order: Dashboard, Profile, Network, All Members (admin), Refer & Earn, Settings, Support

## What's Next (TODO)

- [x] Auth module (login with OTP, signup direct, forgot password)
- [x] User dashboard with stats
- [x] Network pages (My Direct, My Team, Generation Tree, Level Info)
- [x] Level Info drill-down (click level → member table with action menu)
- [x] Profile management (view/edit)
- [x] Referral sharing (link copy, WhatsApp, Telegram, Email)
- [x] TPE ID system (unique ID per user, login by ID, country code, registration success page)
- [x] Real email sending (SMTP configured, OTP + welcome emails, no OTP in logs)
- [x] User status system (ACTIVE/INACTIVE, activationDate field)
- [x] Admin features (All Members page with filters/search/export, tree search, dashboard stats)
- [x] Network drill-down (action menu: View Tree/Direct/Team/Level Info for any user)
- [x] Secrets externalized (env vars + Spring profiles, .env.example, application-local.yml)
- [x] Git repo setup (GitHub, .gitignore, proper git identity)
- [x] JWT refresh token system (15 min access + 7 day refresh, silent refresh, request queueing)
- [x] Session expiry handling (401 entry point, redirect to login with toast)
- [x] Scheduled cleanup (expired OTPs + refresh tokens, every 6 hours)
- [x] Excel export (filtered data, SheetJS)
- [x] Pagination (All Members, configurable page size)
- [x] Sponsor ID search filter (All Members, hidden in Independent tab)
- [ ] Change AllMembers PAGE_SIZE from 5 (testing) to 100 (production)
- [ ] Referral bonus/commission system
- [ ] KYC verification
- [ ] Payment integration / wallet system (activates user status)
- [ ] Settings page (currently placeholder in sidebar)
- [ ] Support page (currently placeholder in sidebar)
- [ ] Deployment configuration (Supabase for DB planned)
