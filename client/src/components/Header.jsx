import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { roleLabels } from "../config/navigation";
import Avatar from "./common/Avatar";
import { DIVISIONS } from "../config/divisions";
import { divisionName } from "../config/divisions";
import Spinner from "./common/Spinner";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const today = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const Header = ({ collapsed = false, onMenuClick, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  const name = user?.name || user?.employeeName || "User";
  const role = roleLabels[user?.role] || "User";
const { theme, setTheme } = useTheme();

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];
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
        {/* Mobile: open drawer */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="-ml-1.5 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 md:hidden"
        >
          <Menu size={18} />
        </button>

        {/* Desktop: collapse / expand sidebar */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="-ml-1.5 hidden rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 md:inline-flex"
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>

        {/* Context, not a title: the page heading lives in the page itself */}
        <p className="truncate text-xs text-slate-500">
          <span className="font-semibold text-slate-700 md:hidden">Gate Pass</span>
          <span className="hidden md:inline">{today()}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
       
{user?.role !== "SYSTEM_ADMIN" && (
  <div className="hidden items-center gap-2 sm:flex">
    <span className="text-xs text-slate-500">
      Division
    </span>

    <span className="inline-flex items-center rounded-control border border-line bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {divisionName(user?.division)}
    </span>
  </div>
)}

        <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-control py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
        >
          <Avatar name={name} size={26} src={user?.profilePhoto} />

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
              
<div className="px-2.5 py-2">
  <p className="mb-2 text-[11px] font-medium text-slate-500">
    Appearance
  </p>

  <div
    className="grid grid-cols-3 gap-1 rounded-control bg-slate-100 p-1"
    role="group"
    aria-label="Appearance"
  >
    {themeOptions.map(({ value, label, icon: Icon }) => (
      <button
        key={value}
        type="button"
        onClick={() => setTheme(value)}
        aria-pressed={theme === value}
        className={`flex flex-col items-center gap-1 rounded-control px-1 py-2 text-[10px] transition-colors ${
          theme === value
            ? "bg-white font-semibold text-brand shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Icon size={15} />
        {label}
      </button>
    ))}
  </div>
</div>

<div className="my-1 h-px bg-line" />

            </div>
          </>
        )}
      </div>
      </div>
    </header>
  );
};

export default Header;
