"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import CommentCard from "./components/comment-card";
import Navbar from "./components/navbar";
import { CommentsService, Comment } from "@/services/comments.service";

export default function CommentSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Types");
  const [selectedFilter, setSelectedFilter] = useState<string>("By Date");
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch real comments from NestJS API on component mount
  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        const data = await CommentsService.getAll();
        setComments(data.comments || []);
      } catch (err: any) {
        setError(err.message || "Failed to load comments");
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, []);

  // 2. Handle updating a comment state locally after admin replies
  const handleReplyUpdated = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((item) => (item.id === updatedComment.id ? updatedComment : item))
    );
  };

  // 3. Dynamic Filtering Logic over Real Data
  const filteredComments = comments.filter((comment) => {
    const isWebsiteType = comment.source?.toLowerCase() === "website";

    // Filter by Category/Type
    if (selectedCategory === "Website Feedback" && !isWebsiteType) return false;
    if (selectedCategory === "Specific Post" && isWebsiteType) return false;

    // Filter by Response Status (Website comments ignored since replies are disabled for them)
    if (selectedFilter === "By Not Responded") {
      if (isWebsiteType || comment.adminReply) {
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
              Approve, toggle public display hooks, or post staff replies directly to tour listings.
            </p>
          </div>
        </div>

        {/* State Rendering: Loading, Error, or Data List */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 text-sm font-medium animate-pulse">Loading comments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-rose-50 rounded-xl border border-rose-200">
            <p className="text-rose-600 text-sm font-semibold">Error: {error}</p>
          </div>
        ) : (
          <div>
            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => {
                const commentType = comment.source?.toLowerCase() === "website" ? "website" : "post";
                
                return (
                  <CommentCard
                    key={comment.id}
                    id={comment.id}
                    commentType={commentType}
                    tourTitle={comment.source !== "website" ? comment.source : undefined}
                    userName={comment.authorName || `${comment.firstName} ${comment.lastName}`}
                    userAvatar={comment.avatarUrl || ""}
                    commentText={comment.content}
                    initialIsVisible={comment.isPubliclyVisible}
                    adminReply={comment.adminReply}
                    onReplyUpdated={handleReplyUpdated}
                  />
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-400 text-sm font-medium">No comments match the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}