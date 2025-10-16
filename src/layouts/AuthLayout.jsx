import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./MainLayout.css";

const AuthLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <main className="main-layout-main">
        <div className="row main-layout-panel">
          <div className="col main-layout-content">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
