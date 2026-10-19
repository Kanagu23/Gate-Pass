
import {
  ClipboardCheck,
  LayoutDashboard,
  ScanLine,
  UserPlus,
  Users,
} from "lucide-react";

// Default dashboard route for each role
export const roleHome = {
  ADMIN: "/admin",
  GATE_EMPLOYEE: "/gate",
  EMPLOYEE: "/employee",
  DIRECTOR: "/director",
};

// Display labels for user roles
export const roleLabels = {
  ADMIN: "Administrator",
  GATE_EMPLOYEE: "Gate Employee",
  EMPLOYEE: "Employee",
  DIRECTOR: "Director",
};

// Navigation for Admin and Gate Employee
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

// Navigation for Employee and Director
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

// Default role-based navigation
export const navigationByRole = {
  ADMIN: frontDesk("/admin"),
  GATE_EMPLOYEE: frontDesk("/gate"),
  EMPLOYEE: approver("/employee"),
  DIRECTOR: approver("/director"),
};

// Build navigation based on role and custom permissions
export const getNavigationForUser = (user) => {
  if (!user) return [];

  const groups = navigationByRole[user.role] || [];

  const canRegister =
    ["EMPLOYEE", "DIRECTOR"].includes(user.role) &&
    user.permissions?.includes("visitor.register");

  if (!canRegister) return groups;

  return [
    ...groups,
    {
      label: "Visitor Registration",
      items: [
        {
          label: "Register Visitor",
          path: "/visitor/register",
          icon: UserPlus,
          hint: "Create a new visitor request",
        },
      ],
    },
  ];
};

// Resolve page title from pathname
export const titleForPath = (pathname) => {
  // Permission-based registration page
  if (pathname === "/visitor/register") {
    return "Register Visitor";
  }

  // Visitor pass details page
  if (/\/visitors\/[^/]+\/pass$/.test(pathname)) {
    return "Visitor Pass";
  }

  // Existing role-based navigation titles
  const all = Object.values(navigationByRole).flat();

  return (
    all.find((item) => item.path === pathname)?.label ||
    "Workspace"
  );
};

export const quickActionsFor = (role) => {
  return navigationByRole[role] || [];
};  
export const isItemActive = (pathname, itemPath) => {
  if (!pathname || !itemPath) return false;

  return (
    pathname === itemPath ||
    pathname.startsWith(`${itemPath}/`)
  );
};