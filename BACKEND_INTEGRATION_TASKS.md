# Ikisaki Tours — Enterprise Backend Integration Specifications
## Scope: Automatic Cloudflare R2 Asset Cleanup (Orphaned Avatar Deletion)
> **Target:** NestJS Backend Engineering Agent  
> **Date:** November 20, 2026  
> **Frontend Status:** 100% Implemented & Verified in Admin Panel (`authService.updateProfile` passing `oldAvatarUrl` + client WebP engine)  
> **Previous Scope Status:** 2FA TOTP Engine & 10-Role Staff RBAC are **fully completed and live**. This file contains strictly the single pending backend task: **Automatic Cloudflare R2 Asset Cleanup for Avatars**.

---

## 📋 Copy-Paste Prompt for Backend Agent

```markdown
Hi Backend Agent,

The 2FA/TOTP Engine and 10-Role Staff Management (RBAC) modules are completely finished and verified.

Now, please implement **Automatic Cloudflare R2 Asset Cleanup for Profile Avatars** in the NestJS Backend (`ikisakitours-backend`).

---

### 1. Objective & Context
Currently, each time an administrator or staff member updates their profile photo via the Admin Panel, the frontend converts the image to `.webp` and uploads it to Cloudflare R2 (`/uploads/batch`), generating a timestamped file key (e.g. `admin/avatar-1732025987123.webp`).
Because the old image was not being deleted, orphaned avatar files accumulated in Cloudflare R2 storage.

**Your Goal:**
1. Automatically delete the previous avatar file from Cloudflare R2 whenever a staff member or admin updates their profile picture with a new one (`PATCH /api/admin/auth/profile`).
2. Automatically delete the staff member's avatar file from Cloudflare R2 whenever that staff account is deleted (`DELETE /api/admin/staff/:id`).
3. Keep this cleanup strictly isolated to profile avatar updates so Tour Packages, Destinations, and Blogs (which use multi-image galleries) are never affected.

---

### 2. Implementation Specifications

#### A. Reusable Cloudflare R2 Delete Helper
Create or export an S3/R2 delete utility inside your uploads/storage module (e.g. `src/uploads/r2-storage.service.ts` or `src/common/utils/r2-delete.util.ts`):

```typescript
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';

const logger = new Logger('R2Cleanup');

/**
 * Extracts object key from a full Cloudflare R2 public URL.
 * Example: "https://pub-xxxxxx.r2.dev/admin/avatar-1732025987123.webp" -> "admin/avatar-1732025987123.webp"
 */
export function extractR2KeyFromUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    // Ignore external placeholders, Google photos, or data URIs
    if (!parsed.hostname.includes('r2.dev') && !parsed.hostname.includes('cloudflare') && !parsed.hostname.includes('ikisaki')) {
      return null;
    }
    const key = parsed.pathname.replace(/^\/+/, '');
    return key || null;
  } catch {
    return null;
  }
}

/**
 * Safely deletes an object from Cloudflare R2.
 * Never throws an unhandled exception so database operations proceed smoothly even if the asset was already gone.
 */
export async function deleteR2Asset(s3Client: S3Client, bucketName: string, fileUrlOrKey?: string | null): Promise<boolean> {
  if (!fileUrlOrKey) return false;
  const key = fileUrlOrKey.startsWith('http') ? extractR2KeyFromUrl(fileUrlOrKey) : fileUrlOrKey;
  if (!key) return false;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    logger.log(`[R2 Asset Cleaned] Successfully purged orphaned object: ${key}`);
    return true;
  } catch (err: any) {
    logger.warn(`[R2 Asset Cleanup Warning] Failed to delete ${key}: ${err.message}`);
    return false;
  }
}
```

---

#### B. Update `PATCH /api/admin/auth/profile`
In `AdminAuthController` / `AdminAuthService`:

1. **Accept Payload:** `{ fullName?: string; avatarUrl?: string; oldAvatarUrl?: string }`.
2. **Retrieve Current Avatar:** Query the database (`admin_users`) for the requesting user's current `avatar_url` (or fallback to `body.oldAvatarUrl`).
3. **Compare & Delete:**
   ```typescript
   if (body.avatarUrl && body.avatarUrl !== currentAvatarUrl) {
     const targetToDelete = body.oldAvatarUrl || currentAvatarUrl;
     if (targetToDelete) {
       await deleteR2Asset(this.s3Client, this.bucketName, targetToDelete);
     }
   }
   ```
4. **Update Database:** Update `full_name` and `avatar_url` in `admin_users`.
5. **Audit Log:** If an asset was deleted, record an entry in `admin_audit_logs` (event: `R2_AVATAR_CLEANUP`).
6. **Return Updated User Profile.**

---

#### C. Update `DELETE /api/admin/staff/:id`
In `StaffController` / `StaffService`:

1. Before deleting the staff record from `admin_users`, query the target staff member's record:
   ```typescript
   const staff = await this.db.query.adminUsers.findFirst({
     where: eq(adminUsers.id, staffId),
   });
   ```
2. If `staff.avatarUrl` exists:
   ```typescript
   if (staff.avatarUrl) {
     await deleteR2Asset(this.s3Client, this.bucketName, staff.avatarUrl);
   }
   ```
3. Delete the staff record from `admin_users` (and cascade sessions).
4. Record `STAFF_DELETED` in `admin_audit_logs`.
5. Return: `{ success: true, message: "Staff member and associated assets deleted successfully." }`.

---

### 3. Build & Verify
1. Run `npm run build` in `ikisakitours-backend` to ensure 0 TypeScript compilation errors.
2. Verify that deleting an avatar or deleting a staff member logs `[R2 Asset Cleaned]` in server logs.
3. Push to remote git repository for Vercel deployment.
```

---

## 2. Summary of Frontend Adjustments in Admin Panel
The Admin Panel has already been prepared to work seamlessly with this backend cleanup:
1. **`src/services/auth.service.ts`**: `updateProfile` accepts `oldAvatarUrl?: string` alongside `avatarUrl`.
2. **`src/components/AdminSecurityModal.tsx`**: When an admin uploads a new WebP photo, the previous avatar URL is automatically sent as `oldAvatarUrl`.
3. **Client-Side WebP Conversion**: Photos are converted to `.webp` in the browser before sending to `/uploads/batch`.
4. **Cache Busting**: Avatar URLs include unique version timestamps so the browser refreshes the image instantly.
