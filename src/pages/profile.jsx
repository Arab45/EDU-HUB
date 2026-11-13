import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadProfile } from "../context/profileSlice";
import AppShell from "../components/AppShell";
import FollowButton from "../components/FollowButton";
import PostCard from "../components/PostCard";

function Profile() {
  const dispatch = useDispatch();
  const { userId, data: profile, status, error } = useSelector((state) => state.profile);

  useEffect(() => {
    if (userId && status === "idle") {
      dispatch(loadProfile(userId));
    }
  }, [dispatch, userId, status]);

  if (!userId) {
    return (
      <AppShell>
        <p role="alert" className="text-red-600">
          No logged-in user ID was found. Please sign in again.
        </p>
      </AppShell>
    );
  }

  if (status === "loading" || status === "idle") {
    return (
      <AppShell>
        <p role="status" className="text-slate-600">Loading your profile...</p>
      </AppShell>
    );
  }

  if (status === "failed") {
    return (
      <AppShell>
        <p role="alert" className="text-red-600">
          {error || "Unable to load your profile."}
        </p>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <p role="alert" className="text-red-600">The profile response was empty.</p>
      </AppShell>
    );
  }

  const displayName = profile.name ?? profile.fullName ?? "User";
  const initials = profile.initials ?? displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const posts = Array.isArray(profile.posts) ? profile.posts : [];

  return (
    <AppShell>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-800">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="break-words font-serif text-xl font-bold text-slate-900">
                {displayName}
              </p>
              <p className="break-words text-slate-500">{profile.institution ?? "—"}</p>
              <p className="break-words text-sm text-emerald-700">{profile.field ?? profile.position ?? "—"}</p>
            </div>
          </div>
          <FollowButton />
        </div>

        <p className="mt-4 text-slate-600">{profile.bio ?? "No bio available."}</p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
          <span>
            <span className="font-semibold text-slate-900">
              {profile.followers ?? "—"}
            </span>{" "}
            followers
          </span>
          <span>
            <span className="font-semibold text-slate-900">
              {profile.following ?? "—"}
            </span>{" "}
            following
          </span>
        </div>
      </div>

      <p className="mb-3 font-serif text-lg font-bold text-slate-900">
        Posts
      </p>
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p className="text-slate-500">No posts are available on this profile.</p>
      )}
    </AppShell>
  );
}

export default Profile;
