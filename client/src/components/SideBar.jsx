import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ mobileOpen = false, onClose }) => {
  const { user } = useAuth();

  const navigationByRole = {
    ADMIN: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { label: "Visitors", path: "/admin/visitors", icon: Users },
    ],
    GATE_EMPLOYEE: [
      { label: "Dashboard", path: "/gate", icon: LayoutDashboard },
      { label: "Register Visitor", path: "/gate/register", icon: Users },
    ],
    EMPLOYEE: [
      { label: "Dashboard", path: "/employee", icon: LayoutDashboard },
    ],
    DIRECTOR: [
      { label: "Dashboard", path: "/director", icon: LayoutDashboard },
    ],
  };

  const items = navigationByRole[user?.role] || [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transition-transform duration-200 md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="space-y-1 p-4">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;