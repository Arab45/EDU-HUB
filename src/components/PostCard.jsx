import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiEdit2,
  FiHeart,
  FiMessageCircle,
  FiMoreVertical,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  commentOnPost,
  deleteBlogPost,
  getComments,
  getLikes,
  getBlogPostId,
  likePost,
  unlikePost,
  updateBlogPost,
} from "../services/social";

function unwrap(response) {
  let value = response;
  while (value && typeof value === "object" && !Array.isArray(value)) {
    if (value.data !== undefined) {
      value = value.data;
      continue;
    }
    break;
  }
  return value;
}

function extractRecords(response, collectionName) {
  const value = unwrap(response);
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value[collectionName])) return value[collectionName];
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.relations)) return value.relations;
  return [];
}

function extractCount(response, collectionName, countNames) {
  const value = unwrap(response);
  if (Array.isArray(value)) return value.length;
  if (!value || typeof value !== "object") return null;

  for (const name of countNames) {
    const count = Number(value[name]);
    if (Number.isFinite(count)) return count;
  }

  return Array.isArray(value[collectionName])
    ? value[collectionName].length
    : null;
}

function getRelatedUserId(record) {
  const user =
    record?.user ??
    record?.author ??
    record?.liker ??
    record?.userId ??
    record?.createdBy;
  const id =
    typeof user === "string" || typeof user === "number"
      ? user
      : user?._id ?? user?.id ?? user?.userId;
  return id == null ? null : String(id);
}

