
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const pageTitles = {
  "/admin": "Dashboard",
  "/gate": "Dashboard",
  "/employee": "Dashboard",
  "/director": "Dashboard",
};

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const name = user?.name || user?.employeeName || "User";
  const role = user?.role?.replaceAll("_", " ") || "User";
  const title = pageTitles[location.pathname] || "Workspace";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-sm font-semibold text-slate-900 sm:text-base">
            {title}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Welcome to your workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <Bell size={19} strokeWidth={1.8} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {initials || "U"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-36 truncate text-sm font-medium text-slate-800">
                {name}
              </p>
              <p className="text-xs capitalize text-slate-500">
                {role.toLowerCase()}
              </p>
            </div>

            <ChevronDown
              size={15}
              className="hidden text-slate-400 sm:block"
            />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close user menu"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {name}
                  </p>
                  <p className="text-xs text-slate-500">Signed in</p>
                </div>

                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {loggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
