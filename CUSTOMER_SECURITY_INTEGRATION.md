# Ikisaki Tours — Customer Account Suspension & Zero-Trust Access Guard
## Specifications for Backend & Customer Frontend Agents
> **Date:** November 20, 2026  
> **Status:** Architecture Approved & Ready for Prompting  
> **Scope:** End-to-End Account Suspension & Access Restriction (`hasAccess: false`)

---

## 📌 Executive Summary & Architecture Overview

When an Administrator toggles **Suspend Access** for a customer in the Admin Panel (`/users` -> `hasAccess: false`), that user must be **strictly blocked from accessing ANY normal page or protected feature** on `ikisakitours.com`.

### 🛡️ Why Defense-in-Depth (Backend + Frontend)?
* **Frontend Alone is NOT Enough:** A technical user or hacker can inspect DevTools, edit `localStorage`, bypass client routing, or issue direct cURL/Postman API requests.
* **Backend Alone is NOT Enough:** If the backend only blocks APIs, the user would still navigate client-rendered pages before an API fails.
* **The Unified Solution:**
  1. **Backend Enforcement (The Source of Truth):** Hard gates all user APIs with `403 Forbidden` (`ACCOUNT_SUSPENDED`).
  2. **Customer Frontend Enforcement (Zero-Flash Route Guard):** Next.js middleware and route guards intercept every route navigation. If `user.hasAccess === false`, the user is **instantly redirected to `/en/access-restricted`**.
  3. **Guest Handling on `/profile`:** If a visitor is not logged in at all, accessing `/profile` opens the **Auth Required Modal** (or redirects to sign-in), while public pages (`/tours`, `/destinations`, `/blogs`, etc.) remain fully accessible for browsing.
  4. **Zero Regression:** No existing features, bookings, or active users (`hasAccess: true`) are affected.

---

## 🚀 PROMPT 1: For the Backend Engineering Agent (`ikisakitours-backend`)

Copy and paste the following prompt directly to your **Backend Agent**:

```markdown
Hi Backend Agent,

We have implemented User Access Control in the Admin Panel (`PATCH /api/auth/users/:id/status` with `{ hasAccess: boolean }`).
Now, we need you to enforce **Real-time Zero-Trust Customer Account Suspension** in the NestJS Backend (`ikisakitours-backend`).

---

### 1. Objective
When an admin sets a user's `hasAccess` to `false`, that user is suspended.
The backend MUST prevent suspended users from executing ANY authenticated actions or accessing protected user data, returning a standardized `403 Forbidden` response.

---

### 2. Implementation Specifications

#### A. Standardized 403 Response Contract
Whenever a suspended user tries to access a protected endpoint or authenticate, return:
- **HTTP Status:** `403 Forbidden`
- **JSON Payload:**
```json
{
  "statusCode": 403,
  "error": "ACCOUNT_SUSPENDED",
  "message": "Your account access is currently suspended. Please contact customer support.",
  "user": {
    "id": "7f87cec9-d044-47ea-9eee-c5d4df125587",
    "email": "user@example.com",
    "firstname": "Pramod",
    "lastname": "Premudu",
    "hasAccess": false
  }
}
```

#### B. Update `UserAuthGuard` / `JwtStrategy` (Real-Time Enforcement)
In your customer authentication guard (e.g. `UserAuthGuard`, `JwtAuthGuard` or `JwtStrategy` for public customer users):
1. Upon verifying the customer JWT, verify the user's current status in the database (or cached in Redis / session):
   ```typescript
   if (user.hasAccess === false) {
     throw new ForbiddenException({
       statusCode: 403,
       error: 'ACCOUNT_SUSPENDED',
       message: 'Your account access is currently suspended. Please contact customer support.',
       user: {
         id: user.id,
         email: user.email,
         firstname: user.firstname,
         lastname: user.lastname,
         hasAccess: false,
       },
     });
   }
   ```
2. This ensures that even if a user holds an active JWT token issued before they were suspended, their very next API request is **immediately rejected in real-time**.

#### C. Handle Login for Suspended Users (`POST /api/auth/login`)
When a suspended customer logs in with valid email/password:
- If `user.hasAccess === false`, return `HTTP 403 Forbidden` with the exact payload above, OR issue a restricted token with `{ hasAccess: false }` along with `{ requiresSuspensionScreen: true, user }` so the customer frontend can display the user's name, email, and reference ID on `/en/access-restricted`.
- (Recommended: Return `403` with `{ error: 'ACCOUNT_SUSPENDED', user: { id, email, firstname, lastname, hasAccess: false } }`).

#### D. Endpoints Covered
All customer endpoints requiring authentication must be protected:
- `GET /api/auth/me` (Customer profile & status verification)
- `GET /api/users/profile` & `PATCH /api/users/profile`
- `POST /api/comments` & `POST /api/package-reviews`
- `POST /api/package-bookings` & `POST /api/services` (when called as logged-in user)
- `GET /api/user/bookings` / `GET /api/user/my-trips`

#### E. Strict Safety Guardrails
- **Do NOT break guest bookings or public APIs:** Public endpoints like `GET /destinations`, `GET /packages`, `GET /blogs`, and guest tour bookings MUST continue to work without requiring authentication.
- **Do NOT break active users:** Users where `hasAccess === true` (or `hasAccess == null / undefined` for existing records) must authenticate normally without any disruption.

Please confirm once implemented and verified with `npm test` / `npm run build`.
```

---

## 🌐 PROMPT 2: For the Customer Frontend Engineering Agent (`ikisakitours-frontend`)

Copy and paste the following prompt directly to your **Customer Frontend Agent**:

