import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/admin/AdminNavbar";
import HeaderAdminLayout from "../components/admin/HeaderAdminlayout";

const AdminLayout = () => {
  return (
    <div className="container-fluid p-0 min-vh-100 bg-light">
      <div className="row g-0 min-vh-100">
        {/* Sidebar */}
        <div className="col-lg-2 col-md-3 bg-dark sticky-top min-vh-100 shadow">
          <AdminNavbar />
        </div>

        {/* Main Content Area */}
        <div className="col-lg-10 col-md-9 d-flex flex-column min-vh-100">
          <HeaderAdminLayout />
          <div className="px-4 py-2 flex-grow-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;