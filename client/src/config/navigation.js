
import {
  ClipboardCheck,
  LayoutDashboard,
  ScanLine,
  UserPlus,
  Users,
} from "lucide-react";

// Default home route for each role
export const roleHome = {
  ADMIN: "/admin",
  GATE_EMPLOYEE: "/gate",
  EMPLOYEE: "/employee",
  DIRECTOR: "/director",
};

// Display names for roles
export const roleLabels = {
  ADMIN: "Administrator",
  GATE_EMPLOYEE: "Gate Employee",
  EMPLOYEE: "Employee",
  DIRECTOR: "Director",
};

// Admin and Gate Employee navigation
const frontDesk = (base) => [
  {
    label: "Dashboard",
    path: base,
    icon: LayoutDashboard,
  },
  {
    label: "Visitors",
    path: `${base}/visitors`,
    icon: Users,
  },
  {
    label: "Register Visitor",
    path: `${base}/visitors/register`,
    icon: UserPlus,
    hint: "Create a new visitor request",
  },
  {
    label: "QR Check-Out",
    path: `${base}/visitors/check-out`,
    icon: ScanLine,
    hint: "Scan a pass to record an exit",
  },
];

// Employee and Director navigation
const approver = (base) => [
  {
    label: "Dashboard",
    path: base,
    icon: LayoutDashboard,
  },
  {
    label: "Pending Approvals",
    path: `${base}/approvals`,
    icon: ClipboardCheck,
    hint: "Review visitors waiting for you",
  },
];

// Existing role-based navigation
export const navigationByRole = {
  ADMIN: frontDesk("/admin"),
  GATE_EMPLOYEE: frontDesk("/gate"),
  EMPLOYEE: approver("/employee"),
  DIRECTOR: approver("/director"),
};

// Build grouped navigation for the Sidebar
export const getNavigationForUser = (user) => {
  if (!user) return [];

  const items = navigationByRole[user.role] || [];

  const canRegister =
    ["EMPLOYEE", "DIRECTOR"].includes(user.role) &&
    user.permissions?.includes("visitor.register");

  const menuItems = canRegister
    ? [
        ...items,
        {
          label: "Register Visitor",
          path: "/visitor/register",
          icon: UserPlus,
          hint: "Create a new visitor request",
        },
      ]
    : items;

  return [
    {
      label: "Main Menu",
      items: menuItems,
    },
  ];
};

// Dashboard quick actions
export const quickActionsFor = (role) => {
  return (navigationByRole[role] || []).filter(
    (item) => item.hint
  );
};

// Determine whether a menu item is active
export const isItemActive = (pathname, itemPath) => {
  if (!pathname || !itemPath) return false;

  if (pathname === itemPath) return true;

  // Dashboard should only highlight on exact match
  if (Object.values(roleHome).includes(itemPath)) {
    return false;
  }

  return pathname.startsWith(`${itemPath}/`);
};

// Resolve header title from pathname
export const titleForPath = (pathname) => {
  if (pathname === "/visitor/register") {
    return "Register Visitor";
  }

  if (/\/visitors\/[^/]+\/pass$/.test(pathname)) {
    return "Visitor Pass";
  }

  const allItems = Object.values(navigationByRole).flat();

  return (
    allItems.find((item) => item.path === pathname)
      ?.label || "Workspace"
  );
};
