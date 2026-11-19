const LAST_SEEN_FIELDS = [
  "lastSeenAt",
  "lastSeen",
  "lastActiveAt",
  "lastOnlineAt",
  "lastActivityAt",
];

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

export function formatLastSeen(timestamp) {
  if (!timestamp) return "Last seen unavailable";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Last seen unavailable";

  return `Last seen ${date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  })}`;
}
