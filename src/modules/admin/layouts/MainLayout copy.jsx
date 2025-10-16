import React from "react";
//import Header from "../components/Header/Header";
import ContextualHeader from '@components/ContextualHeader/ContextualHeader';

import Footer from "../components/Footer/Footer";
import "./AuthLayout.css";
import Subtitle from "@components/Subtitle/Subtitle";
import FileBrowser from '@components/FileBrowser/FileBrowser';
import RecentProjects from '@modules/project/components/project/RecentProjects';
import RecentWorkers from '@modules/project/components/worker/RecentWorkers';
import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="main-layout">
      <ContextualHeader />
     
      <main className="main-layout-main">
        <div className="row main-layout-panel">
          {/*<div className="col main-layout-column">
            <div className="main-layout-section">
              <div className="main-layout-title">Developer Panel</div>
              <Subtitle route="/projects/create" title="Proyectos"/>
              <RecentProjects /> 
            </div>
            <div className="main-layout-details">
            <Subtitle route="/workers/create" title="Worker"/>
            <RecentWorkers />
            </div>
          </div>*/}
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
