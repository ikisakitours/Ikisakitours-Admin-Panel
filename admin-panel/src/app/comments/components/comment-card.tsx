"use client";

import { useState } from "react";

export interface CommentCardProps {
  id: string;
  commentType: "website" | "post"; 
  tourTitle?: string;              
  userName: string;
  userAvatar: string;
  commentText: string;
  initialIsVisible: boolean;
}

export default function CommentCard({
  id,
  commentType,
  tourTitle,
  userName,
  userAvatar,
  commentText,
  initialIsVisible,
}: CommentCardProps) {
  const [isVisible, setIsVisible] = useState(initialIsVisible);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Handler for toggle visibility on the public web app
  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
    // TODO: Connect to your API to update database visibility state here
    console.log(`Comment ${id} visibility toggled to: ${!isVisible}`);
  };

  // Handler for saving and pushing the reply to database
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // TODO: Connect to your API to save the reply in the database
    console.log(`Sending reply to comment ${id}:`, replyText);

    setReplyText("");
    setIsReplying(false);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6 mb-4 transition-all hover:shadow-md">
      
      {/* Top Section: Comment Type Tag & Visibility Toggle Switch */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        
        {/* Dynamic Type Tag */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Source:
          </span>

          {commentType === "website" ? (
            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-100 flex items-center gap-1.5">
              <span>🌐</span> About Website
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 flex items-center gap-1.5">
              <span>📌</span> Tour: {tourTitle || "Specific Post"}
            </span>
          )}
        </div>

        {/* Visibility Toggle Controls */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium transition-colors ${isVisible ? "text-slate-600" : "text-slate-400"}`}>
            {isVisible ? "Publicly Visible" : "Hidden on Website"}
          </span>
          <button
            onClick={handleToggleVisibility}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isVisible ? "bg-emerald-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isVisible ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Middle Section: User Metadata Profile & The Comment Content */}
      <div className="flex gap-4 items-start mb-4">
        {/* User Profile Pic */}
        <img
          src={userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 mb-0.5">{userName}</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {commentText}
          </p>
        </div>
      </div>

      {/* Bottom Section: Interactive Action Toolbar */}
      <div className="flex items-center justify-end pt-2">
        {!isReplying && (
          <button
            onClick={() => setIsReplying(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reply to Comment
          </button>
        )}
      </div>

      {/* Expandable Form: Input Section to Post Reply Responses */}
      {isReplying && (
        <form onSubmit={handleSendReply} className="mt-4 pt-4 border-t border-slate-100 transition-all">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Admin Response</label>
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your official response to this client query..."
            className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setIsReplying(false);
                setReplyText("");
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Send & Publish Reply
            </button>
          </div>
        </form>
      )}

    </div>
  );
}