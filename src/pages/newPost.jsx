import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiImage, FiX } from "react-icons/fi";
import AppShell from "../components/AppShell";
import { PrimaryButton } from "../components/PrimaryButton";
import FormField from "../components/Form";


function NewPost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePublish = () => {
    // Wire this up to your API once the backend is ready.
    navigate("/home");
  };

  return (
    <AppShell>
      <p className="mb-1 font-serif text-2xl font-bold text-slate-900">
        New post
      </p>
      <p className="mb-6 text-slate-500">
        Share an update from your research
      </p>

      <FormField
        label="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give your post a clear title"
      />
      <FormField
        label="Body *"
        textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share what you've been working on..."
      />

      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-semibold text-slate-900">
          Image (optional)
        </label>
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white transition-colors duration-300 ease-in-out hover:bg-slate-900"
              aria-label="Remove image"
            >
              <FiX />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-8 text-slate-500 transition-colors duration-300 ease-in-out hover:border-emerald-600 hover:text-emerald-700">
            <FiImage />
            Upload an image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      <PrimaryButton onClick={handlePublish} disabled={!title || !body}>
        Publish post
      </PrimaryButton>
    </AppShell>
  );
}

export default NewPost;
