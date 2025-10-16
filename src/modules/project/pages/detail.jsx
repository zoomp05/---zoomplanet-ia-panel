import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router';

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Extraer la ruta base (hasta /project)
  const basePath = location.pathname.split(`/${id}`)[0];
  
  useEffect(() => {
    // Simulamos la carga de datos de un proyecto
    const fetchProject = async () => {
      setLoading(true);
      
      // Aquí iría la llamada a la API real
      setTimeout(() => {
        setProject({
          id,
          name: `Proyecto de ejemplo #${id}`,
          description: `Esta es una descripción de ejemplo para el proyecto #${id}.`,
          status: 'Activo',
          createdAt: new Date().toLocaleDateString()
        });
        setLoading(false);
      }, 500);
    };
    
    fetchProject();
  }, [id]);
  
  if (loading) {
    return <div className="loading">Cargando detalles del proyecto...</div>;
  }
  
  if (!project) {
    return (
      <div className="not-found">
        <h2>Proyecto no encontrado</h2>
        <Link to={basePath}>Volver a Proyectos</Link>
      </div>
    );
  }
  
  return (
    <div className="project-detail">
      <h1>Detalles del Proyecto #{id}</h1>
      
      <div className="project-info">
        <div className="info-group">
          <label>ID:</label>
          <span>{project.id}</span>
        </div>
        
        <div className="info-group">
          <label>Nombre:</label>
          <span>{project.name}</span>
        </div>
        
        <div className="info-group">
          <label>Descripción:</label>
          <p>{project.description}</p>
        </div>
        
        <div className="info-group">
          <label>Estado:</label>
          <span className="status">{project.status}</span>
        </div>
        
        <div className="info-group">
          <label>Fecha de creación:</label>
          <span>{project.createdAt}</span>
        </div>
      </div>
      
      <div className="project-actions">
        <Link to={`${basePath}`} className="button">Volver a Proyectos</Link>
        <button className="button">Editar Proyecto</button>
      </div>
    </div>
  );
};

export default ProjectDetail;