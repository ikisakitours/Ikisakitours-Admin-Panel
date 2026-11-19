# Ikisaki Tours — Backend Integration & API Alignment Specifications
### Scope: Tasks Initiated on November 19, 2026 (07:45 AM Onwards)

> **Audience:** Backend Engineering Agent / Developer  
> **Status:** Active Implementation & Verification  
> **Date:** November 19, 2026

This specification covers only the backend alignments and API contracts for the modules updated today (November 19, 2026 from 07:45 AM onwards):
1. **Tour Services & Transportation Requests** (`/services`)
2. **Vehicle Service Guidelines & Specifications** (`/services/notes`)
3. **Reviews & Guest Feedback** (`/comments` & `/package-reviews`)
4. **Contact Inquiries & Messages** (`/contact`)


---

## 1. Tour Services & Transportation Requests (`/services`)

Manages incoming service requests for:
- `custom` (Custom Tour Planning)
- `chauffeur` (Private Chauffeur Hire)
- `transfer` (Airport & Intercity Transfers)

### Schema & Business Rules:
1. **Transfer Pricing (Base Rate + Distance Quote):**
   - For point-to-point transfers (`transfer`), `startingPrice` holds the vehicle's base rate (inherited from the vehicle's service guideline).
   - Final route fare is distance-based, calculated by the admin, and communicated via email.
   - `startingPrice`: `DECIMAL / NUMERIC(10,2)` or `VARCHAR(50)` (nullable).
   - `selectedPrice`: `DECIMAL / NUMERIC(10,2)` (nullable; agreed final quote set by admin).
2. **Chauffeur Tier Pricing:**
   - `startingPrice`: Base vehicle charter rate.
   - `selectedPrice`: Chosen tier price (*With Driver*, *With Guide*, or *With Driver & Guide*).
3. **Guest Communication Language (`language`):**
   - Preferred language of communication between guest and chauffeur/guide (e.g. `English`, `Japanese`, `German`, `French`).
   - Column: `language VARCHAR(50) DEFAULT 'English'`.
4. **Travelers Breakdown:**
   - JSON column `{ adults: number, couples?: number, children?: number, infants?: number }`.

### Endpoints:
- `GET /services` (supports `x-admin-key` header, returns requests sorted by `createdAt DESC`).
- `GET /services/:id`
- `PATCH /services/:id/status` (body: `{ status: 'pending' | 'approved' | 'active' | 'rejected' }`).
- `DELETE /services/:id`

---

## 2. Vehicle Service Guidelines & Specifications (`/services/notes`)

Manages the vehicle catalog, capacities, luggage limits, pricing tiers, and multilingual guideline bullets displayed on public booking forms.

### Schema Requirements:

```typescript
export interface ServiceNoteEntity {
  id: string | number;
  serviceType: 'custom' | 'chauffeur' | 'transfer';
  vehicleType: string;               // e.g. "SUV", "Sedan", "Van", "Mini Coach"
  startingPrice: string;             // Base charter/transfer starting rate (e.g. "$45" or "45")
  vehicleCapacity: string;           // e.g. "1-4 Passengers"
  luggages: string;                  // e.g. "2 Large Bags"
  
  // TIER RATES — MANDATORY FOR 'chauffeur' & 'custom', BUT OMITTED / NULL FOR 'transfer'
  withDriverPrice?: string | null;
  withGuidePrice?: string | null;
  withDriverAndGuidePrice?: string | null;
  
  // Multilingual Guidelines
  notes: {
    en: string[];                    // English policy bullets
    ja: string[];                    // Japanese (日本語) policy bullets
  };
  createdAt?: string;
  updatedAt?: string;
}
```

### Critical Validation Rule for Transfers:
- When `serviceType === 'transfer'`, the backend DTO must **NOT** enforce or require `withDriverPrice`, `withGuidePrice`, or `withDriverAndGuidePrice`.
- Transfers are point-to-point and operate exclusively with `startingPrice` (base vehicle rate) + route mileage.

