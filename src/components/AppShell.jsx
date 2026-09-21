import { Link, useLocation } from "react-router-dom";
import { FiHome, FiSearch, FiPlusCircle, FiUser, FiLogOut } from "react-icons/fi";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: FiHome },
  { to: "/search", label: "Search", icon: FiSearch },
  { to: "/new-post", label: "New Post", icon: FiPlusCircle },
  { to: "/profile", label: "Profile", icon: FiUser },
];

function AppShell({ children, maxWidth = "max-w-3xl" }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="flex w-64 shrink-0 flex-col justify-between bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-6 text-white">
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

      <main className="flex-1 bg-slate-50 p-8">
        <div className={`mx-auto w-full ${maxWidth}`}>{children}</div>
      </main>
    </div>
  );
}

export default AppShell;
