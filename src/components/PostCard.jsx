import { useState } from "react";
import { FiHeart, FiMessageCircle } from "react-icons/fi";

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((count) => (liked ? count - 1 : count + 1));
  };

  return (
    <article className="mb-5 rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-300 ease-in-out hover:border-slate-300">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
          {post.authorInitials}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{post.author}</p>
          <p className="text-sm text-slate-500">
            {post.institution} · {post.date}
          </p>
        </div>
      </div>

      <p className="mb-1 font-serif text-lg font-bold text-slate-900">
        {post.title}
      </p>
      <p className="mb-3 text-slate-600">{post.body}</p>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="mb-3 max-h-80 w-full rounded-xl object-cover"
        />
      )}

      <div className="flex items-center gap-5 border-t border-slate-100 pt-3 text-sm text-slate-500">
        <button
          type="button"
          onClick={toggleLike}
          className={`flex items-center gap-1.5 transition-colors duration-300 ease-in-out ${
            liked ? "text-orange-500" : "hover:text-orange-500"
          }`}
        >
          <FiHeart className={liked ? "fill-orange-500" : ""} />
          {likeCount}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 transition-colors duration-300 ease-in-out hover:text-emerald-700"
        >
          <FiMessageCircle />
          {post.comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
          {post.comments.length === 0 && (
            <p className="text-sm text-slate-400">No comments yet.</p>
          )}
          {post.comments.map((comment, i) => (
            <p key={i} className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {comment.author}:{" "}
              </span>
              {comment.text}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}

export default PostCard;
