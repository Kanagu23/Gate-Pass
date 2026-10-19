import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { navigationByRole, roleLabels } from "../config/navigation";

const Sidebar = ({ mobileOpen = false, onClose }) => {
  const { user } = useAuth();
  const items = navigationByRole[user?.role] || [];

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="animate-fade fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        aria-label="Primary"
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-line bg-white transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-pop" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-12 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/khgroup-logo.png"
              alt="KHGROUP"
              className="h-6 w-auto object-contain"
            />
            <span className="text-[13px] font-semibold tracking-tight text-ink">
              Gate Pass
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Menu
          </p>

          <div className="space-y-0.5">
            {items.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex h-8 items-center gap-2.5 rounded-control px-2.5 text-[13px] font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-brand-soft text-brand"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className={`absolute -left-2.5 h-4 w-[3px] rounded-r bg-brand transition-all duration-200 ${
                        isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                      }`}
                    />
                    <Icon
                      size={16}
                      strokeWidth={isActive ? 2.1 : 1.8}
                      className="shrink-0 transition-transform duration-150 group-hover:scale-110"
                    />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Role footer */}
        <div className="border-t border-line px-4 py-2.5">
          <p className="text-[11px] text-slate-400">Signed in as</p>
          <p className="truncate text-xs font-medium text-slate-700">
            {roleLabels[user?.role] || "User"}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
