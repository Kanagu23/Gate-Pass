import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";

const STORAGE_KEY = "gatepass:sidebar-collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const { pathname } = useLocation();

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable: keep in-memory state only */
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
      />

      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ease-out ${
          collapsed ? "md:pl-14" : "md:pl-56"
        }`}
      >
        <Header
          collapsed={collapsed}
          onMenuClick={() => setMobileOpen(true)}
          onToggleCollapse={toggleCollapsed}
        />

        {/* key re-triggers the entrance animation on navigation */}
        <main key={pathname} className="animate-fade flex-1 p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
