import React from "react";
import { NavLink, Link } from "react-router-dom";

const AdminNavbar = () => {
  return (
    <aside className="d-flex flex-column h-100 py-4 px-3 text-white">
      {/* Admin Brand */}
      <div className="mb-4 px-2">
        <Link to="/admin" className="text-white text-decoration-none d-flex align-items-center gap-2">
          <span className="fs-3">🏸</span>
          <div>
            <h5 className="fw-bold mb-0 tracking-tight text-white">NÚI XANH</h5>
            <span className="badge bg-success small" style={{ fontSize: '10px' }}>
              ADMIN PORTAL
            </span>
          </div>
        </Link>
      </div>

      <hr className="border-secondary my-2 opacity-50" />

      {/* Navigation Links */}
      <ul className="nav nav-pills flex-column gap-1 my-3">
        <li className="nav-item">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 text-white ${
                isActive ? "bg-success active shadow-sm fw-bold" : "hover-dark-light opacity-80"
              }`
            }
          >
            <i className="bi bi-speedometer2 fs-5"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 text-white ${
                isActive ? "bg-success active shadow-sm fw-bold" : "hover-dark-light opacity-80"
              }`
            }
          >
            <i className="bi bi-box-seam fs-5"></i>
            <span>Sản phẩm</span>
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink
            to="/admin/add_products"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 text-white ${
                isActive ? "bg-success active shadow-sm fw-bold" : "hover-dark-light opacity-80"
              }`
            }
          >
            <i className="bi bi-plus-circle fs-5"></i>
            <span>Thêm sản phẩm</span>
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink
            to="/admin/order_management"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 text-white ${
                isActive ? "bg-success active shadow-sm fw-bold" : "hover-dark-light opacity-80"
              }`
            }
          >
            <i className="bi bi-receipt-cutoff fs-5"></i>
            <span>Quản lý đơn hàng</span>
          </NavLink>
        </li>
      </ul>

      {/* Bottom Shortcuts */}
      <div className="mt-auto pt-4 border-top border-secondary">
        <Link
          to="/"
          className="btn btn-outline-light btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2"
        >
          <i className="bi bi-shop"></i>
          <span>Về trang bán hàng</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminNavbar;