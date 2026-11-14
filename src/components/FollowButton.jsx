import { useState } from "react";
import { useDispatch } from "react-redux";
import { followingStatusChanged } from "../context/followingSlice";
import { followUser, unfollowUser } from "../services/social";

function FollowButton({
  currentUserId,
  targetId,
  isFollowing = false,
  onFollowingChange,
  disabled = false,
  size = "md",
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-sm" : "px-5 py-2";

  const toggleFollowing = async () => {
    if (
      !currentUserId ||
      !targetId ||
      currentUserId === targetId ||
      disabled ||
      loading
    ) return;

    setLoading(true);
    setError("");
    try {
      if (isFollowing) {
        await unfollowUser(targetId);
      } else {
        await followUser(targetId);
      }
      const nextFollowing = !isFollowing;
      dispatch(
        followingStatusChanged({
          userId: currentUserId,
          targetId,
          isFollowing: nextFollowing,
        })
      );
      onFollowingChange?.(nextFollowing);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          requestError.message ??
          "Unable to update follow status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={toggleFollowing}
        disabled={
          !currentUserId ||
          !targetId ||
          currentUserId === targetId ||
          disabled ||
          loading
        }
        className={`rounded-xl font-semibold transition-colors duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses} ${
          isFollowing
            ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
            : "bg-emerald-900 text-white hover:bg-emerald-800"
        }`}
      >
        {loading ? "Saving..." : isFollowing ? "Unfollow" : "Follow"}
      </button>
      {error && (
        <p role="alert" className="mt-1 max-w-40 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default FollowButton;
