// src/services/package-reviews.service.ts
import { fetcher } from '@/lib/api-client';

export type CommentType = 'WEBSITE' | 'PACKAGE';

export interface PackageReview {
  id: string;
  packageId: string;
  packageName: string;
  type: CommentType;
  fullName: string;
  email: string;
  rating: number;
  experience: string;
  imageUrls: string[];
  adminReply: string | null;
  createdAt: string;
}

export interface ReplyPackageReviewPayload {
  adminReply: string;
}

export const PackageReviewsService = {
  // GET /api/comments/package-reviews (Fetch all package reviews for the admin panel)
  getAll: () => fetcher<PackageReview[]>('/comments/package-reviews'),

  // PATCH /api/comments/package-review/:id/reply (Send or update an admin reply)
  reply: (reviewId: string, payload: ReplyPackageReviewPayload) =>
    fetcher<PackageReview>(`/comments/package-review/${reviewId}/reply`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // DELETE /api/comments/package-review/:id (Optional: Delete a review if needed)
  remove: (reviewId: string) =>
    fetcher<{ message: string }>(`/comments/package-review/${reviewId}`, {
      method: 'DELETE',
    }),
};