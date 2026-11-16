import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import PostCard from "../components/PostCard";
import { getBlogPostById, getBlogPostId } from "../services/social";

function unwrapPost(response) {
  let value = response;
  while (value && typeof value === "object" && !Array.isArray(value)) {
    if (value.post || value.blog) return value.post ?? value.blog;
    if (value.data !== undefined) {
      value = value.data;
      continue;
    }
    return value;
  }
  return null;
}

function BlogPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loadedPostId, setLoadedPostId] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getBlogPostById(postId)
      .then((response) => {
        if (!active) return;
        const loadedPost = unwrapPost(response);
        if (!loadedPost || !getBlogPostId(loadedPost)) {
          throw new Error("The requested post was not found.");
        }
        setPost(loadedPost);
        setError("");
        setLoadedPostId(postId);
        setStatus("loaded");
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load this post."
          );
          setLoadedPostId(postId);
          setStatus("failed");
        }
      });
    return () => {
      active = false;
    };
  }, [postId]);

  return (
    <AppShell maxWidth="max-w-3xl">
      <Link to="/home" className="mb-4 inline-block text-sm font-semibold text-emerald-800 hover:underline">
        Back to home
      </Link>
      {(loadedPostId !== postId || status === "loading") && (
        <p role="status" className="text-slate-500">Loading post...</p>
      )}
      {loadedPostId === postId && status === "failed" && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}
      {loadedPostId === postId && status === "loaded" && post && (
        <PostCard
          post={post}
          onPostUpdated={setPost}
          onPostDeleted={() => navigate("/home", { replace: true })}
        />
      )}
    </AppShell>
  );
}

export default BlogPost;
