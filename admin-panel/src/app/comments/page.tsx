"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import CommentCard from "./components/comment-card";
import Navbar from "./components/navbar";
import { CommentsService, Comment } from "@/services/comments.service";
import { PackageReviewsService, PackageReview } from "@/services/package-reviews.service";

export default function CommentSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Types");
  const [selectedFilter, setSelectedFilter] = useState<string>("By Date");
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch both website comments and package reviews on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [commentsRes, reviewsRes] = await Promise.all([
          CommentsService.getAll().catch(() => ({ comments: [] })),
          PackageReviewsService.getAll().catch(() => []),
        ]);

        // Normalize website comments
        const formattedComments = (commentsRes.comments || []).map((c: any) => ({
          ...c,
          itemType: "website",
        }));

        // Normalize package reviews to match comment card structure
        const formattedReviews = (reviewsRes || []).map((r: PackageReview) => ({
          id: r.id,
          source: r.packageName,
          itemType: "package-review",
          rating: r.rating,
          isPubliclyVisible: true,
          authorName: r.fullName,
          avatarUrl: null,
          content: r.experience,
          imageUrls: r.imageUrls,
          adminReply: r.adminReply,
          createdAt: r.createdAt,
        }));

        // Combine and sort by date descending
        const combined = [...formattedComments, ...formattedReviews].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setItems(combined);
      } catch (err: any) {
        setError(err.message || "Failed to load reviews and comments");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 2. Handle updating an item state locally after admin replies
  const handleReplyUpdated = (updatedItem: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? { ...item, adminReply: updatedItem.adminReply } : item))
    );
  };

  // 3. Dynamic Filtering Logic over Combined Data
  const filteredItems = items.filter((item) => {
    const isWebsiteType = item.itemType === "website";

    // Filter by Category/Type
    if (selectedCategory === "Website Feedback" && !isWebsiteType) return false;
    if (selectedCategory === "Package Review" && isWebsiteType) return false;

    // Filter by Response Status
    if (selectedFilter === "By Not Responded") {
      if (isWebsiteType || item.adminReply) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100/40 p-8">
      {/* Navbar with active filter state */}
      <Navbar
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        filter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      <div className="max-w-4xl mx-auto mt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Reviews & Comments</h1>
            <p className="text-sm text-slate-500 mt-1">
              Approve website feedback, view tour star ratings, and post staff replies.
            </p>
          </div>
        </div>

        {/* State Rendering: Loading, Error, or Data List */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 text-sm font-medium animate-pulse">Loading reviews and comments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-rose-50 rounded-xl border border-rose-200">
            <p className="text-rose-600 text-sm font-semibold">Error: {error}</p>
          </div>
        ) : (
          <div>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const commentType = item.itemType === "website" ? "website" : "package-review";
                
                return (
                  <CommentCard
                    key={item.id}
                    id={item.id}
                    commentType={commentType}
                    tourTitle={commentType === "package-review" ? item.source : undefined}
                    userName={item.authorName || `${item.firstName || ""} ${item.lastName || ""}`.trim()}
                    userAvatar={item.avatarUrl || ""}
                    commentText={item.content}
                    initialIsVisible={item.isPubliclyVisible ?? true}
                    adminReply={item.adminReply}
                    rating={item.rating}
                    imageUrls={item.imageUrls}
                    onReplyUpdated={handleReplyUpdated}
                  />
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-400 text-sm font-medium">No reviews or comments match the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}