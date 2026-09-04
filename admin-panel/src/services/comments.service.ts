import { fetcher } from '@/lib/api-client';

export interface Comment {
  id: string;
  source: string;
  isPubliclyVisible: boolean;
  firstName: string;
  lastName: string;
  authorName: string;
  country: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  isVip: boolean;
  hasAccess: boolean;
  content: string;
  date: string;
  adminReply?: string;
  rating?: number;
}

export interface CommentListResponse {
  comments: Comment[];
  totalComments: number;
  averageRating: number;
}

export interface ReplyCommentPayload {
  adminReply: string; // Match your ReplyCommentDto field name
}

export const CommentsService = {
  // GET /comments (or /api/comments depending on your route prefix)
  getAll: () => fetcher<CommentListResponse>('/comments'),

  // POST /comments/:id/reply
  reply: (id: string, payload: ReplyCommentPayload) =>
    fetcher<Comment>(`/comments/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};