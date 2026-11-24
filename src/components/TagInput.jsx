import { useState } from "react";

function TagInputField({ label, hint, value, onChange, placeholder }) {
  const [text, setText] = useState("");

  const addTag = () => {
    const trimmed = text.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setText("");
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-semibold text-slate-900">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition-colors duration-300 ease-in-out focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 transition-colors duration-300 ease-in-out"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-emerald-500 transition-colors duration-200 ease-in-out hover:text-emerald-800"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={addTag}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 border-none py-1 text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={addTag}
          disabled={!text.trim()}
          className="rounded-md px-2 py-1 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default TagInputField;
