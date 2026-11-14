export const USER_ID_STORAGE_KEY = "researchhub-user-id";
export const SESSION_EXPIRY_STORAGE_KEY = "researchhub-session-expires-at";
export const SESSION_DURATION_MS = 60 * 60 * 1000;

let expiryTimer;

function getSessionExpiry() {
  try {
    const storedExpiry = sessionStorage.getItem(SESSION_EXPIRY_STORAGE_KEY);
    if (!storedExpiry) return null;

    const expiry = Number(storedExpiry);
    return Number.isFinite(expiry) ? expiry : null;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  try {
    sessionStorage.removeItem(USER_ID_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_STORAGE_KEY);
  } catch {
    console.warn("Could not clear the saved session from browser storage.");
  }

  if (expiryTimer) {
    window.clearTimeout(expiryTimer);
    expiryTimer = undefined;
  }
}

export function expireAuthSession() {
  clearAuthSession();
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export function saveAuthSession(userId) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  sessionStorage.setItem(USER_ID_STORAGE_KEY, userId);
  sessionStorage.setItem(SESSION_EXPIRY_STORAGE_KEY, String(expiresAt));
  scheduleExpiry(expiresAt);
}

function scheduleExpiry(expiresAt = getSessionExpiry()) {
  if (expiryTimer) {
    window.clearTimeout(expiryTimer);
    expiryTimer = undefined;
  }

  if (!expiresAt) return;

  const remaining = expiresAt - Date.now();
  if (remaining <= 0) {
    expireAuthSession();
    return;
  }

  expiryTimer = window.setTimeout(() => {
    expireAuthSession();
  }, remaining);
}

export function startSessionExpiryTimer() {
  scheduleExpiry();
  return () => {
    if (expiryTimer) {
      window.clearTimeout(expiryTimer);
      expiryTimer = undefined;
    }
  };
}

export function isAuthSessionExpired() {
  const expiry = getSessionExpiry();
  return expiry !== null && Date.now() >= expiry;
}
