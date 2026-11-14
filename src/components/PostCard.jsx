import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMessageCircle } from "react-icons/fi";

function PostCard({ post }) {
  const author = post.author ?? post.user ?? {};
  const authorName =
    typeof author === "string"
      ? author
      : author.fullName ?? author.name ?? "Researcher";
  const authorId =
    typeof author === "object"
      ? author._id ??
        author.id ??
        post.authorId?._id ??
        post.authorId?.id ??
        (typeof post.authorId === "string" ? post.authorId : undefined)
      : post.authorId ?? author._id ?? author.id;
  const institution =
    post.institution ?? author.institution ?? author.academic?.institution ?? "";
  const attachments = Array.isArray(post.attachments) ? post.attachments : [];
  const image =
    post.image ??
    attachments.find((attachment) => typeof attachment === "string") ??
    attachments.find((attachment) => typeof attachment?.url === "string")?.url;
  const content = post.content ?? post.body ?? "";
  const dateValue = post.createdAt ?? post.date;
  const parsedDate = dateValue ? new Date(dateValue) : null;
  const date =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString()
      : "";
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const likes = Array.isArray(post.likes) ? post.likes.length : post.likes ?? 0;
  const initials = authorName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((count) => Math.max(0, count + (liked ? -1 : 1)));
  };

  return (
    <article className="mb-5 min-w-0 rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-300 ease-in-out hover:border-slate-300 sm:p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
          {post.authorInitials ?? initials}
        </div>
        <div className="min-w-0">
          {authorId ? (
            <Link
              to={`/profile/${authorId}`}
              className="truncate font-semibold text-slate-900 hover:text-emerald-800"
            >
              {authorName}
            </Link>
          ) : (
            <p className="truncate font-semibold text-slate-900">{authorName}</p>
          )}
          <p className="break-words text-sm text-slate-500">
            {[institution, date].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {post.title && (
        <p className="mb-1 break-words font-serif text-lg font-bold text-slate-900">
          {post.title}
        </p>
      )}
      <p className="mb-3 whitespace-pre-wrap break-words text-slate-600">{content}</p>

      {image && (
        <img
          src={image}
          alt={post.title ?? "Post attachment"}
          className="mb-3 max-h-80 w-full rounded-xl object-cover"
        />
      )}

      {(post.likes !== undefined || comments.length > 0) && (
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
          {comments.length}
        </button>
      </div>
      )}

      {showComments && (
        <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
          {comments.length === 0 && (
            <p className="text-sm text-slate-400">No comments yet.</p>
          )}
          {comments.map((comment, i) => (
            <p key={comment._id ?? comment.id ?? i} className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {(typeof comment.author === "string"
                  ? comment.author
                  : comment.author?.fullName ?? comment.author?.name) ??
                  "Researcher"}
                :{" "}
              </span>
              {comment.content ?? comment.text}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}

export default PostCard;
