export const USER_ID_STORAGE_KEY = "researchhub-user-id";

export function clearAuthSession() {
  try {
    sessionStorage.removeItem(USER_ID_STORAGE_KEY);
  } catch {
    console.warn("Could not clear the saved user ID from browser storage.");
  }
}

export function expireAuthSession() {
  clearAuthSession();
  window.dispatchEvent(new Event("auth:session-expired"));

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export function saveAuthSession(userId) {
  sessionStorage.setItem(USER_ID_STORAGE_KEY, userId);
}
