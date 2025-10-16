import React, { useState, useEffect } from "react";
import { Flex } from "antd";
import { useQuery } from "@apollo/client";
import { GET_RECENT_PROJECTS } from "../apollo/project";

import Subtitle from "@components/Subtitle/Subtitle";
import RecentProjects from "../components/project/RecentProjects";
import RecentWorkers from "../components/worker/RecentWorkers";
import ProjectIAFlow from "../components/project/ProjectIAFlow";
import { useContextualRoute } from "@hooks/useContextualRoute";
import { LoadingSpinner } from "@components/common/LoadingScreen";

const Index = () => {
  // Rutas contextuales para el módulo
  const getModuleRoute = useContextualRoute("module");
  const [defaultProjectId, setDefaultProjectId] = useState(null);
  
  // Consulta para obtener proyectos recientes
  const { data, loading } = useQuery(GET_RECENT_PROJECTS, {
    variables: { limit: 1 }, // Solo necesitamos el más reciente
  });
  
  // Cuando tengamos datos, establecer el proyecto predeterminado
  useEffect(() => {
    if (data?.projects?.items?.length > 0) {
      setDefaultProjectId(data.projects.items[0].id);
    }
  }, [data]);

  return (
    <Flex gap="middle">
      <div className="col main-layout-column">
        <div className="main-layout-section">
          <div className="main-layout-title">Developer Panel Project</div>
          <Subtitle
            route={getModuleRoute("projects/create")}
            title="Proyectos"
          />
          <RecentProjects onProjectSelect={(id) => setDefaultProjectId(id)} />
        </div>
        <div className="main-layout-details">
          <Subtitle route={getModuleRoute("workers/create")} title="Worker" />
          <RecentWorkers />
        </div>
      </div>
      <div className="col main-layout-content">
        {loading ? (
          <LoadingSpinner size="small" />
        ) : (
          <ProjectIAFlow defaultProjectId={defaultProjectId} />
        )}
      </div>
    </Flex>
  );
};

export default Index;
