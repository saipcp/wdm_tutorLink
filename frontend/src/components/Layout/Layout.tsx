import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const Layout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
