import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-h-screen flex-col md:pl-56">
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* key re-triggers the entrance animation on navigation */}
        <main key={pathname} className="animate-fade flex-1 p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
