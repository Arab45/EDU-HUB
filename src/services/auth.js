import axios from "axios";
import {
  expireAuthSession,
  isAuthSessionExpired,
} from "./authSession";

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

api.interceptors.request.use((config) => {
  const isLoginRequest = config.url?.includes("/auth/login");
  if (!isLoginRequest && isAuthSessionExpired()) {
    expireAuthSession();
    return Promise.reject(new Error("Your session has expired. Please sign in again."));
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      expireAuthSession();
    }
    return Promise.reject(error);
  }
);

export default api;

export async function signUpUser(userData) {
  const response = await api.post("/users/signup", userData);
  return response.data;
}

export async function saveResearchStep(userId, researchData) {
  const response = await api.patch(
    `/users/onboarding/research/${userId}`,
    researchData
  );
  return response.data;
}

export async function saveAcademicStep(userId, academicData) {
  const response = await api.patch(
    `/users/onboarding/academic/${userId}`,
    academicData
  );
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

export async function fetchAllUsers() {
  const response = await api.get("/users/fetch-all");
  return response.data;
}