### Endpoints:
- `GET /services/notes` (optional query: `?serviceType=...&lang=...`).
- `POST /services/notes` (creates new vehicle guideline).
- `PATCH /services/notes/:id` (updates existing vehicle guideline).
- `DELETE /services/notes/:id` (removes guideline).

---

## 3. Reviews & Guest Feedback (`/comments` & `/package-reviews`)

Distinguishes between public tour package reviews and general website feedback:

| Feature | Tour Package Reviews (`/package-reviews`) | Website Feedback (`/comments`) |
| :--- | :--- | :--- |
| **Context** | Specific tour package experience | General website testimonial |
| **Star Rating** | 1 to 5 Stars | 1 to 5 Stars (Optional) |
| **Guest Photos** | `imageUrls` (string array) | Not supported |
| **Public Visibility** | Toggleable (`isPubliclyVisible`) | Toggleable (`isPubliclyVisible`) |
| **Official Staff Reply** | **Supported** (`adminReply`, `adminReplyAt`) | **Not Supported** (Testimonials do not take staff reply) |

### Endpoints:
- `GET /package-reviews`: List tour reviews.
- `PATCH /package-reviews/:id/reply`: Body `{ adminReply: string }` -> updates `adminReply` and `adminReplyAt = new Date()`.
- `PATCH /package-reviews/:id/visibility`: Body `{ isPubliclyVisible: boolean }`.
- `DELETE /package-reviews/:id`
- `GET /comments`: List website feedback testimonials.
- `PATCH /comments/:id/visibility`: Body `{ isPubliclyVisible: boolean }`.
- `DELETE /comments/:id`

---

## 4. Contact Inquiries & Messages (`/contact`)

Handles inquiries from the public website contact form.

### Schema & Business Rules:
- `inquiryType`: `General Inquiry`, `Custom Journey Planning`, `Partnership`, `Media / Press`, `Tour Inquiry`.
- `tourInterest`: Optional / Nullable string. Inquiries originating from non-tour forms (e.g. Partnership, Media, General) send `tourInterest: null` or omit it. The backend must not reject or fail validation when `tourInterest` is null/empty.
- `status`: `'pending'` (Pending Review), `'contacted'` (Staff Replied), `'completed'` (Resolved).

### Endpoints:
- `GET /contact`: List all inquiries (sorted by `createdAt DESC`).
- `PATCH /contact/:id/status`: Body `{ status: "pending" | "contacted" | "completed" }`.
- `DELETE /contact/:id`

---

## 5. Ready-to-Run Prompts for Backend Agent

Copy and dispatch the prompts below directly to the backend development agent.

### Prompt 1: Service Notes Schema & Transfer Tier Omission
```text
Task: Align Service Guidelines and Vehicle Notes (/services/notes) Schema & Endpoints

Please verify and align the Service Notes module:

1. Endpoints:
   - GET /services/notes (supports optional ?serviceType=... query)
   - POST /services/notes
   - PATCH /services/notes/:id
   - DELETE /services/notes/:id

2. Schema Requirements:
   - serviceType: enum ('custom', 'chauffeur', 'transfer')
   - vehicleType: string (e.g. "SUV", "Sedan", "Van")
   - startingPrice: string or number (required) - Base vehicle starting rate
   - vehicleCapacity: string (e.g. "1-4 Passengers")
   - luggages: string (e.g. "2 Large Bags")
   - notes: JSON object with { en: string[], ja: string[] }
   
   CRITICAL RULE FOR TRANSFERS:
   - withDriverPrice, withGuidePrice, withDriverAndGuidePrice are only applicable to 'chauffeur' and 'custom'.
   - When serviceType === 'transfer', these three tier fields MUST be optional/nullable and should not be enforced by class-validator or required in the database table, as airport/intercity transfers are point-to-point and do not use driver/guide tiers.
```

