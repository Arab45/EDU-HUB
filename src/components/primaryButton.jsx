import { Link } from "react-router-dom";

// function PrimaryButton({
//   children,
//   className = "",
//   to,
//   disabled,
//   variant = "default",
//   ...props
// }) {
//   const variantClasses =
//     variant === "accent"
//       ? "bg-orange-500 hover:bg-orange-600"
//       : "bg-emerald-900 hover:bg-emerald-800";

//   const classes = `inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white transition-colors duration-300 ease-in-out disabled:cursor-not-allowed disabled:bg-slate-300 ${variantClasses} ${className}`;

//   if (to && !disabled) {
//     return (
//       <Link to={to} className={classes} {...props}>
//         {children}
//       </Link>
//     );
//   }

//   return (
//     <button className={classes} disabled={disabled} {...props}>
//       {children}
//     </button>
//   );
// }



 function PrimaryButton({
  children,
  to,
  type = "button",
  className = "",
  onClick,
  disabled = false,
}) {
  const sharedClasses = `
    inline-flex items-center justify-center rounded-xl px-6 py-3
    font-semibold text-white transition-all duration-150
    ease-in-out bg-emerald-900 hover:bg-emerald-800
    active:scale-[0.98] active:bg-emerald-950
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100
    ${className}
  `;

  if (to) {
    return disabled ? (
      <span className={sharedClasses} aria-disabled="true">
        {children}
      </span>
    ) : (
      <Link to={to} className={sharedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={sharedClasses}
    >
      {children}
    </button>
  );
}


function SecondaryButton({ children, className = "", to, disabled, ...props }) {
  const classes = `inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition-all duration-150 ease-in-out hover:bg-slate-50 active:scale-[0.98] active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-slate-300 ${className}`;

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
