import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import AppShell from "../components/AppShell";
import ResearcherCard from "../components/ResearcherCard";
import { fetchAllUsers } from "../services/auth";
import { getFollowing } from "../services/social";

function extractList(response, keys) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(response[key])) return response[key];
  }
  return extractList(response.data, keys);
}

function getId(user) {
  const id = user?._id ?? user?.id ?? user?.userId;
  return id == null ? null : String(id);
}

function Search() {
  const [query, setQuery] = useState("");
  const [researchers, setResearchers] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followingError, setFollowingError] = useState("");
  const currentUserId = useSelector((state) => state.profile.userId);

  useEffect(() => {
    let active = true;
    fetchAllUsers()
      .then((response) => {
        if (active) {
          setResearchers(extractList(response, ["users", "items"]));
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load researchers."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) return undefined;
    let active = true;
    getFollowing(currentUserId)
      .then((response) => {
        if (active) {
          setFollowingIds(
            extractList(response, ["following", "users", "items"])
              .map(getId)
              .filter(Boolean)
          );
        }
      })
      .catch((requestError) => {
        if (active) {
          setFollowingError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load follow status."
          );
        }
      });
    return () => {
      active = false;
    };
  }, [currentUserId]);

  const results = useMemo(
    () =>
      researchers.filter((researcher) => {
        const searchable = [
          researcher.fullName,
          researcher.name,
          researcher.username,
          researcher.institution,
          researcher.academic?.institution,
          researcher.field,
          researcher.fieldOfStudy,
          researcher.academic?.fieldOfStudy,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return (
          getId(researcher) &&
          getId(researcher) !== String(currentUserId) &&
          searchable.includes(query.toLowerCase())
        );
      }),
    [researchers, query, currentUserId]
  );

  return (
    <AppShell>
      <p className="mb-1 font-serif text-2xl font-bold text-slate-900">
        Search
      </p>
      <p className="mb-6 text-slate-500">
        Find researchers by name, institution, or field
      </p>

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors duration-300 ease-in-out focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
        <FiSearch className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, institution, or keyword..."
          className="flex-1 border-none text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {loading ? (
        <p role="status" className="text-slate-500">Loading researchers...</p>
      ) : error ? (
        <p role="alert" className="text-red-600">{error}</p>
      ) : (
        followingError && (
          <p role="alert" className="mb-3 text-sm text-red-600">{followingError}</p>
        )
      )}
      {!loading && !error && results.length === 0 ? (
        <p className="text-slate-500">No researchers found.</p>
      ) : !loading && !error ? (
        results.map((researcher) => {
          const id = getId(researcher);
          return (
            <ResearcherCard
              key={id}
              researcher={researcher}
              currentUserId={currentUserId}
              isFollowing={followingIds.includes(id)}
              onFollowingChange={(nowFollowing) =>
                setFollowingIds((current) =>
                  nowFollowing
                    ? [...new Set([...current, id])]
                    : current.filter((followingId) => followingId !== id)
                )
              }
            />
          );
        })
      ) : null}
    </AppShell>
  );
}

export default Search;
