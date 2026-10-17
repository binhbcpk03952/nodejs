import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HeaderAdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <header className="w-100 py-3 mb-3 border-bottom bg-white px-2">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Link to="/" className="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center gap-2 px-3">
            <i className="bi bi-house-door"></i>
            <span>Xem Website Khách Hàng</span>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-person-circle fs-4 text-success"></i>
            <div>
              <span className="fw-bold small d-block leading-tight">
                {user ? user.name : "Quản Trị Viên"}
              </span>
              <small className="text-muted" style={{ fontSize: '11px' }}>
                {user ? user.email : "admin@badminton.vn"}
              </small>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="btn btn-outline-danger btn-sm rounded-circle p-2"
            title="Đăng xuất"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdminLayout;
