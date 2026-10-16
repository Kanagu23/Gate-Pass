
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenMenu = () => setMobileOpen(true);
  const handleCloseMenu = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleCloseMenu}
      />

      <div className="min-h-screen md:pl-64">
        <Header onMenuClick={handleOpenMenu} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
