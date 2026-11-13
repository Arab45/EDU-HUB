import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

if (!BASE_URL) {
  throw new Error("VITE_BASE_URL is missing. Set it in the Vite environment file.");
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

export async function signUpUser(userData) {
  const response = await api.post("/users/signup", userData);
  return response.data;
}

export async function onboardingUser(userData) {
  const response = await api.patch("/users/onboarding", userData);
  return response.data;
}

export async function lastOnboardingUser(userData) {
  const response = await api.patch("/users/lastonboarding", userData);
  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post("/auth/login", credentials);
  return response.data;
}

export async function fetchData() {
  const response = await api.get("/posts");
  return response.data;
}

export async function fetchProfile(userId) {
  const response = await api.get(`/users/profile/${userId}`);
  return response.data;
}