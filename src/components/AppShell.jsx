import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiPlusCircle,
  FiMessageSquare,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

const NAV_ITEMS = [
  { to: "/home", label: "Home", mobileLabel: "Home", icon: FiHome },
  { to: "/search", label: "Search", mobileLabel: "Search", icon: FiSearch },
  { to: "/new-post", label: "New Post", mobileLabel: "Post", icon: FiPlusCircle },
  { to: "/messages", label: "Messages", mobileLabel: "Messages", icon: FiMessageSquare },
  { to: "/profile", label: "Profile", mobileLabel: "Profile", icon: FiUser },
];

function AppShell({ children, maxWidth = "max-w-3xl" }) {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full md:flex">
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-6 text-white md:flex">
        <div>
          <p className="mb-10 font-serif text-2xl font-bold">ResearchHub</p>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors duration-300 ease-in-out ${
                    isActive
                      ? "bg-white/15 font-semibold text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="text-lg" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          to="/login"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-white/70 transition-colors duration-300 ease-in-out hover:bg-white/10 hover:text-white"
        >
          <FiLogOut className="text-lg" />
          Log out
        </Link>
      </aside>

      <header className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-950 px-4 py-3 text-white md:hidden">
        <p className="font-serif text-xl font-bold">ResearchHub</p>
      </header>

      <main className="min-w-0 bg-slate-50 p-4 pb-24 sm:p-6 sm:pb-24 md:flex-1 md:p-8">
        <div className={`mx-auto w-full min-w-0 ${maxWidth}`}>{children}</div>
      </main>

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-4px_12px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
      >
        {NAV_ITEMS.map(({ to, mobileLabel, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[10px] font-medium leading-tight transition-colors ${
                isActive ? "text-emerald-800" : "text-slate-500 hover:text-emerald-800"
              }`}
            >
              <Icon className="text-xl" aria-hidden="true" />
              <span className="truncate">{mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default AppShell;