function initialCount(value) {
  if (Array.isArray(value)) return value.length;
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

function getCommentAuthor(comment) {
  const author = comment.author ?? comment.user ?? comment.createdBy;
  if (typeof author === "string") return author;
  return author?.fullName ?? author?.name ?? comment.authorName ?? "Researcher";
}

function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const currentUserId = useSelector((state) => state.profile.userId);
  const postId = getBlogPostId(post);
  const author = post.author ?? post.user ?? {};
  const authorName =
    typeof author === "string"
      ? author
      : author.fullName ?? author.name ?? "Researcher";
  const authorId =
    (typeof author === "object"
      ? author._id ?? author.id ?? author.userId
      : author) ??
    (typeof post.authorId === "object"
      ? post.authorId?._id ?? post.authorId?.id
      : post.authorId) ??
    (typeof post.userId === "object"
      ? post.userId?._id ?? post.userId?.id
      : post.userId);
  const isAuthor =
    currentUserId != null &&
    authorId != null &&
    String(currentUserId) === String(authorId);
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
  const initials = authorName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() =>
    initialCount(post.likeCount ?? post.likes)
  );
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState(() =>
    Array.isArray(post.comments) ? post.comments : []
  );
  const [commentCount, setCommentCount] = useState(() =>
    initialCount(post.commentCount ?? post.comments)
  );
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title ?? "");
  const [editContent, setEditContent] = useState(content);
  const [postActionLoading, setPostActionLoading] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  useEffect(() => {
    if (!postId) return undefined;
    let active = true;

    getLikes(postId)
      .then((response) => {
        if (!active) return;
        const likes = extractRecords(response, "likes");
        const count = extractCount(response, "likes", [
          "total",
          "count",
          "likeCount",
          "likesCount",
        ]);
        if (count !== null) setLikeCount(count);
        else setLikeCount(likes.length);

        const unwrapped = unwrap(response);
        if (typeof unwrapped?.liked === "boolean") {
          setLiked(unwrapped.liked);
        } else if (typeof unwrapped?.isLiked === "boolean") {
          setLiked(unwrapped.isLiked);
        } else if (currentUserId && likes.length > 0) {
          setLiked(
            likes.some(
              (like) => getRelatedUserId(like) === String(currentUserId)
            )
          );
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load likes."
          );
        }
      });

    getComments(postId)
      .then((response) => {
        if (!active) return;
        const loadedComments = extractRecords(response, "comments");
        setComments(loadedComments);
        const count = extractCount(response, "comments", [
          "total",
          "count",
          "commentCount",
          "commentsCount",
        ]);
        setCommentCount(count ?? loadedComments.length);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load comments."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [postId, currentUserId]);

  const toggleLike = async () => {
    if (!postId || likeLoading) return;
    setLikeLoading(true);
    setError("");
    try {
      if (liked) {
        await unlikePost(postId);
        setLiked(false);
        setLikeCount((count) => Math.max(0, count - 1));
      } else {
        await likePost(postId);
        setLiked(true);
        setLikeCount((count) => count + 1);
      }

      const response = await getLikes(postId);
      const latestCount = extractCount(response, "likes", [
        "total",
        "count",
        "likeCount",
        "likesCount",
      ]);
      if (latestCount !== null) setLikeCount(latestCount);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          requestError.message ??
          "Unable to update this like."
      );
    } finally {
      setLikeLoading(false);
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!postId || !text || commentLoading) return;

    setCommentLoading(true);
    setError("");
    try {
      const response = await commentOnPost(postId, { content: text });
      const createdComment = unwrap(response);
      if (
        createdComment &&
        typeof createdComment === "object" &&
        (createdComment.content || createdComment.text)
      ) {
        setComments((current) => [...current, createdComment]);
        setCommentCount((count) => count + 1);
      } else {
        const commentsResponse = await getComments(postId);
        const loadedComments = extractRecords(commentsResponse, "comments");
        setComments(loadedComments);
        const count = extractCount(commentsResponse, "comments", [
          "total",
          "count",
          "commentCount",
          "commentsCount",
        ]);
        setCommentCount(count ?? loadedComments.length);
      }
      setCommentText("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          requestError.message ??
          "Unable to add your comment."
      );
    } finally {
      setCommentLoading(false);
    }
  };

  const savePost = async (event) => {
    event.preventDefault();
    if (!postId || !editContent.trim() || postActionLoading) return;

    setPostActionLoading(true);
    setError("");
    try {
      const response = await updateBlogPost(postId, {
        ...(post.title !== undefined || editTitle.trim()
          ? { title: editTitle.trim() }
          : {}),
        content: editContent.trim(),
      });
      const updatedPost = unwrap(response);
      onPostUpdated?.({
        ...post,
        ...(updatedPost?.post ?? updatedPost?.blog ?? updatedPost),
        ...(post.title !== undefined || editTitle.trim()
          ? { title: editTitle.trim() }
          : {}),
        content: editContent.trim(),
      });
      setEditing(false);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          requestError.message ??
          "Unable to update this post."
      );
    } finally {
      setPostActionLoading(false);
    }
  };

  const removePost = async () => {
    if (!postId || postActionLoading) return;
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setPostActionLoading(true);
    setError("");
    try {
      await deleteBlogPost(postId);
      onPostDeleted?.(postId);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          requestError.message ??
          "Unable to delete this post."
      );
    } finally {
      setPostActionLoading(false);
      setMenuOpen(false);
    }
  };

  return (
    <article className="mb-5 min-w-0 rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-300 ease-in-out hover:border-slate-300 sm:p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
          {post.authorInitials ?? initials}
        </div>
        <div className="min-w-0 flex-1">
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
        {isAuthor && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Post options"
              aria-expanded={menuOpen}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <FiMoreVertical />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setEditTitle(post.title ?? "");
                    setEditContent(content);
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <FiEdit2 /> Edit post
                </button>
                <button
                  type="button"
                  disabled={postActionLoading}
                  onClick={removePost}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <FiTrash2 /> Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.title && (
        postId ? (
          <Link
            to={`/posts/${postId}`}
            className="mb-1 block break-words font-serif text-lg font-bold text-slate-900 hover:text-emerald-800"
          >
            {post.title}
          </Link>
        ) : (
          <p className="mb-1 break-words font-serif text-lg font-bold text-slate-900">
            {post.title}
          </p>
        )
      )}
      {postId ? (
        <Link
          to={`/posts/${postId}`}
          className="mb-3 block whitespace-pre-wrap break-words text-slate-600"
        >
          {content}
        </Link>
      ) : (
        <p className="mb-3 whitespace-pre-wrap break-words text-slate-600">{content}</p>
      )}

      {image && (
        <button
          type="button"
          onClick={() => setImageOpen(true)}
          aria-label="View image"
          className="mb-3 block w-full cursor-zoom-in"
        >
          <img
            src={image}
            alt={post.title ?? "Post attachment"}
            className="max-h-80 w-full rounded-xl object-cover"
          />
        </button>
      )}
      {postId && (
        <Link
          to={`/posts/${postId}`}
          className="mb-3 inline-block text-sm font-semibold text-emerald-800 hover:underline"
        >
          View full post
        </Link>
      )}

      <div className="flex items-center gap-5 border-t border-slate-100 pt-3 text-sm text-slate-500">
        <button
          type="button"
          onClick={toggleLike}
          disabled={!postId || likeLoading}
          aria-pressed={liked}
          aria-label={liked ? "Unlike post" : "Like post"}
          className={`flex items-center gap-1.5 transition-colors duration-300 ease-in-out disabled:opacity-60 ${
            liked ? "text-orange-500" : "hover:text-orange-500"
          }`}
        >
          <FiHeart className={liked ? "fill-orange-500" : ""} />
          <span>{likeCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((open) => !open)}
          aria-expanded={commentsOpen}
          className="flex items-center gap-1.5 transition-colors duration-300 ease-in-out hover:text-emerald-700"
        >
          <FiMessageCircle />
          <span>{commentCount}</span>
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {commentsOpen && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {comments.length === 0 ? (
            <p className="mb-3 text-sm text-slate-400">No comments yet.</p>
          ) : (
            <div className="mb-3 divide-y divide-slate-200">
              {comments.map((comment, index) => (
                <div
                  key={comment._id ?? comment.id ?? index}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <p className="break-words text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {getCommentAuthor(comment)}:{" "}
                    </span>
                    {comment.content ?? comment.text ?? ""}
                  </p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={submitComment} className="flex items-end gap-2">
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Write a comment..."
              aria-label="Write a comment"
              className="min-w-0 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || commentLoading || !postId}
              aria-label="Post comment"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commentLoading ? "…" : <FiSend />}
            </button>
          </form>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !postActionLoading) {
              setEditing(false);
            }
          }}
        >
          <form
            onSubmit={savePost}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-post-title-${postId}`}
            className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id={`edit-post-title-${postId}`} className="font-serif text-xl font-bold">
                Edit post
              </h2>
              <button
                type="button"
                disabled={postActionLoading}
                onClick={() => setEditing(false)}
                aria-label="Close edit form"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <FiX />
              </button>
            </div>
            {post.title !== undefined && (
              <label className="mb-3 block text-sm font-medium text-slate-700">
                Title
                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  maxLength={160}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            )}
            <label className="mb-4 block text-sm font-medium text-slate-700">
              Content
              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                rows={6}
                maxLength={5000}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={postActionLoading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editContent.trim() || postActionLoading}
                className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {postActionLoading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {imageOpen && image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="presentation"
          onClick={() => setImageOpen(false)}
        >
          <button
            type="button"
            onClick={() => setImageOpen(false)}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <FiX />
          </button>
          <img
            src={image}
            alt={post.title ?? "Post attachment"}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </article>
  );
}

export default PostCard;
