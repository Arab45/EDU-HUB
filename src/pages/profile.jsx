import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AppShell from "../components/AppShell";
import FollowButton from "../components/FollowButton";
import PostCard from "../components/PostCard";
import StartChatButton from "../components/StartChatButton";
import { fetchProfile } from "../services/auth";
import {
  followingStatusChanged,
  loadFollowing,
} from "../context/followingSlice";
import { getBlogPostId } from "../services/social";

function Profile() {
  const dispatch = useDispatch();
  const { userId: routeUserId } = useParams();
  const currentUserId = useSelector((state) => state.profile.userId);
  const following = useSelector((state) => state.following);
  const profileId = routeUserId ?? currentUserId;
  const isOwnProfile = profileId === currentUserId;
  const [profile, setProfile] = useState(null);
  const [loadedProfileId, setLoadedProfileId] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profileId) return undefined;

    let active = true;
    fetchProfile(profileId)
      .then((response) => {
        if (active) {
          setProfile(
            response?.profile ?? response?.data?.profile ?? response?.data ?? response
          );
          setLoadedProfileId(profileId);
          setStatus("loaded");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load this profile."
          );
          setLoadedProfileId(profileId);
          setStatus("failed");
        }
      });
    return () => {
      active = false;
    };
  }, [profileId]);

  useEffect(() => {
    if (currentUserId && !isOwnProfile) {
      dispatch(loadFollowing(currentUserId));
    }
  }, [dispatch, currentUserId, isOwnProfile]);

  if (!profileId) {
    return (
      <AppShell>
        <p role="alert" className="text-red-600">
          No user ID was found. Please sign in again.
        </p>
      </AppShell>
    );
  }

  if (loadedProfileId !== profileId || status === "loading") {
    return (
      <AppShell>
        <p role="status" className="text-slate-600">Loading profile...</p>
      </AppShell>
    );
  }

  if (status === "failed") {
    return (
      <AppShell>
        <p role="alert" className="text-red-600">{error}</p>
      </AppShell>
    );
  }

  const displayName = profile?.name ?? profile?.fullName ?? profile?.username ?? "User";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const posts = Array.isArray(profile?.posts)
    ? profile.posts
    : Array.isArray(profile?.blogs)
      ? profile.blogs
      : [];
  const institution =
    profile?.institution ?? profile?.academic?.institution ?? "—";
  const field =
    profile?.field ?? profile?.fieldOfStudy ?? profile?.academic?.fieldOfStudy ?? profile?.position ?? "—";

  return (
    <AppShell>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-800">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="break-words font-serif text-xl font-bold text-slate-900">
                {displayName}
              </p>
              <p className="break-words text-slate-500">{institution}</p>
              <p className="break-words text-sm text-emerald-700">{field}</p>
            </div>
          </div>
          {!isOwnProfile && (
            <div className="flex flex-wrap gap-2">
              <FollowButton
                currentUserId={currentUserId}
                targetId={profileId}
                isFollowing={
                  following.userId === String(currentUserId) &&
                  following.ids.includes(String(profileId))
                }
                disabled={
                  following.userId !== String(currentUserId) ||
                  following.status !== "loaded"
                }
                onFollowingChange={(nowFollowing) =>
                  dispatch(
                    followingStatusChanged({
                      userId: currentUserId,
                      targetId: profileId,
                      isFollowing: nowFollowing,
                    })
                  )
                }
              />
              <StartChatButton
                currentUserId={currentUserId}
                user={{ id: profileId, name: displayName, institution }}
              />
            </div>
          )}
        </div>
        {following.error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {following.error}
          </p>
        )}

        <p className="mt-4 whitespace-pre-wrap break-words text-slate-600">
          {profile?.bio ?? "No bio available."}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
          <span>
            <span className="font-semibold text-slate-900">
              {profile?.followersCount ?? profile?.followers ?? "—"}
            </span>{" "}
            followers
          </span>
          <span>
            <span className="font-semibold text-slate-900">
              {profile?.followingCount ?? profile?.following ?? "—"}
            </span>{" "}
            following
          </span>
        </div>
      </div>

      <p className="mb-3 font-serif text-lg font-bold text-slate-900">Posts</p>
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <PostCard key={getBlogPostId(post) ?? index} post={post} />
        ))
      ) : (
        <p className="text-slate-500">No posts are available on this profile.</p>
      )}
    </AppShell>
  );
}

export default Profile;