```markdown
Hi Frontend Agent,

We have designed an **Access Restricted** screen at `/en/access-restricted` (or `/[locale]/access-restricted`) to inform suspended customers that their account access has been restricted by administration.
Now, we need you to implement the **Zero-Trust Client Route Guard & API Interceptor** on the Customer Website (`ikisakitours-frontend`).

---

### 1. Requirements & Objectives

1. **Strict URL Lock for Suspended Users (`hasAccess === false`):**
   - If a logged-in user has `hasAccess: false`, they must **NEVER** be able to view any normal page (`/`, `/tours`, `/destinations`, `/profile`, `/blogs`, `/about`, etc.).
   - Even if they manually type a URL in the browser address bar, the system must **immediately redirect them to `/[locale]/access-restricted`** with zero content flash.
   - The ONLY actions allowed for a suspended user are:
     1. Viewing `/[locale]/access-restricted` (where their Account Reference ID, name, email, and "Contact Support" button are shown).
     2. Clicking "Sign Out" (which calls logout, clears local auth state/cookies, and returns them to the public website as an unauthenticated guest).

2. **Unauthenticated / Guest Handling on `/profile`:**
   - If a visitor is NOT logged in (guest) and manually navigates to `/profile` (or any user-specific protected page):
     - Do NOT show the profile page.
     - Trigger the **"Auth Required Modal"** (or redirect to sign-in).
     - Public pages (`/`, `/tours`, `/destinations`, `/blogs`, `/contact`, `/about`) must remain 100% accessible to guest visitors.

3. **Global API Error Interceptor (`403 ACCOUNT_SUSPENDED`):**
   - If any API request to the backend responds with `403 Forbidden` and `error === "ACCOUNT_SUSPENDED"`:
     - Update the local user session/state with `hasAccess: false`.
     - Immediately redirect the browser to `/[locale]/access-restricted`.

---

### 2. Implementation Specifications

#### A. Next.js Middleware or Global Layout Route Guard
In `middleware.ts` (or your root locale layout/guard component):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Retrieve user session / token from cookies
  const userCookie = request.cookies.get('user_session')?.value || request.cookies.get('user_data')?.value;
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      // ignore
    }
  }

  const isRestrictedRoute = pathname.includes('/access-restricted');
  const isLogoutRoute = pathname.includes('/logout') || pathname.includes('/signout');

  // 2. Suspended User Lockout Guard
  if (user && user.hasAccess === false) {
    // If suspended user attempts to visit ANY route other than /access-restricted or /logout, bounce them!
    if (!isRestrictedRoute && !isLogoutRoute) {
      const locale = pathname.split('/')[1] || 'en';
      const restrictedUrl = new URL(`/${locale}/access-restricted`, request.url);
      return NextResponse.redirect(restrictedUrl);
    }
  }

  // 3. Guest protection on /profile
  const isProfileRoute = pathname.includes('/profile') || pathname.includes('/my-bookings');
  if (!user && isProfileRoute) {
    const locale = pathname.split('/')[1] || 'en';
    const loginUrl = new URL(`/${locale}/login?authRequired=true`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

*(Note: If your project enforces auth via React Context or a Client Route Guard component instead of Edge Middleware, implement the equivalent check inside your `AuthProvider` / `AuthGuard` component using `useRouter()` and `useEffect`).*

#### B. API Interceptor (Axios / Fetch Wrapper)
In your API client (e.g. `src/lib/api.ts` or `fetcher.ts`):
```typescript
export async function customFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options);

  if (response.status === 403) {
    try {
      const data = await response.clone().json();
      if (data?.error === 'ACCOUNT_SUSPENDED' || data?.user?.hasAccess === false) {
        // Update local auth state if available
        if (typeof window !== 'undefined') {
          const current = localStorage.getItem('user_data');
          if (current) {
            const parsed = JSON.parse(current);
            parsed.hasAccess = false;
            localStorage.setItem('user_data', JSON.stringify(parsed));
          }
          const locale = window.location.pathname.split('/')[1] || 'en';
          window.location.href = `/${locale}/access-restricted`;
        }
      }
    } catch {
      // ignore parse error
    }
  }

  return response;
}
```

#### C. Sign Out on `/access-restricted`
Ensure the "SIGN OUT" button on the Access Restricted screen properly clears:
- Auth cookies (`user_token`, `user_session`, `user_data`)
- `localStorage` items (`user_data`, `auth_token`)
- Redirects cleanly to `/${locale}/` as a guest.

#### D. Strict Safety Guarantee
- Normal users (`hasAccess: true` or default) must not experience any additional delays or redirects.
- Guests browsing public tour packages, blogs, and destinations must remain 100% unaffected.

Please verify with `npm run build` and test navigating manually as a suspended user.
```

---

## 🎯 Verification Checklist for the Whole Team

| Scenario | Expected Behavior |
| :--- | :--- |
| **Admin sets `hasAccess: true` -> `false`** | User database record updates immediately. |
| **Suspended user tries to visit `/` or `/tours`** | Route guard intercepts and immediately redirects to `/[locale]/access-restricted`. |
| **Suspended user tries to call any API** | Backend responds with `403 Forbidden` (`ACCOUNT_SUSPENDED`). |
| **Suspended user clicks "Sign Out"** | Session clears; user is redirected to public homepage as a guest. |
| **Guest visits `/profile` without logging in** | Shows Auth Required Modal or redirects to login. |
| **Normal active user (`hasAccess: true`)** | Has complete access to all pages and APIs normally. |
| **Guest visits `/tours` or `/destinations`** | Completely open for public browsing without restrictions. |
