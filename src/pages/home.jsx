import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import PostCard from "../components/PostCard";
import { PrimaryButton } from "../components/primaryButton";
import FollowButton from "../components/FollowButton";
import { useDispatch, useSelector } from "react-redux";
import { loadProfile } from "../context/profileSlice";
import { useEffect, useMemo, useState } from "react";
import { fetchAllUsers } from "../services/auth";
import { getBlogPosts } from "../services/social";
import {
  followingStatusChanged,
  loadFollowing,
} from "../context/followingSlice";

function extractList(response, keys) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(response[key])) return response[key];
  }
  return extractList(response.data, keys);
}

function getUserId(user) {
  if (typeof user === "string" || typeof user === "number") {
    return String(user);
  }
  const id = user?._id ?? user?.id ?? user?.userId;
  return id == null ? null : String(id);
}

function getUserName(user) {
  return user?.fullName ?? user?.name ?? user?.username ?? "Researcher";
}

function getUserInstitution(user) {
  return (
    user?.institution ??
    user?.academic?.institution ??
    user?.profile?.institution ??
    ""
  );
}


function Home() {
  const dispatch = useDispatch();
  const { userId, data: profile, status } = useSelector((state) => state.profile);
  const following = useSelector((state) => state.following);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [postsStatus, setPostsStatus] = useState("loading");
  const [usersStatus, setUsersStatus] = useState("loading");
  const [postsError, setPostsError] = useState("");
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    if (userId && status === "idle") dispatch(loadProfile(userId));
  }, [dispatch, userId, status]);

  useEffect(() => {
    let active = true;
    getBlogPosts()
      .then((response) => {
        if (active) setPosts(extractList(response, ["posts", "blogs", "items"]));
      })
      .catch((error) => {
        if (active) {
          setPostsError(
            error.response?.data?.message ?? error.message ?? "Unable to load posts."
          );
        }
      })
      .finally(() => {
        if (active) setPostsStatus("loaded");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchAllUsers()
      .then((response) => {
        if (active) setUsers(extractList(response, ["users", "items"]));
      })
      .catch((error) => {
        if (active) {
          setUsersError(
            error.response?.data?.message ?? error.message ?? "Unable to load researchers."
          );
        }
      })
      .finally(() => {
        if (active) setUsersStatus("loaded");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (userId) dispatch(loadFollowing(userId));
  }, [dispatch, userId]);

  const visibleUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          getUserId(user) &&
          String(getUserId(user)) !== String(userId)
      ),
    [users, userId]
  );

  const firstName = (profile?.name ?? profile?.fullName ?? "Researcher")
    .trim()
    .split(/\s+/)[0];

  return (
    <AppShell maxWidth="max-w-6xl">
      <div className="mb-6 rounded-xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-6 text-white">
        <p className="font-serif text-2xl font-bold">Welcome back, {firstName}</p>
        <p className="mt-1 text-white/80">
          Here's what's new from the research community
        </p>
        <PrimaryButton to="/new-post" variant="accent" className="mt-4">
          Share an update
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {postsStatus === "loading" && (
            <p role="status" className="text-slate-500">Loading posts...</p>
          )}
          {postsError && <p role="alert" className="mb-4 text-red-600">{postsError}</p>}
          {postsStatus === "loaded" && !postsError && posts.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-500">
              No posts yet. Share the first research update.
            </p>
          )}
          {posts.map((post) => (
            <PostCard key={post._id ?? post.id} post={post} />
          ))}
        </div>

        <aside>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 font-serif text-base font-bold text-slate-900">
              Researchers to follow
            </p>
            <div className="flex flex-col gap-3">
              {usersStatus === "loading" && (
                <p role="status" className="text-sm text-slate-500">Loading researchers...</p>
              )}
              {usersError && <p role="alert" className="text-sm text-red-600">{usersError}</p>}
              {following.status === "loading" && (
                <p role="status" className="text-sm text-slate-500">
                  Checking follow status...
                </p>
              )}
              {following.error && (
                <p role="alert" className="text-sm text-red-600">
                  {following.error}
                </p>
              )}
              {usersStatus === "loaded" && !usersError && visibleUsers.length === 0 && (
                <p className="text-sm text-slate-500">No other researchers found yet.</p>
              )}
              {visibleUsers.map((user) => {
                const id = getUserId(user);
                const name = getUserName(user);
                const initials = name
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                <div
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <Link to={`/profile/${id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {getUserInstitution(user)}
                      </p>
                    </div>
                  </Link>
                  <FollowButton
                    size="sm"
                    currentUserId={userId}
                    targetId={id}
                    isFollowing={following.userId === String(userId) && following.ids.includes(id)}
                    disabled={following.userId !== String(userId) || following.status !== "loaded"}
                    onFollowingChange={(nowFollowing) =>
                      dispatch(
                        followingStatusChanged({
                          userId,
                          targetId: id,
                          isFollowing: nowFollowing,
                        })
                      )
                    }
                  />
                </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

export default Home;
