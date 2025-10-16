import React from 'react';
import { Link } from 'react-router';
import { useLocation } from 'react-router';

const ProjectList = () => {
  // Usamos useLocation para determinar nuestra ruta base actual
  const location = useLocation();
  
  // Extraer la ruta base (hasta /project)
  const basePath = location.pathname.split('/project')[0] + '/project';
  
  return (
    <div className="project-list">
      <h1>Lista de Proyectos</h1>
      <p>Aquí verás todos los proyectos disponibles.</p>
      <ul>
        <li><Link to={`${basePath}/1`}>Proyecto 1</Link></li>
        <li><Link to={`${basePath}/2`}>Proyecto 2</Link></li>
        <li><Link to={`${basePath}/3`}>Proyecto 3</Link></li>
      </ul>
      <div className="actions">
        <Link to={`${basePath}/create`} className="button">Crear Nuevo Proyecto</Link>
      </div>
    </div>
  );
};

export default ProjectList;