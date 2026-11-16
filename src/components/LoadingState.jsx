function LoadingState({ label = "Loading...", className = "" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 text-sm text-slate-600 ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-700/25 border-t-emerald-800"
      />
      <span>{label}</span>
    </div>
  );
}

export default LoadingState;
