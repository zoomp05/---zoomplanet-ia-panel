import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./AuthLayout.css";
import Subtitle from "@components/Subtitle/Subtitle";
//import FileBrowser from '../components/FileBrowser/FileBrowser';
import RecentProjects from '../components/project/RecentProjects';
import RecentWorkers from '../components/worker/RecentWorkers';
import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Header />
     
      <main className="main-layout-main">
        <div className="row main-layout-panel">
          <div className="col main-layout-column">
            <div className="main-layout-section">
              <div className="main-layout-title">Developer Panelss Layout Project</div>
              <Subtitle route="/projects/create" title="Proyectos"/>
              <RecentProjects /> 
            </div>
            <div className="main-layout-details">
            <Subtitle route="/workers/create" title="Worker"/>
            <RecentWorkers />
            </div>
          </div>
          <div className="col main-layout-content">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