### Prompt 2: Tour Services & Transportation Endpoints Alignment
```text
Task: Verify Tour Services & Transportation (/services) Endpoints

Please verify the following schema and endpoints:

1. Endpoints:
   - GET /services (supports x-admin-key header, returns sorted by createdAt DESC)
   - GET /services/:id
   - PATCH /services/:id/status (body: { status: 'pending' | 'approved' | 'active' | 'rejected' })
   - DELETE /services/:id

2. Schema Requirements:
   - serviceType: 'custom-tour' | 'chauffeur' | 'transfer'
   - startingPrice: DECIMAL / NUMERIC(10,2) or VARCHAR(50) (nullable) - Base vehicle charter/transfer rate
   - selectedPrice: DECIMAL / NUMERIC(10,2) (nullable) - Chosen tier rate or agreed quote
   - language: VARCHAR(50) (e.g. 'English', 'Japanese', 'German', 'French') - Preferred communication language
   - travelers: JSON column or object with { adults: number, couples?: number, children?: number, infants?: number }
```

### Prompt 3: Reviews Staff Reply & Website Visibility Endpoints
```text
Task: Verify Package Reviews Staff Reply and Comments Visibility Endpoints

Please verify that the following endpoints are operational:

1. Package Reviews (/package-reviews):
   - GET /package-reviews
   - PATCH /package-reviews/:id/reply (body: { adminReply: string }) -> updates adminReply and adminReplyAt
   - PATCH /package-reviews/:id/visibility (body: { isPubliclyVisible: boolean })
   - DELETE /package-reviews/:id

2. Website Comments (/comments):
   - GET /comments
   - PATCH /comments/:id/visibility (body: { isPubliclyVisible: boolean })
   - DELETE /comments/:id
   Note: Website comments (/comments) are public testimonials and do not require staff reply fields.
```

### Prompt 4: Contact Inquiries Nullable tourInterest Validation
```text
Task: Verify Contact Inquiries (/contact) Endpoints and Nullable tourInterest

Please verify the contact inquiry module:

1. Endpoints:
   - GET /contact
   - PATCH /contact/:id/status (body: { status: 'pending' | 'contacted' | 'completed' })
   - DELETE /contact/:id

2. Validation:
   - tourInterest must be optional/nullable (IsOptional(), IsString()). General, Partnership, and Media inquiries submit without a tourInterest, and the backend must cleanly accept null/empty.
```

---

## 5. Tour Package Public Visibility & Draft Control (`/packages`)

Allows administrators to publish or hide tour packages from the public customer website with a single click.

### Business Rules & Architecture:
1. **Database Schema:**
   - Add column `isLive` (or `isActive`): `BOOLEAN DEFAULT true NOT NULL` on `packages` / `tour_packages` table.
2. **Customer Public Frontend Isolation:**
   - Public endpoints (`GET /packages`, `GET /packages/previews`, `GET /packages/multiday`, `GET /packages/oneday`) **MUST** filter by `WHERE isLive = true`.
   - Hidden/draft packages (`isLive = false`) must never be returned to guest visitors on the public site or search crawlers.
   - `GET /packages/:slug` must return `404 Not Found` if `isLive = false` unless accessed via admin authenticated key.
3. **Admin Management Endpoints:**
   - `GET /addpackages` or `GET /packages/admin` returns all packages (both live and hidden) with their `isLive` boolean flag.
   - `PATCH /packages/:slug/visibility` (body: `{ isLive: boolean }`) toggles the package visibility.

### Prompt 5: Tour Package Live Visibility Implementation
```text
Task: Implement Tour Package Visibility (Live vs Hidden/Draft) Toggle

1. Database Schema:
   - Ensure `isLive` (boolean, default true) exists on the Tour Package entity/table.

2. Public API Filtering:
   - In all customer-facing endpoints (e.g. GET /packages, GET /packages/previews, GET /packages/multiday, GET /packages/oneday):
     Filter queries to return ONLY packages WHERE isLive = true.
   - If a guest queries a specific package by slug (GET /packages/:slug) and isLive is false, return 404 (Not Found).

3. Admin Endpoints:
   - GET /addpackages (or GET /packages/admin): Return all packages, including their `isLive` status.
   - PATCH /packages/:slug/visibility:
     Body: { isLive: boolean }
     Action: Updates `isLive` for the specified slug and returns the updated package.
```

---

## 6. Live Visibility & Draft Control for Blogs, Destinations, and FAQs

