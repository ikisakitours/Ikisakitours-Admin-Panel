export type CommentItemType = "website" | "package-review";

export interface FeedbackItem {
  id: string;
  referenceId?: string;
  itemType: CommentItemType;
  source?: string; // Package Name or Website origin
  authorName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  country?: string;
  avatarUrl?: string | null;
  rating?: number | null;
  content: string;
  isPubliclyVisible: boolean;
  isVerified?: boolean;
  isVip?: boolean;
  hasAccess?: boolean;
  adminReply?: string | null;
  imageUrls?: string[];
  createdAt: string;
}

export interface CommentSummaryStats {
  total: number;
  averageRating: number;
  packageReviews: number;
  websiteFeedback: number;
  awaitingReply: number;
  publiclyVisible: number;
  new24h: number;
}
