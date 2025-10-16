import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';

const ProjectCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extraer la ruta base (hasta /project)
  const basePath = location.pathname.split('/create')[0];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Aquí iría la lógica para guardar el proyecto
    console.log('Datos del proyecto:', formData);
    
    // Redirigir al listado de proyectos
    navigate(`${basePath}/list`);
  };
  
  return (
    <div className="project-create">
      <h1>Crear Nuevo Proyecto</h1>
      <p>Complete el formulario para crear un nuevo proyecto.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descripción:</label>
          <textarea 
            id="description" 
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          ></textarea>
        </div>
        
        <div className="form-actions">
          <Link to={`${basePath}/list`} className="btn btn-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary">Crear Proyecto</button>
        </div>
      </form>
    </div>
  );
};

export default ProjectCreate;