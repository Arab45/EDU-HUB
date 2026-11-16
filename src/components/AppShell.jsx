import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FiHome,
  FiSearch,
  FiPlusCircle,
  FiMessageSquare,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { profileSessionCleared } from "../context/profileSlice";
import { clearAuthSession } from "../services/authSession";
import { logoutUser } from "../services/auth";

const NAV_ITEMS = [
  { to: "/home", label: "Home", mobileLabel: "Home", icon: FiHome },
  { to: "/search", label: "Search", mobileLabel: "Search", icon: FiSearch },
  { to: "/new-post", label: "New Post", mobileLabel: "Post", icon: FiPlusCircle },
  { to: "/messages", label: "Messages", mobileLabel: "Messages", icon: FiMessageSquare },
  { to: "/profile", label: "Profile", mobileLabel: "Profile", icon: FiUser },
];

function AppShell({ children, maxWidth = "max-w-3xl" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    setLogoutError("");
    try {
      await logoutUser();
      clearAuthSession();
      dispatch(profileSessionCleared());
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(
        error.response?.data?.message ??
          error.message ??
          "Unable to log out. Please try again."
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="app-page-background min-h-screen w-full md:flex">
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

        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-white/70 transition-colors duration-300 ease-in-out hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          <FiLogOut className="text-lg" />
          {logoutLoading ? "Logging out..." : "Log out"}
        </button>
      </aside>

      <header className="flex items-center justify-between bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-950 px-4 py-3 text-white md:hidden">
        <p className="font-serif text-xl font-bold">ResearchHub</p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-white/90 hover:bg-white/10 disabled:opacity-60"
        >
          <FiLogOut aria-hidden="true" />
          {logoutLoading ? "Logging out..." : "Log out"}
        </button>
      </header>

      <main className="min-w-0 bg-white/65 p-4 pb-24 sm:p-6 sm:pb-24 md:flex-1 md:p-8">
        <div className={`mx-auto w-full min-w-0 ${maxWidth}`}>
          {logoutError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {Array.isArray(logoutError) ? logoutError.join(" ") : logoutError}
            </p>
          )}
          {children}
        </div>
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
