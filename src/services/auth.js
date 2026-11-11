import axios from "axios";

export async function signUpUser(userData) {
    const url = `${process.env.BASE_URL}/users/signup`;
    const response = await axios.post(url, userData);
    return response.data;
  }

  export async function onboardingUser(userData) {
    const url = `${process.env.BASE_URL}/onboarding`;
    const response = await axios.patch(url, userData);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  }

  export async function lastOnboardingUser(userData) {
    const url = `${process.env.BASE_URL}/lastonboarding`;
    const response = await axios.patch(url, userData);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  }

  export async function loginUser(credentials) {
    const url = `${process.env.BASE_URL}/login`;
    const response = await axios.post(url, credentials);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  }

export async function fetchData() {
    const url = `${process.env.BASE_URL}/posts`;
    const response = await axios.get(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  }