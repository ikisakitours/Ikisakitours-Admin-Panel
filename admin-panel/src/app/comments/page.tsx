"use client";

import { useState } from "react";
import CommentCard, { CommentCardProps } from "./components/comment-card";
import Navbar from "./components/navbar";

// 1. Updated Mock Data with commentType
const mockComments: (Omit<CommentCardProps, ""> & { isResponded?: boolean })[] = [
  {
    id: "c1",
    commentType: "post",
    tourTitle: "Bali Tropical Paradise Gateway 7-Day Tour",
    userName: "Sarah Jenkins",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
    commentText: "Are hotel transfers included if my arrival flight lands at midnight? The booking description lists shuttle times but doesn't mention late hour options.",
    initialIsVisible: true,
    isResponded: false,
  },
  {
    id: "c2",
    commentType: "website",
    userName: "Michael Chen",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150",
    commentText: "The dark mode toggle on the checkout page seems to flicker on Safari desktop. Thought you guys might want to check it out!",
    initialIsVisible: true,
    isResponded: true,
  },
  {
    id: "c3",
    commentType: "post",
    tourTitle: "Swiss Alps Extreme Ski Experience",
    userName: "Alex Rivera",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
    commentText: "This tour package looks fantastic, but do you offer customized gear rentals for larger sizes? Wanting to verify availability before booking a group slot.",
    initialIsVisible: false,
    isResponded: false,
  },
];

export default function CommentSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Types");
  const [selectedFilter, setSelectedFilter] = useState<string>("By Date");

  // 2. Dynamic Filtering Logic
  const filteredComments = mockComments.filter((comment) => {
    // Filter by Category/Type
    if (selectedCategory === "Website Feedback" && comment.commentType !== "website") return false;
    if (selectedCategory === "Specific Post" && comment.commentType !== "post") return false;

    // Filter by Response Status
    if (selectedFilter === "By Not Responded" && comment.isResponded) return false;

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
              Approve, toggle public display hooks, or post staff replies directly to website feedback or tour listings.
            </p>
          </div>
        </div>

        {/* Render Feed List */}
        <div>
          {filteredComments.length > 0 ? (
            filteredComments.map((comment) => (
              <CommentCard key={comment.id} {...comment} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-400 text-sm font-medium">No comments match the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}