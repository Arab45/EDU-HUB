import { useState } from "react";

function FollowButton({ size = "md" }) {
  const [following, setFollowing] = useState(false);
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-sm" : "px-5 py-2";

  return (
    <button
      type="button"
      onClick={() => setFollowing((f) => !f)}
      className={`shrink-0 rounded-xl font-semibold transition-colors duration-300 ease-in-out ${sizeClasses} ${
        following
          ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
          : "bg-emerald-900 text-white hover:bg-emerald-800"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

export default FollowButton;
