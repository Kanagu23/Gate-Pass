import {
  ClipboardCheck,
  LayoutDashboard,
  ScanLine,
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

const frontDesk = (base) => [
  { label: "Dashboard", path: base, icon: LayoutDashboard },
  { label: "Visitors", path: `${base}/visitors`, icon: Users },
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

const approver = (base) => [
  { label: "Dashboard", path: base, icon: LayoutDashboard },
  {
    label: "Pending Approvals",
    path: `${base}/approvals`,
    icon: ClipboardCheck,
    hint: "Review visitors waiting for you",
  },
];

export const navigationByRole = {
  ADMIN: frontDesk("/admin"),
  GATE_EMPLOYEE: frontDesk("/gate"),
  EMPLOYEE: approver("/employee"),
  DIRECTOR: approver("/director"),
};

/** Resolve a human title for the header from the current pathname. */
export const titleForPath = (pathname) => {
  if (/\/visitors\/[^/]+\/pass$/.test(pathname)) return "Visitor Pass";
  const all = Object.values(navigationByRole).flat();
  return all.find((item) => item.path === pathname)?.label || "Workspace";
};
