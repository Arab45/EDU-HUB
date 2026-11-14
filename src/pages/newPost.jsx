import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFile, FiUploadCloud, FiX } from "react-icons/fi";
import AppShell from "../components/AppShell";
import { PrimaryButton } from "../components/primaryButton";
import FormField from "../components/form";
import { createBlogPost } from "../services/social";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 280;

function NewPost() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setError("");

    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setAttachment(null);
      setError("The attachment must be 5 MB or smaller.");
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setAttachment(null);
      setError("Choose an image or PDF file.");
      return;
    }

    setAttachment(file);
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    if (content.trim().length > MAX_CONTENT_LENGTH) {
      setError(`Post content must be ${MAX_CONTENT_LENGTH} characters or fewer.`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const postData = new FormData();
      postData.append("content", content.trim());
      if (attachment) postData.append("attachments", attachment);
      await createBlogPost(postData);
      navigate("/home");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          requestError.message ??
          "Unable to publish your post."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <p className="mb-1 font-serif text-2xl font-bold text-slate-900">
        New post
      </p>
      <p className="mb-6 text-slate-500">
        Share an update from your research
      </p>

      <form onSubmit={handlePublish}>
        <FormField
          label="Content *"
          textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX_CONTENT_LENGTH}
          placeholder="Share what you've been working on..."
        />
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-semibold text-slate-900">
            Attachment (optional)
          </label>
          {attachment ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                <FiFile className="shrink-0 text-emerald-700" />
                <span className="truncate">{attachment.name}</span>
                <span className="shrink-0 text-slate-400">
                  ({(attachment.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Remove attachment"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-slate-600 transition-colors hover:border-emerald-700 hover:text-emerald-800">
              <FiUploadCloud className="text-2xl" />
              <span className="text-sm font-semibold">Select an image or PDF</span>
              <span className="text-xs text-slate-500">Maximum file size: 5 MB</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          )}
        </div>
        <p className="mb-4 text-right text-xs text-slate-500">
          {content.length}/{MAX_CONTENT_LENGTH}
        </p>
        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
        <PrimaryButton type="submit" disabled={!content.trim() || loading}>
          {loading ? "Publishing..." : "Publish post"}
        </PrimaryButton>
      </form>
    </AppShell>
  );
}

export default NewPost;
