import {
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  ScanLine,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

export const roleHome = {
  ADMIN: "/admin",
  GATE_EMPLOYEE: "/gate",
  EMPLOYEE: "/employee",
  DIRECTOR: "/director",
};

export const roleLabels = {
  ADMIN: "Administrator",
  GATE_EMPLOYEE: "Gate Employee",
  EMPLOYEE: "Employee",
  DIRECTOR: "Director",
};

/*
 * Navigation is a list of groups. Each item may define:
 *   hint   - short description; also surfaces it as a dashboard quick action
 *   active - custom matcher (pathname) => boolean, for nested routes
 * Items are active on an exact path match by default.
 */
const overview = (base) => ({
  label: "Overview",
  items: [{ label: "Dashboard", path: base, icon: LayoutDashboard }],
});

const frontDesk = (base) => ({
  label: "Front desk",
  items: [
    {
      label: "Visitors",
      path: `${base}/visitors`,
      icon: Users,
      active: (pathname) =>
        pathname === `${base}/visitors` ||
        new RegExp(`^${base}/visitors/[^/]+/pass$`).test(pathname),
    },
    {
      label: "Register visitor",
      path: `${base}/visitors/register`,
      icon: UserPlus,
      hint: "Create a new visitor request",
    },
    {
      label: "Check-out",
      path: `${base}/visitors/check-out`,
      icon: ScanLine,
      hint: "Scan a pass to record an exit",
    },
  ],
});

const administration = {
  label: "Administration",
  items: [
    {
      label: "Users",
      path: "/admin/users",
      icon: UserCog,
      active: (pathname) => pathname.startsWith("/admin/users"),
    },
    { label: "Departments", path: "/admin/departments", icon: Building2 },
  ],
};

const requests = (base) => ({
  label: "Requests",
  items: [
    {
      label: "Approvals",
      path: `${base}/approvals`,
      icon: ClipboardCheck,
      hint: "Review visitors waiting for you",
    },
  ],
});

export const navigationByRole = {
  ADMIN: [overview("/admin"), frontDesk("/admin"), administration],
  GATE_EMPLOYEE: [overview("/gate"), frontDesk("/gate")],
  EMPLOYEE: [overview("/employee"), requests("/employee")],
  DIRECTOR: [overview("/director"), requests("/director")],
};

export const isItemActive = (item, pathname) =>
  item.active ? item.active(pathname) : pathname === item.path;

/** Items worth surfacing as shortcuts on the dashboard. */

export const quickActionsFor = (user) => {
  if (!user) return [];

  return getNavigationForUser(user)
    .flatMap((group) => group.items)
    .filter((item) => item.hint);
};


// Add optional navigation for employees/directors with explicit permission.
export const getNavigationForUser = (user) => {
  if (!user) return [];

  const groups = navigationByRole[user.role] || [];
  const canRegister =
    ["EMPLOYEE", "DIRECTOR"].includes(user.role) &&
    Array.isArray(user.permissions) &&
    user.permissions.includes("visitor.register");

  if (!canRegister) return groups;

  return [
    ...groups,
    {
      label: "Visitor management",
      items: [
        {
          label: "Register visitor",
          path: "/visitor/register",
          icon: UserPlus,
          hint: "Create a new visitor request",
        },
      ],
    },
  ];
};

// Resolve page titles without changing existing navigation behavior.
export const titleForPath = (pathname) => {
  if (pathname === "/visitor/register") return "Register visitor";
  if (/\/visitors\/[^/]+\/pass$/.test(pathname)) return "Visitor Pass";

  const items = Object.values(navigationByRole)
    .flatMap((groups) => groups.flatMap((group) => group.items));

  return items.find((item) => item.path === pathname)?.label || "Workspace";
};