Extends the single-click Public Visibility toggle to Blog Articles (`/blogs`), Travel Destinations (`/destinations`), and Help Center FAQs (`/faqs`). This gives administrators instant control over what content is published on the live customer-facing website versus kept offline in draft/staging mode.

### Business Rules & Architecture:
1. **Database Schema:**
   - Add column `isLive`: `BOOLEAN DEFAULT true NOT NULL` on `blogs`, `destinations`, and `faqs` tables.
2. **Customer Public Frontend Isolation:**
   - **Blogs**:
     - `GET /blogs/previews` and `GET /blogs`: **MUST** filter `WHERE isLive = true`.
     - `GET /blogs/:slug`: Return `404 Not Found` if `isLive = false` for public requests.
   - **Destinations**:
     - `GET /destinations/previews` and `GET /destinations`: **MUST** filter `WHERE isLive = true`.
     - `GET /destinations/:slug`: Return `404 Not Found` if `isLive = false` for public requests.
   - **FAQs**:
     - `GET /faqs`: **MUST** filter `WHERE isLive = true`.
3. **Admin Management Endpoints:**
   - `GET /blogs/admin`, `GET /destinations/admin`, `GET /faqs/admin`: Return all items (both live and hidden) with their `isLive` boolean flag.
   - Visibility Toggle Endpoints:
     - `PATCH /blogs/:id/visibility` (Body: `{ isLive: boolean }`)
     - `PATCH /destinations/:id/visibility` (Body: `{ isLive: boolean }`)
     - `PATCH /faqs/:id/visibility` (Body: `{ isLive: boolean }`)

### Prompt 6: Blogs, Destinations & FAQs Live Visibility Implementation
```text
Task: Implement Live Visibility (Public vs Hidden/Draft) Toggle for Blogs, Destinations, and FAQs

1. Database Migrations / Schema:
   - Blogs Table: Add column `isLive` (boolean, default true).
   - Destinations Table: Add column `isLive` (boolean, default true).
   - FAQs Table: Add column `isLive` (boolean, default true).

2. Public API Filtering:
   - Ensure all public customer endpoints filter by `WHERE isLive = true`:
     * GET /blogs/previews, GET /blogs -> WHERE isLive = true
     * GET /blogs/:slug -> 404 if isLive = false (unless admin request)
     * GET /destinations/previews, GET /destinations -> WHERE isLive = true
     * GET /destinations/:slug -> 404 if isLive = false (unless admin request)
     * GET /faqs -> WHERE isLive = true

3. Admin Management Endpoints:
   - Admin Fetch Endpoints:
     * GET /blogs/admin -> Return all blogs including `isLive` boolean
     * GET /destinations/admin -> Return all destinations including `isLive` boolean
     * GET /faqs/admin -> Return all FAQs including `isLive` boolean
   - Visibility Toggle Endpoints:
     * PATCH /blogs/:id/visibility -> Body: { isLive: boolean }
     * PATCH /destinations/:id/visibility -> Body: { isLive: boolean }
     * PATCH /faqs/:id/visibility -> Body: { isLive: boolean }
```

---

## 7. Enterprise Admin Authentication, RBAC & Hardened Security Engine

Secures the entire Ikisaki Tours Admin Panel against unauthorized access, credential brute-forcing, token theft, and URL leakage. Ensures that **ONLY** verified operations personnel can access internal dashboards, customer data, and booking controls.

### Architectural Threat Model & Security Principles:
1. **Zero Trust Access:**
   - No administrative endpoint can be accessed via simple static API keys on the client-side.
   - All management routes require an active, cryptographically signed Administrator Session.
2. **Unhackable Cookie Security (Anti-XSS & Anti-CSRF):**
   - Session tokens **MUST NEVER** be stored in `localStorage` or `sessionStorage` (which are vulnerable to XSS).
   - Tokens **MUST** be issued as `HttpOnly`, `Secure` (HTTPS only in production), `SameSite=Strict` cookies.
