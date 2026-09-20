function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  textarea = false,
}) {
  const sharedClasses =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-colors duration-300 ease-in-out focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100";

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
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={sharedClasses}
        />
      )}
    </div>
  );
}

export default FormField;
