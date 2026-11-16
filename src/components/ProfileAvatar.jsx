import { useEffect, useState } from "react";
import { fetchProfile } from "../services/auth";
import { getProfilePictureUrl } from "../utils/profilePicture";

const pictureCache = new Map();
const pictureRequests = new Map();

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function loadProfilePicture(userId) {
  const key = String(userId);
  if (pictureCache.has(key)) return Promise.resolve(pictureCache.get(key));
  if (pictureRequests.has(key)) return pictureRequests.get(key);

  const request = fetchProfile(userId)
    .then((response) => {
      const picture = getProfilePictureUrl(response);
      pictureCache.set(key, picture);
      return picture;
    })
    .finally(() => pictureRequests.delete(key));
  pictureRequests.set(key, request);
  return request;
}

function ProfileAvatar({
  user,
  userId,
  name = "Researcher",
  className = "h-10 w-10",
}) {
  const providedPicture = getProfilePictureUrl(user);
  const [loadedProfile, setLoadedProfile] = useState({
    userId: null,
    picture: "",
  });
  const [failedPicture, setFailedPicture] = useState("");

  useEffect(() => {
    if (
      providedPicture ||
      userId == null ||
      loadedProfile.userId === String(userId)
    ) {
      return undefined;
    }

    let active = true;
    loadProfilePicture(userId)
      .then((loadedPicture) => {
        if (active) {
          setLoadedProfile({
            userId: String(userId),
            picture: loadedPicture,
          });
        }
      })
      .catch(() => {
        if (active) {
          setLoadedProfile({
            userId: String(userId),
            picture: "",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [loadedProfile.userId, providedPicture, userId]);

  const picture =
    providedPicture ||
    (loadedProfile.userId === String(userId) ? loadedProfile.picture : "");
  const visiblePicture = picture === failedPicture ? "" : picture;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 ${className}`}
    >
      {visiblePicture ? (
        <img
          src={visiblePicture}
          alt={`${name}'s profile`}
          loading="lazy"
          decoding="async"
          onError={() => setFailedPicture(visiblePicture)}
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

export default ProfileAvatar;