3. **Brute Force & Credential Stuffing Defense:**
   - Rate limiting on `POST /api/admin/auth/login`: Maximum 5 consecutive failed attempts per IP / Account in a 15-minute window.
   - On 5 failed attempts, the account is locked for 30 minutes (`lockedUntil = NOW() + 30m`), an audit alert is triggered, and HTTP 429 is returned.
   - Constant-time password verification (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
4. **Password Hashing Standard:**
   - Passwords must be hashed using **Argon2id** (`memoryCost: 65536, timeCost: 3, parallelism: 4`) or **bcrypt** with a work factor of $\ge 12$. Plain text, MD5, or SHA-256 are strictly forbidden.
5. **Dual-Token Session Lifecycle & Revocation:**
   - **Access Token:** Short-lived JWT (15 minutes expiry) with `{ sub: adminId, role, email }`.
   - **Refresh Token:** Cryptographic UUID stored hashed in `admin_sessions` table (7 days expiry).
   - Automatic refresh token rotation: If an old or revoked token is reused, all active sessions for that admin are invalidated immediately (token reuse detection).

---

### Database Schema Specifications:

#### 1. `admin_users` Table
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'ADMIN' NOT NULL, -- 'SUPER_ADMIN' | 'ADMIN' | 'OPERATIONS_MANAGER'
    two_factor_secret VARCHAR(255) NULL,       -- Encrypted with AES-256
    is_two_factor_enabled BOOLEAN DEFAULT false NOT NULL,
    failed_login_attempts INT DEFAULT 0 NOT NULL,
    locked_until TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
```

#### 2. `admin_sessions` Table
```sql
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    user_agent TEXT NULL,
    ip_address VARCHAR(45) NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_admin_sessions_admin ON admin_sessions(admin_id);
```

#### 3. `admin_audit_logs` Table
```sql
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NULL REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,      -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'PACKAGE_UPDATE', etc.
    resource VARCHAR(100) NOT NULL,    -- 'packages', 'bookings', 'pricing', 'auth'
    details JSONB NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
```

---

### API Endpoints Specification:

#### 1. `POST /api/admin/auth/login`
- **Request Body:**
  ```json
  {
    "email": "admin@ikisakitours.com",
    "password": "SecurePassword123!",
    "totpCode": "123456" // Optional, required if 2FA is enabled
  }
  ```
- **Validation & Logic:**
  1. Check rate limit for IP / Email (max 5 failed attempts per 15 mins).
  2. Query `admin_users` where `email = :email`. If not found or `is_active = false`, return `401 Unauthorized` (do not reveal if email exists).
  3. If `locked_until > NOW()`, return `429 Too Many Requests` with remaining lockout time.
  4. Verify `password_hash` using Argon2id / bcrypt. If invalid:
     - Increment `failed_login_attempts`.
     - If `failed_login_attempts >= 5`, set `locked_until = NOW() + INTERVAL '30 minutes'`.
     - Log `LOGIN_FAILED` to `admin_audit_logs`.
     - Return `401 Unauthorized`.
  5. If password is valid:
     - Reset `failed_login_attempts = 0` and `locked_until = NULL`.
     - Update `last_login_at = NOW()` and `last_login_ip = clientIp`.
     - Issue Access Token (JWT, 15m) and Refresh Token (UUID, 7d).
     - Store Refresh Token hash in `admin_sessions`.
     - Set `admin_session` cookie (`HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`).
     - Log `LOGIN_SUCCESS` to `admin_audit_logs`.
     - Return:
       ```json
       {
         "success": true,
         "user": {
           "id": "uuid",
           "email": "admin@ikisakitours.com",
           "fullName": "Operations Director",
           "role": "SUPER_ADMIN"
         }
       }
       ```

#### 2. `POST /api/admin/auth/logout`
- Revokes the current session in `admin_sessions` (`is_revoked = true`).
- Clears the `admin_session` cookie.
- Returns `{ "success": true }`.

#### 3. `GET /api/admin/auth/me`
- Guarded by `AdminAuthGuard`.
- Returns the authenticated administrator's profile and permissions.

#### 4. `POST /api/admin/auth/refresh`
- Validates the incoming refresh token cookie.
- Rotates the refresh token (issues a new token and revokes the old one).
- Re-issues the `admin_session` cookie.

---

### Backend Route Guarding (Strict RBAC):
All administrative routes **MUST** be protected with an `AdminAuthGuard` that blocks unauthenticated calls and validates admin privileges:
- `/api/addpackages/*`
- `/api/packages/*/visibility`
- `/api/blogs/admin/*`
- `/api/destinations/admin/*`
- `/api/faqs/admin/*`
- `/api/comments/*`
- `/api/contact/*`
- `/api/auth/users/*`

---

### Initial Super Admin Seed CLI Command:
To initialize the first administrator safely without committing credentials:
```bash
npm run seed:admin
```
- Reads `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` from `.env`.
- Checks if the admin user exists; if not, hashes the password with Argon2id/bcrypt and creates a `SUPER_ADMIN` record in `admin_users`.

---

### Prompt 7: Comprehensive Admin Auth & Security Engine Implementation
```text
Task: Implement Enterprise Admin Authentication, Session Security & RBAC Protection

1. Database Migrations:
   - Create tables `admin_users`, `admin_sessions`, and `admin_audit_logs` matching the schema defined in Section 7 of BACKEND_INTEGRATION_TASKS.md.

2. Auth Controller & Service (/api/admin/auth):
   - POST /api/admin/auth/login:
     * Rate limiting: Max 5 failed attempts per 15 minutes per IP/Email.
     * Password verification with Argon2id or bcrypt (work factor 12).
     * Account lockout on 5 consecutive failures for 30 minutes.
     * Generate 15-minute Access JWT and 7-day Rotating Refresh Token.
     * Set HttpOnly, Secure, SameSite=Strict cookie named 'admin_session'.
     * Record audit log in `admin_audit_logs`.
   - POST /api/admin/auth/logout:
     * Mark session revoked in `admin_sessions`.
     * Clear 'admin_session' cookie.
   - GET /api/admin/auth/me:
     * Return authenticated admin profile (id, email, fullName, role).
   - POST /api/admin/auth/refresh:
     * Rotate refresh token and update cookie.

3. Admin Auth Guard & Route Protection:
   - Create `AdminAuthGuard` that extracts JWT from HttpOnly cookie or Authorization Bearer header.
   - Apply `AdminAuthGuard` to ALL administrative controllers/routes:
     * Packages Management (/addpackages, /packages/:slug/visibility)
     * Blogs Admin (/blogs/admin, /blogs/:id, /blogs/:id/visibility)
     * Destinations Admin (/destinations/admin, /destinations/:id, /destinations/:id/visibility)
     * FAQs Admin (/faqs/admin, /faqs/:id, /faqs/:id/visibility)
     * Contact Inquiries (/contact)
     * Comments & Reviews (/comments, /package-reviews)
     * User Profiles (/auth/users)

4. Super Admin Seeding Script:
   - Implement `npm run seed:admin` CLI command reading INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD from .env to safely provision the initial Super Admin account.

5. Self-Service Profile, Password Change & Google Authenticator (2FA) Endpoints:
   - PATCH /api/admin/auth/profile:
     * Guarded by AdminAuthGuard.
     * Body: { fullName?: string, avatarUrl?: string }.
     * Updates admin user profile and returns updated record.
   - PATCH /api/admin/auth/change-password:
     * Guarded by AdminAuthGuard.
     * Body: { currentPassword: string, newPassword: string }.
     * Verifies current password against bcrypt hash; updates with new hashed password.
   - POST /api/admin/auth/2fa/generate:
     * Generates TOTP secret (otplib) and QR code data URL (qrcode).
     * Returns: { success: true, secret: string, qrCodeDataUrl: string }.
   - POST /api/admin/auth/2fa/enable:
     * Body: { totpCode: string }.
     * Validates 6-digit TOTP token; sets two_factor_secret and is_two_factor_enabled = true.
   - POST /api/admin/auth/2fa/disable:
     * Body: { currentPassword: string }.
     * Verifies current password; clears two_factor_secret and disables 2FA.
```
