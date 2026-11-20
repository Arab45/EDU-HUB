const LAST_SEEN_FIELDS = [
  "lastSeenAt",
  "lastSeen",
  "lastActiveAt",
  "lastOnlineAt",
  "lastActivityAt",
];

const LAST_SEEN_STORAGE_PREFIX = "edu-hub:last-seen:";

export function getLastSeenAt(value) {
  if (!value || typeof value !== "object") return null;
  for (const field of LAST_SEEN_FIELDS) {
    const timestamp = value[field];
    if (timestamp == null || timestamp === "") continue;
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

export function getCachedLastSeenAt(userId) {
  if (!userId || typeof window === "undefined") return null;
  const timestamp = window.localStorage.getItem(
    `${LAST_SEEN_STORAGE_PREFIX}${userId}`
  );
  return getLastSeenAt({ lastSeenAt: timestamp });
}

export function cacheLastSeenAt(userId, timestamp) {
  if (!userId || typeof window === "undefined") return;
  const lastSeenAt = getLastSeenAt({ lastSeenAt: timestamp });
  if (lastSeenAt) {
    window.localStorage.setItem(
      `${LAST_SEEN_STORAGE_PREFIX}${userId}`,
      lastSeenAt
    );
  }
}

export function formatLastSeen(timestamp) {
  if (!timestamp) return "Offline";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Offline";

  return `Last seen at ${date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  })}`;
}
