import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/client/Header";
import Footer from "../components/client/Footer";

const ClientLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light-subtle">
      <div className="bg-white border-bottom shadow-sm sticky-top">
        <div className="container">
          <Header />
        </div>
      </div>
      <main className="flex-grow-1 container py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
