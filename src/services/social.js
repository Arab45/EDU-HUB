import api from "./auth";

async function createBlogPost(postData) {
  const response = await api.post("/posts/blog", postData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

async function getBlogPosts() {
  const response = await api.get("/posts");
  return response.data;
}

async function getBlogPostById(postId) {
  const response = await api.get(`/posts/blog/${postId}`);
  return response.data;
}

async function updateBlogPost(postId, updatedData) {
  const response = await api.put(`/posts/blog/${postId}`, updatedData);
  return response.data;
}

async function deleteBlogPost(postId) {
  const response = await api.delete(`/posts/blog/${postId}`);
  return response.data;
}

async function followUser(userId) {
  const response = await api.post(`/social/users/${userId}/follow`);
  return response.data;
}

async function unfollowUser(userId) {
  const response = await api.delete(`/social/users/${userId}/follow`);
  return response.data;
}

async function fetchAllFollows(page = 1, limit = 20) {
  const response = await api.get("/social/users/follow-relations", {
    params: { page, limit },
  });
  return response.data;
}

async function getFollowers(userId) {
  const response = await api.get(`/social/users/${userId}/followers/`);
  return response.data;
}

async function getFollowing(userId) {
  const response = await api.get(`/social/users/${userId}/following/`);
  return response.data;
}

export {
  createBlogPost,
  getBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  followUser,
  unfollowUser,
  fetchAllFollows,
  getFollowers,
  getFollowing,
};
