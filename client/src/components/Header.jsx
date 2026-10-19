import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { roleLabels, titleForPath } from "../config/navigation";
import Avatar from "./common/Avatar";
import Spinner from "./common/Spinner";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const name = user?.name || user?.employeeName || "User";
  const role = roleLabels[user?.role] || "User";

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

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
    <header className="no-print sticky top-0 z-30 flex h-12 items-center justify-between border-b border-line bg-white/85 px-4 backdrop-blur-md sm:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="-ml-1.5 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 md:hidden"
        >
          <Menu size={18} />
        </button>

        <h2 className="truncate text-[13px] font-semibold text-ink">
          {titleForPath(pathname)}
        </h2>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-control py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
        >
          <Avatar name={name} size={26} />

          <div className="hidden text-left leading-tight sm:block">
            <p className="max-w-36 truncate text-xs font-medium text-slate-800">
              {name}
            </p>
            <p className="text-[11px] text-slate-500">{role}</p>
          </div>

          <ChevronDown
            size={13}
            className={`text-slate-400 transition-transform duration-150 ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            <div
              role="menu"
              className="animate-pop absolute right-0 z-50 mt-1.5 w-52 origin-top-right rounded-card bg-white p-1 shadow-pop"
            >
              <div className="px-2.5 py-2">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {name}
                </p>
                <p className="text-[11px] text-slate-500">{role}</p>
              </div>

              <div className="my-1 h-px bg-line" />

              <button
                type="button"
                role="menuitem"
                disabled={loggingOut}
                onClick={handleLogout}
                className="flex h-8 w-full items-center gap-2 rounded-control px-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {loggingOut ? <Spinner size={14} /> : <LogOut size={14} />}
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
