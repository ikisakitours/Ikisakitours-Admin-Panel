# Ikisaki Tours — Enterprise Backend Integration Specifications
## Scope: 10-Role Staff Management & Access Control Engine (RBAC)
> **Target:** NestJS Backend Engineering Agent  
> **Date:** November 20, 2026  
> **Frontend Status:** 100% Implemented & Verified in Admin Panel  
> **Note:** 2FA TOTP Engine & Admin Profile / R2 Storage are **already completed and working**. This task scope is **strictly for the new Staff & RBAC module**.

---

## 📋 Copy-Paste Prompt for Backend Agent

```markdown
Hi Backend Agent,

Two-Factor Authentication (2FA / TOTP) and Admin Profile updates are already implemented and working. 

Please implement the new Staff & Team Management (RBAC) Module for Ikisaki Tours under `/api/admin/staff` in the NestJS Backend.

### 1. Database Alignment (Supabase `admin_users` table)
Verify that the `admin_users` table supports the 10 role types and account status:
- `role` (varchar, default 'SUPER_ADMIN')
- `is_active` (boolean, default true)
- `last_login_at` (timestamptz, nullable)
- `last_login_ip` (varchar, nullable)

```sql
-- Run in Supabase SQL Editor if columns are missing:
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'SUPER_ADMIN' NOT NULL,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(100);
```

---

### 2. The 10 Specialized Roles
1. `SUPER_ADMIN` (Executive Root / Owner — Full unrestricted platform access)
2. `OPERATIONS_MANAGER` (Tour Operations, logistics dispatch, chauffeur guidelines)
3. `PACKAGE_MANAGER` (Tour packages, itineraries, tier pricing, media upload)
4. `DESTINATION_EXPERT` (Sri Lanka travel destinations, province guides)
5. `CONTENT_EDITOR` (Multilingual blogs, cultural articles, SEO stories)
6. `BOOKING_AGENT` (Tour reservations, date calendars, traveler counts)
7. `TRANSPORT_COORDINATOR` (Private chauffeur fleet, vehicle rates, transfer notes)
8. `CUSTOMER_SUPPORT` (Customer contact inquiries, WhatsApp web leads, FAQs)
9. `REVIEW_MODERATOR` (Guest testimonials, reviews, public comments)
10. `LEGAL_COMPLIANCE` (Legal terms, privacy policies, cookie consents, audit logs)

---

### 3. Implement Staff Management Endpoints under `/api/admin/staff`
All endpoints below must be protected by `AdminAuthGuard` and `@Roles('SUPER_ADMIN')`:

1. `GET /api/admin/staff`
   - Returns array of all internal staff members (excluding password hashes and 2FA secrets):
     ```json
     [
       {
         "id": "uuid",
         "email": "kamal@ikisakitours.com",
         "fullName": "Kamal Perera",
         "role": "PACKAGE_MANAGER",
         "avatarUrl": "https://pub-...r2.dev/admin/kamal.webp",
         "isActive": true,
         "isTwoFactorEnabled": false,
         "lastLoginAt": "2026-11-20T10:00:00Z",
         "lastLoginIp": "116.206.246.1",
         "createdAt": "2026-11-20T09:00:00Z"
       }
     ]
     ```

2. `POST /api/admin/staff`
   - Body: `{ fullName: string, email: string, password: string, role: string }`
   - Validates that `email` is not already registered.
   - Validates that `role` is one of the 10 allowed roles.
   - Hashes `password` using `bcrypt.hash(password, 12)`.
   - Inserts record into `admin_users` with `is_active = true`.
   - Logs `STAFF_CREATED` in `admin_audit_logs`.
   - Returns HTTP 201 with created staff profile.

3. `PATCH /api/admin/staff/:id/role`
   - Body: `{ role: string }`
   - Updates `role` in `admin_users`.
   - Returns: `{ "success": true, "message": "Staff role updated successfully!" }`

4. `PATCH /api/admin/staff/:id/status`
   - Body: `{ isActive: boolean }`
   - Updates `is_active` in `admin_users`.
   - If setting `isActive = false` (suspension), immediately revokes all active sessions for that user in `admin_sessions`:
     `UPDATE admin_sessions SET is_revoked = true WHERE admin_id = :id`
   - Returns: `{ "success": true, "message": "Staff status updated successfully!" }`

5. `PATCH /api/admin/staff/:id/reset-password`
   - Body: `{ newPassword: string }`
   - Hashes `newPassword` with bcrypt and updates `password_hash` in `admin_users`.
   - Revokes existing sessions in `admin_sessions` so the user must sign in with the new key.
   - Returns: `{ "success": true, "message": "Password reset successfully!" }`

6. `DELETE /api/admin/staff/:id`
   - Validates that the requesting admin is NOT deleting their own account (`req.user.id !== id`).
   - Deletes record from `admin_users` (and cascades associated sessions/audit references).
   - Logs `STAFF_DELETED` in `admin_audit_logs`.
   - Returns: `{ "success": true, "message": "Staff member deleted successfully." }`

---

### 4. Account Suspension Check on Login (`POST /api/admin/auth/login`)
Ensure the existing login handler rejects suspended staff accounts:
- If `user.is_active === false`:
  - Return HTTP 403 Forbidden:
    ```json
    {
      "success": false,
      "message": "Your staff account has been suspended. Please contact your Super Administrator."
    }
    ```

---

### 5. Route Protection Matrix (`RolesGuard`)
Apply `@UseGuards(AdminAuthGuard, RolesGuard)` across controllers:
- `/api/admin/staff/*` -> `@Roles('SUPER_ADMIN')`
- `/api/packages/*` -> `@Roles('SUPER_ADMIN', 'PACKAGE_MANAGER')`
- `/api/destinations/*` -> `@Roles('SUPER_ADMIN', 'PACKAGE_MANAGER', 'DESTINATION_EXPERT')`
- `/api/blogs/*` -> `@Roles('SUPER_ADMIN', 'PACKAGE_MANAGER', 'CONTENT_EDITOR')`
- `/api/bookings/*` -> `@Roles('SUPER_ADMIN', 'OPERATIONS_MANAGER', 'BOOKING_AGENT')`
- `/api/services/*` -> `@Roles('SUPER_ADMIN', 'OPERATIONS_MANAGER', 'TRANSPORT_COORDINATOR')`
- `/api/contact/*` -> `@Roles('SUPER_ADMIN', 'OPERATIONS_MANAGER', 'CUSTOMER_SUPPORT')`
- `/api/comments/*` -> `@Roles('SUPER_ADMIN', 'REVIEW_MODERATOR')`
- `/api/legaldocs/*` -> `@Roles('SUPER_ADMIN', 'LEGAL_COMPLIANCE')`
- `/api/admin/auth/me`, `/profile`, `/change-password`, `/2fa/*` -> Open to ALL authenticated staff members.

---

### 6. Build & Deploy
1. Run `npm run build` to confirm 0 TypeScript errors.
2. Push to remote git repository so Vercel can deploy the updated NestJS API.
```

---

## 2. Comprehensive 10-Role Permissions Matrix

| Platform Module / API | `SUPER_ADMIN` | `OPERATIONS_MANAGER` | `PACKAGE_MANAGER` | `DESTINATION_EXPERT` | `CONTENT_EDITOR` | `BOOKING_AGENT` | `TRANSPORT_COORDINATOR` | `CUSTOMER_SUPPORT` | `REVIEW_MODERATOR` | `LEGAL_COMPLIANCE` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Staff & RBAC** (`/staff`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tour Packages** (`/packages`) | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Destinations** (`/destinations`) | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Blogs** (`/blogs`) | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tour Bookings** (`/tours`) | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Transfers & Fleet** (`/services`) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Contact Inquiries** (`/contact`) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Reviews & Feedback** (`/comments`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Legal & Audit Logs** (`/legaldocs`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Self Profile, WebP & 2FA** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
