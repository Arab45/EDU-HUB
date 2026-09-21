import { Link } from "react-router-dom";

function PrimaryButton({
  children,
  className = "",
  to,
  disabled,
  variant = "default",
  ...props
}) {
  const variantClasses =
    variant === "accent"
      ? "bg-orange-500 hover:bg-orange-600"
      : "bg-emerald-900 hover:bg-emerald-800";

  const classes = `inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white transition-colors duration-300 ease-in-out disabled:cursor-not-allowed disabled:bg-slate-300 ${variantClasses} ${className}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", to, disabled, ...props }) {
  const classes = `inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-colors duration-300 ease-in-out hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 ${className}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

export { PrimaryButton, SecondaryButton };
