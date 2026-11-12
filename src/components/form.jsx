import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

function FormField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  textarea = false,
}) {
  const sharedClasses =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-colors duration-300 ease-in-out focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && passwordVisible ? "text" : type;

  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-semibold text-slate-900">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={`${sharedClasses} resize-none`}
        />
      ) : (
        <div className={isPassword ? "relative w-full" : undefined}>
          <input
            type={inputType}
            name={name ?? label.toLowerCase()}
            required
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${sharedClasses} ${isPassword ? "pr-20" : ""}`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
              className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded p-1 text-slate-600 transition-colors hover:text-emerald-900 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              {passwordVisible ? (
                <FiEyeOff aria-hidden="true" className="h-5 w-5" />
              ) : (
                <FiEye aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default FormField;
