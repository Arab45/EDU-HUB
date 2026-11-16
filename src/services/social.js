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
  const response = await api.get("/posts/");
  return response.data;
}

function getBlogPostId(post) {
  const blog = post?.post ?? post?.blog ?? post?.data?.post ?? post;
  const id =
    blog?._id ??
    blog?.id ??
    blog?.postId ??
    blog?.blogId ??
    post?.postId ??
    post?.blogId;
  return id == null ? null : String(id);
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

//Like / comment
async function likePost(postId) {
  const response = await api.post(`/posts/blog/${postId}/likes`);
  return response.data;
}

async function unlikePost(postId) {
  const response = await api.delete(`/posts/blog/${postId}/likes`);
  return response.data;
}

async function getLikes(postId) {
  const response = await api.get(`/posts/blog/${postId}/likes`);
  return response.data;
}

async function commentOnPost(postId, commentData) {
  const response = await api.post(`/posts/blog/${postId}/comments`, commentData);
  return response.data;
}

async function getComments(postId) {
  const response = await api.get(`/posts/blog/${postId}/comments`);
  return response.data;
}

async function search(query, page = 1, limit = 20) {
  const response = await api.get("/social/search", {
    params: { q: query, page, limit },
  });
  return response.data;
}


export {
  createBlogPost,
  getBlogPosts,
  getBlogPostId,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  followUser,
  unfollowUser,
  fetchAllFollows,
  getFollowers,
  getFollowing,
  likePost,
  unlikePost,
  getLikes,
  commentOnPost,
  getComments,
  search
};
