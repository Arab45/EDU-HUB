import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit2, FiX } from "react-icons/fi";
import AppShell from "../components/AppShell";
import FollowButton from "../components/FollowButton";
import PostCard from "../components/PostCard";
import StartChatButton from "../components/StartChatButton";
import TagInputField from "../components/TagInput";
import { fetchProfile, updateProfile } from "../services/auth";
import {
  followingStatusChanged,
  loadFollowing,
} from "../context/followingSlice";
import { loadProfile } from "../context/profileSlice";
import { getProfilePictureUrl } from "../utils/profilePicture";
import LoadingState from "../components/LoadingState";
import {
  getBlogPostId,
  getBlogPosts,
  getFollowers,
  getFollowing,
} from "../services/social";

function extractList(response, keys) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(response[key])) return response[key];
  }
  return extractList(response.data, keys);
}

function getPostAuthorId(post) {
  const author = post.author ?? post.user ?? post.createdBy;
  const id =
    (typeof author === "string" ? author : author?._id ?? author?.id ?? author?.userId) ??
    (typeof post.authorId === "string"
      ? post.authorId
      : post.authorId?._id ?? post.authorId?.id) ??
    (typeof post.userId === "string" ? post.userId : post.userId?._id ?? post.userId?.id);
  return id == null ? null : String(id);
}

function getProfileForm(profile) {
  return {
    fullName: profile?.fullName ?? profile?.name ?? "",
    username: profile?.username ?? "",
    institution: profile?.institution ?? profile?.academic?.institution ?? "",
    fieldOfStudy: profile?.fieldOfStudy ?? profile?.academic?.fieldOfStudy ?? "",
    bio: profile?.bio ?? "",
    areaOfInterest: Array.isArray(profile?.areaOfInterest)
      ? profile.areaOfInterest
      : [],
    briefResearchFocus: profile?.briefResearchFocus ?? "",
  };
}

const PROFILE_TEXT_FIELDS = [
  "fullName",
  "username",
  "institution",
  "fieldOfStudy",
  "bio",
  "briefResearchFocus",
];

function getChangedProfileFields(original, updated) {
  const changed = {};
  for (const field of PROFILE_TEXT_FIELDS) {
    if (original[field] !== updated[field]) {
      changed[field] = updated[field];
    }
  }
  if (
    JSON.stringify(original.areaOfInterest) !==
    JSON.stringify(updated.areaOfInterest)
  ) {
    changed.areaOfInterest = updated.areaOfInterest;
  }
  if (updated.profilePicture instanceof File) {
    changed.profilePicture = updated.profilePicture;
  }
  return changed;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to preview the selected profile picture."));
      }
    };
    reader.onerror = () => reject(new Error("Unable to preview the selected profile picture."));
    reader.readAsDataURL(file);
  });
}

function getConnectionData(response, listKey) {
  let value = response;
  while (value && typeof value === "object" && !Array.isArray(value) && value.data !== undefined) {
    value = value.data;
  }

  const records = Array.isArray(value)
    ? value
    : value?.[listKey] ??
      value?.users ??
      value?.items ??
      value?.relations ??
      [];
  const relationKey = listKey === "followers" ? "follower" : "following";
  const people = Array.isArray(records)
    ? records.map((record) => record?.[relationKey] ?? record?.user ?? record)
    : [];
  const countValue =
    value?.total ??
    value?.count ??
    value?.[`${listKey}Count`] ??
    people.length;
  const count = Number(countValue);

  return {
    people: people.filter((person) => person && typeof person === "object"),
    count: Number.isFinite(count) ? count : people.length,
  };
}

function getConnectionId(person) {
  const id = person?._id ?? person?.id ?? person?.userId;
  return id == null ? null : String(id);
}

function getConnectionName(person) {
  return person?.fullName ?? person?.name ?? person?.username ?? "Researcher";
}

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message ?? error?.message ?? fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

