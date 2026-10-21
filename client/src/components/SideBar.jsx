import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNavigationForUser, isItemActive } from "../config/navigation";

/**
 * Grouped navigation. On md+ screens it can collapse to an icon rail;
 * on mobile it is always a full-width drawer.
 */
const Sidebar = ({ mobileOpen = false, collapsed = false, onClose }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const groups = getNavigationForUser(user);

  // Hide text only on md+ so the mobile drawer always shows labels.
  const hideWhenCollapsed = collapsed ? "md:hidden" : "";

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="animate-fade fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        aria-label="Primary"
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-line bg-white transition-[transform,width] duration-200 ease-out md:translate-x-0 ${
          collapsed ? "md:w-14" : ""
        } ${mobileOpen ? "translate-x-0 shadow-pop" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div
          className={`flex h-12 shrink-0 items-center justify-between border-b border-line px-4 ${
            collapsed ? "md:justify-center md:px-0" : ""
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img
              src="/khgroup-logo.png"
              alt="KHGROUP"
              className="h-6 w-auto shrink-0 object-contain"
            />
            <span
              className={`text-[13px] font-semibold tracking-tight text-ink ${hideWhenCollapsed}`}
            >
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

        {/* Groups */}
        <nav
          className={`flex-1 px-2.5 py-3 ${
            collapsed ? "md:overflow-visible" : "overflow-y-auto"
          }`}
        >
          {groups.map((group, groupIndex) => (
            <div key={group.label} className={groupIndex > 0 ? "mt-4" : ""}>
              {/* Label (expanded) or hairline divider (collapsed rail) */}
              <p
                className={`mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 ${hideWhenCollapsed}`}
              >
                {group.label}
              </p>
              {groupIndex > 0 && collapsed && (
                <div className="mx-2 mb-2 hidden h-px bg-line md:block" />
              )}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isItemActive(item, pathname);
                  const Icon = item.icon;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex h-8 items-center gap-2.5 rounded-control px-2.5 text-[13px] font-medium transition-colors duration-150 ${
                          collapsed ? "md:justify-center md:px-0" : ""
                        } ${
  active
    ? "bg-brand-soft text-brand"
    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
}`} 
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute -left-2.5 h-4 w-[3px] rounded-r bg-brand transition-all duration-200 ${
                            active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                          }`}
                        />

                        <Icon
                          size={16}
                          strokeWidth={active ? 2.1 : 1.8}
                          className="shrink-0 transition-transform duration-150 group-hover:scale-110"
                        />
                        <span className={`truncate ${hideWhenCollapsed}`}>
                          {item.label}
                        </span>

                        {/* Tooltip for the icon rail */}
                        {collapsed && (
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute left-full z-50 ml-2.5 hidden whitespace-nowrap rounded-md bg-[#10132e] px-2 py-1 text-xs font-medium text-white opacity-0 shadow-pop transition-opacity delay-100 duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
                                                      >
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
