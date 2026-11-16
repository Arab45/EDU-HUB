import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import AppShell from "../components/AppShell";
import PostCard from "../components/PostCard";
import ResearcherCard from "../components/ResearcherCard";
import LoadingState from "../components/LoadingState";
import { getBlogPostId, getFollowing, search } from "../services/social";

function extractList(response, keys) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(response[key])) return response[key];
  }
  return extractList(response.data, keys);
}

function getId(user) {
  const person = user?.following ?? user?.user ?? user?.follower ?? user;
  const id = typeof person === "string"
    ? person
    : person?._id ?? person?.id ?? person?.userId;
  return id == null ? null : String(id);
}

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message ?? error?.message ?? fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

const SEARCH_LIMIT = 20;

function Search() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchError, setSearchError] = useState("");
  const [following, setFollowing] = useState({
    userId: null,
    ids: [],
    error: "",
  });
  const currentUserId = useSelector((state) => state.profile.userId);

  useEffect(() => {
    const term = query.trim();
    if (!term) return undefined;

    let active = true;
    const timer = setTimeout(() => {
      setSearchStatus("loading");
      setSearchError("");
      search(term, page, SEARCH_LIMIT)
      .then((response) => {
        if (active) {
          const result = response?.data ?? response;
          setPosts(Array.isArray(result?.posts) ? result.posts : []);
          setResearchers(Array.isArray(result?.users) ? result.users : []);
          setPostCount(Number(result?.postCount ?? result?.posts?.length ?? 0));
          setUserCount(Number(result?.userCount ?? result?.users?.length ?? 0));
        }
      })
      .catch((requestError) => {
        if (active) {
          setSearchError(getErrorMessage(requestError, "Unable to search right now."));
        }
      })
      .finally(() => {
        if (active) setSearchStatus("loaded");
      });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, page]);

  useEffect(() => {
    if (!currentUserId) return undefined;
    let active = true;
    getFollowing(currentUserId)
      .then((response) => {
        if (active) {
          setFollowing({
            userId: String(currentUserId),
            ids: extractList(response, ["following", "users", "items", "relations"])
              .map(getId)
              .filter(Boolean),
            error: "",
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setFollowing({
            userId: String(currentUserId),
            ids: [],
            error: getErrorMessage(requestError, "Unable to load follow status."),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [currentUserId]);

  const visibleResearchers = researchers.filter(
    (researcher) =>
      getId(researcher) && getId(researcher) !== String(currentUserId)
  );
  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(postCount, userCount) / SEARCH_LIMIT)
  );
  const hasQuery = Boolean(query.trim());
  const followingLoading = Boolean(
    currentUserId && following.userId !== String(currentUserId)
  );
  const followingError =
    following.userId === String(currentUserId) ? following.error : "";

  return (
    <AppShell>
      <p className="mb-1 font-serif text-2xl font-bold text-slate-900">
        Search
      </p>
      <p className="mb-6 text-slate-500">
        Search researchers by name or username, and posts by content
      </p>

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors duration-300 ease-in-out focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
        <FiSearch className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
            setSearchStatus(event.target.value.trim() ? "loading" : "idle");
            setSearchError("");
          }}
          placeholder="Search people and posts..."
          className="flex-1 border-none text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {!hasQuery ? (
        <p className="text-slate-500">Enter a name, username, or post keyword to search.</p>
      ) : searchStatus === "loading" ? (
        <LoadingState label="Searching..." />
      ) : searchError ? (
        <p role="alert" className="text-red-600">{searchError}</p>
      ) : (
        <>
          {followingLoading && currentUserId && (
            <LoadingState label="Loading your follow status..." className="mb-4" />
          )}
          {followingError && (
            <p role="alert" className="mb-3 text-sm text-red-600">{followingError}</p>
          )}
          {posts.length > 0 && (
            <section aria-labelledby="post-results-title" className="mb-8">
              <h2 id="post-results-title" className="mb-3 font-serif text-lg font-bold text-slate-900">
                Posts ({postCount})
              </h2>
              {posts.map((post, index) => (
                <PostCard key={getBlogPostId(post) ?? index} post={post} />
              ))}
            </section>
          )}
          {visibleResearchers.length > 0 && (
            <section aria-labelledby="researcher-results-title" className="mb-6">
              <h2 id="researcher-results-title" className="mb-3 font-serif text-lg font-bold text-slate-900">
                Researchers ({userCount})
              </h2>
              {visibleResearchers.map((researcher) => {
                const id = getId(researcher);
                return (
                  <ResearcherCard
                    key={id}
                    researcher={researcher}
                    currentUserId={currentUserId}
                    isFollowing={
                      following.userId === String(currentUserId) &&
                      following.ids.includes(id)
                    }
                    onFollowingChange={(nowFollowing) =>
                      setFollowing((current) => ({
                        ...current,
                        ids: nowFollowing
                          ? [...new Set([...current.ids, id])]
                          : current.ids.filter((followingId) => followingId !== id),
                      }))
                    }
                  />
                );
              })}
            </section>
          )}
          {posts.length === 0 && visibleResearchers.length === 0 && (
            <p className="text-slate-500">No posts or researchers found.</p>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

export default Search;