function Profile() {
  const dispatch = useDispatch();
  const { userId: routeUserId } = useParams();
  const currentUserId = useSelector((state) => state.profile.userId);
  const following = useSelector((state) => state.following);
  const profileId = routeUserId ?? currentUserId;
  const isOwnProfile = String(profileId) === String(currentUserId);
  const [profile, setProfile] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [feedProfileId, setFeedProfileId] = useState(null);
  const [loadedProfileId, setLoadedProfileId] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [postsError, setPostsError] = useState("");
  const [postsErrorProfileId, setPostsErrorProfileId] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [followingPeople, setFollowingPeople] = useState([]);
  const [followersCount, setFollowersCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);
  const [connectionsStatus, setConnectionsStatus] = useState("loading");
  const [connectionsProfileId, setConnectionsProfileId] = useState(null);
  const [connectionsError, setConnectionsError] = useState("");
  const [connectionsErrorProfileId, setConnectionsErrorProfileId] = useState(null);
  const [connectionListOpen, setConnectionListOpen] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(getProfileForm(null));
  const [originalProfileForm, setOriginalProfileForm] = useState(getProfileForm(null));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileEditError, setProfileEditError] = useState("");
  const [profilePicturePreview, setProfilePicturePreview] = useState("");

  useEffect(() => {
    if (!profileId) return undefined;

    let active = true;
    fetchProfile(profileId)
      .then((response) => {
        if (active) {
          const loadedProfile =
            response?.profile ?? response?.data?.profile ?? response?.data ?? response;
          setProfile(loadedProfile);
          setError("");
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
    if (!profileId) return undefined;
    let active = true;
    Promise.allSettled([getFollowers(profileId), getFollowing(profileId)])
      .then(([followersResult, followingResult]) => {
        if (!active) return;
        const errors = [];
        if (followersResult.status === "fulfilled") {
          const result = getConnectionData(followersResult.value, "followers");
          setFollowers(result.people);
          setFollowersCount(result.count);
        } else {
          errors.push(
            getErrorMessage(followersResult.reason, "Unable to load followers.")
          );
        }

        if (followingResult.status === "fulfilled") {
          const result = getConnectionData(followingResult.value, "following");
          setFollowingPeople(result.people);
          setFollowingCount(result.count);
        } else {
          errors.push(
            getErrorMessage(followingResult.reason, "Unable to load following.")
          );
        }
        setConnectionsError(errors.join(" "));
        setConnectionsErrorProfileId(profileId);
        setConnectionsStatus(errors.length === 2 ? "failed" : "loaded");
        setConnectionsProfileId(profileId);
      });
    return () => {
      active = false;
    };
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return undefined;
    let active = true;
    getBlogPosts()
      .then((response) => {
        if (active) {
          setFeedPosts(
            extractList(response, ["posts", "blogs", "items"]).filter(
              (post) => getPostAuthorId(post) === String(profileId)
            )
          );
          setFeedProfileId(profileId);
          setPostsErrorProfileId(profileId);
          setPostsError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setPostsError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load this user's posts."
          );
          setFeedProfileId(profileId);
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
        <LoadingState label="Loading profile..." />
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
  const embeddedPosts = Array.isArray(profile?.posts)
    ? profile.posts
    : Array.isArray(profile?.blogs)
      ? profile.blogs
      : [];
  const profileFeedPosts =
    feedProfileId === profileId ? feedPosts : [];
  const currentPostsError =
    postsErrorProfileId === profileId ? postsError : "";
  const postMap = new Map();
  [...embeddedPosts, ...profileFeedPosts].forEach((post, index) => {
    postMap.set(getBlogPostId(post) ?? `post-${index}`, post);
  });
  const posts = [...postMap.values()];
  const institution =
    profile?.institution ?? profile?.academic?.institution ?? "—";
  const field =
    profile?.field ?? profile?.fieldOfStudy ?? profile?.academic?.fieldOfStudy ?? profile?.position ?? "—";

  const updatePostInLists = (updatedPost) => {
    const updatedId = getBlogPostId(updatedPost);
    setFeedPosts((existing) =>
      existing.map((post) =>
        getBlogPostId(post) === updatedId ? { ...post, ...updatedPost } : post
      )
    );
    setProfile((existing) => {
      if (!existing) return existing;
      const key = Array.isArray(existing.posts) ? "posts" : "blogs";
      if (!Array.isArray(existing[key])) return existing;
      return {
        ...existing,
        [key]: existing[key].map((post) =>
          getBlogPostId(post) === updatedId ? { ...post, ...updatedPost } : post
        ),
      };
    });
  };

  const deletePostFromLists = (deletedId) => {
    setFeedPosts((existing) =>
      existing.filter((post) => getBlogPostId(post) !== String(deletedId))
    );
    setProfile((existing) => {
      if (!existing) return existing;
      return {
        ...existing,
        posts: Array.isArray(existing.posts)
          ? existing.posts.filter((post) => getBlogPostId(post) !== String(deletedId))
          : existing.posts,
        blogs: Array.isArray(existing.blogs)
          ? existing.blogs.filter((post) => getBlogPostId(post) !== String(deletedId))
          : existing.blogs,
      };
    });
  };

  const openProfileEditor = () => {
    const form = getProfileForm(profile);
    setProfileForm(form);
    setOriginalProfileForm(form);
    setProfilePicturePreview(getProfilePictureUrl(profile));
    setProfileEditError("");
    setEditingProfile(true);
  };

  const selectProfilePicture = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setProfileEditError("Choose a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileEditError("Profile pictures must be 5 MB or smaller.");
      return;
    }

    try {
      const preview = await readFileAsDataUrl(file);
      setProfileForm((form) => ({ ...form, profilePicture: file }));
      setProfilePicturePreview(preview);
      setProfileEditError("");
    } catch (previewError) {
      setProfileEditError(previewError.message);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!isOwnProfile || profileSaving) return;

    setProfileSaving(true);
    setProfileEditError("");
    try {
      const changedFields = getChangedProfileFields(
        originalProfileForm,
        profileForm
      );
      if (Object.keys(changedFields).length === 0) {
        setProfileEditError("Make at least one change before saving.");
        setProfileSaving(false);
        return;
      }

      const formData = new FormData();
      for (const [field, value] of Object.entries(changedFields)) {
        formData.append(
          field,
          field === "areaOfInterest" ? JSON.stringify(value) : value
        );
      }

      const response = await updateProfile(formData);
      const savedProfile =
        response?.profile ??
        response?.user ??
        response?.data?.profile ??
        response?.data?.user ??
        response?.data;
      setProfile((existing) => ({
        ...existing,
        ...changedFields,
        ...(savedProfile && typeof savedProfile === "object" ? savedProfile : {}),
        profilePicture:
          getProfilePictureUrl(savedProfile) ||
          (changedFields.profilePicture ? profilePicturePreview : "") ||
          getProfilePictureUrl(existing),
      }));
      if (String(profileId) === String(currentUserId)) {
        dispatch(loadProfile(currentUserId));
      }
      setEditingProfile(false);
    } catch (requestError) {
      setProfileEditError(
        requestError.response?.data?.message ??
          requestError.message ??
          "Unable to update your profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-800">
            {getProfilePictureUrl(profile) ? (
              <img
                src={getProfilePictureUrl(profile)}
                alt={`${displayName}'s profile`}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
            </div>
            <div className="min-w-0">
              <p className="break-words font-serif text-xl font-bold text-slate-900">
                {displayName}
              </p>
              <p className="break-words text-slate-500">{institution}</p>
              <p className="break-words text-sm text-emerald-700">{field}</p>
            </div>
          </div>
          {isOwnProfile ? (
            <button
              type="button"
              onClick={openProfileEditor}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FiEdit2 aria-hidden="true" />
              Edit profile
            </button>
          ) : (
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
                  {
                    dispatch(
                      followingStatusChanged({
                        userId: currentUserId,
                        targetId: profileId,
                        isFollowing: nowFollowing,
                      })
                    );
                    setFollowersCount((count) =>
                      count == null
                        ? count
                        : Math.max(0, count + (nowFollowing ? 1 : -1))
                    );
                  }
                }
              />
              <StartChatButton
                currentUserId={currentUserId}
                user={{
                  id: profileId,
                  name: displayName,
                  institution,
                  profilePicture: getProfilePictureUrl(profile),
                }}
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
        {Array.isArray(profile?.areaOfInterest) && profile.areaOfInterest.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-slate-900">Areas of interest</p>
            <div className="flex flex-wrap gap-2">
              {profile.areaOfInterest.map((interest) => (
                <span key={interest} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
        {profile?.briefResearchFocus && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-900">Research focus</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-slate-600">
              {profile.briefResearchFocus}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
          <button
            type="button"
            onClick={() => setConnectionListOpen("followers")}
            className="hover:text-emerald-800"
          >
            <span className="font-semibold text-slate-900">
              {connectionsProfileId === profileId
                ? followersCount
                : profile?.followersCount ??
                  (Array.isArray(profile?.followers)
                    ? profile.followers.length
                    : profile?.followers) ??
                  "—"}
            </span>{" "}
            followers
          </button>
          <button
            type="button"
            onClick={() => setConnectionListOpen("following")}
            className="hover:text-emerald-800"
          >
            <span className="font-semibold text-slate-900">
              {connectionsProfileId === profileId
                ? followingCount
                : profile?.followingCount ??
                  (Array.isArray(profile?.following)
                    ? profile.following.length
                    : profile?.following) ??
                  "—"}
            </span>{" "}
            following
          </button>
        </div>
        {connectionsErrorProfileId === profileId && connectionsError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {connectionsError}
          </p>
        )}
      </div>

      <p className="mb-3 font-serif text-lg font-bold text-slate-900">
        {isOwnProfile ? "Your posts" : `${displayName}'s posts`}
      </p>
      {currentPostsError && posts.length === 0 && embeddedPosts.length === 0 && (
        <p role="alert" className="mb-3 text-sm text-red-600">{currentPostsError}</p>
      )}
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <PostCard
            key={getBlogPostId(post) ?? index}
            post={post}
            onPostUpdated={updatePostInLists}
            onPostDeleted={deletePostFromLists}
          />
        ))
      ) : (
        feedProfileId !== profileId && embeddedPosts.length === 0 ? (
          <LoadingState label="Loading posts..." />
        ) : currentPostsError ? (
          <p className="text-slate-500">Unable to load posts right now.</p>
        ) : (
          <p className="text-slate-500">No posts are available on this profile.</p>
        )
      )}

      {editingProfile && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !profileSaving) {
              setEditingProfile(false);
            }
          }}
        >
          <form
            onSubmit={saveProfile}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="edit-profile-title" className="font-serif text-xl font-bold text-slate-900">
                Edit profile
              </h2>
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                disabled={profileSaving}
                aria-label="Close profile editor"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <FiX />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["fullName", "Full name"],
                ["username", "Username"],
                ["institution", "Institution"],
                ["fieldOfStudy", "Field of study"],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm font-medium text-slate-700">
                  {label}
                  <input
                    value={profileForm[key]}
                    onChange={(event) =>
                      setProfileForm((form) => ({ ...form, [key]: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Profile picture
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={selectProfilePicture}
                className="mt-1 block w-full cursor-pointer rounded-lg border border-slate-300 text-sm file:mr-3 file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-800"
              />
              <span className="mt-1 block text-xs text-slate-500">
                JPEG, PNG, GIF, or WebP. Maximum size: 5 MB.
              </span>
            </label>
            {profilePicturePreview && (
              <img
                src={profilePicturePreview}
                alt="Profile picture preview"
                className="mt-3 h-20 w-20 rounded-full object-cover"
              />
            )}
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Bio
              <textarea
                value={profileForm.bio}
                onChange={(event) =>
                  setProfileForm((form) => ({ ...form, bio: event.target.value }))
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <div className="mt-4">
              <TagInputField
                label="Areas of interest"
                value={profileForm.areaOfInterest}
                onChange={(areaOfInterest) =>
                  setProfileForm((form) => ({ ...form, areaOfInterest }))
                }
                placeholder="Type an interest and press Enter"
              />
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Brief research focus
              <textarea
                value={profileForm.briefResearchFocus}
                onChange={(event) =>
                  setProfileForm((form) => ({
                    ...form,
                    briefResearchFocus: event.target.value,
                  }))
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            {profileEditError && (
              <p role="alert" className="mt-3 text-sm text-red-600">{profileEditError}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                disabled={profileSaving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileSaving}
                className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {profileSaving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>
        </div>
      )}
      {connectionListOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConnectionListOpen("");
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-connections-title"
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="profile-connections-title" className="font-serif text-xl font-bold text-slate-900">
                {connectionListOpen === "followers" ? "Followers" : "Following"}
              </h2>
              <button
                type="button"
                onClick={() => setConnectionListOpen("")}
                aria-label="Close list"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <FiX />
              </button>
            </div>
            {connectionsProfileId !== profileId || connectionsStatus === "loading" ? (
              <LoadingState label="Loading connections..." />
            ) : (
              (() => {
                const people =
                  connectionListOpen === "followers" ? followers : followingPeople;
                if (people.length === 0) {
                  return (
                    <div>
                      {connectionsErrorProfileId === profileId && connectionsError && (
                        <p role="alert" className="mb-3 text-sm text-red-600">
                          {connectionsError}
                        </p>
                      )}
                      <p className="text-sm text-slate-500">
                        {connectionListOpen === "followers"
                          ? "No followers to show."
                          : "Not following anyone yet."}
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="divide-y divide-slate-100">
                    {people.map((person, index) => {
                      const id = getConnectionId(person);
                      const name = getConnectionName(person);
                      const initials = name
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                      return (
                        <Link
                          key={id ?? index}
                          to={id ? `/profile/${id}` : "/profile"}
                          onClick={() => setConnectionListOpen("")}
                          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                            {initials}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-slate-900">{name}</span>
                            <span className="block truncate text-sm text-slate-500">
                              {[person.username ? `@${person.username}` : "", person.institution]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}

export default Profile;
