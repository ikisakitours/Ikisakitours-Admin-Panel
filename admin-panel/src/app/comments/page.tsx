import CommentCard from "./components/comment-card";
import Navbar from "./components/navbar"

const mockComments = [
  {
    id: "c1",
    tourTitle: "Bali Tropical Paradise Gateway 7-Day Tour",
    userName: "Sarah Jenkins",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
    commentText: "Are hotel transfers included if my arrival flight lands at midnight? The booking description lists shuttle times but doesn't mention late hour options.",
    initialIsVisible: true,
  },
  {
    id: "c2",
    tourTitle: "Swiss Alps Extreme Ski Experience",
    userName: "Alex Rivera",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
    commentText: "This tour package looks fantastic, but do you offer customized gear rentals for larger sizes? Wanting to verify availability before booking a group slot.",
    initialIsVisible: false,
  }
];

export default function commentsection() {
    return (
    <div className="min-h-screen bg-slate-100/40 p-8">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800">Review & Comments</h1>
          <p className="text-sm text-slate-500 mt-1">Approve, toggle public display hooks, or post staff replies directly to travel listings.</p>
        </div>

        {/* Render Feed List */}
        <div>
          {mockComments.map((comment) => (
            <CommentCard key={comment.id} {...comment} />
          ))}
        </div>
      </div>
    </div>
  );
}