import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import * as ReactRouter from 'react-router';
import { gql } from '@apollo/client';
import '../css/CreateProject.css';
import MainLayout from '../layouts/MainLayout';
import WorkspaceModal from '../components/workspace/WorkspaceModal';
import BlankLayout from '../layouts/BlankLayout';

const { useNavigate } = ReactRouter;

const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      title
      description
      type
      openai_key
      workspace_context {
        id
        name
      }
      workspace_project {
        id
        name
      }
      project {
        id
        title
      }
    }
  }
`;

const GET_WORKSPACES = gql`
  query GetWorkspaces {
    workspaces {
      id
      name
      type
    }
  }
`;

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      title
      type
    }
  }
`;

const CreateProject = () => {
  const navigate = useNavigate();
  const [createProject, { loading }] = useMutation(CREATE_PROJECT);
  const { data: workspacesData, refetch: refetchWorkspaces } = useQuery(GET_WORKSPACES);
  const { data: projectsData } = useQuery(GET_PROJECTS);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    openai_key: '',
    project: null,
    workspace_context: null,
    workspace_project: null
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.type) newErrors.type = 'El tipo de proyecto es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCreateWorkspace = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleWorkspaceCreated = async (workspace) => {
    await refetchWorkspaces();
    if (modalType === 'CONTEXT') {
      setFormData(prev => ({
        ...prev,
        workspace_context: workspace.id
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        workspace_project: workspace.id
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { data } = await createProject({
        variables: {
          input: {
            ...formData,
            is_deleted: false
          }
        }
      });
      
      // Mostrar mensaje de éxito
      // Se podría agregar un toast o notificación aquí
      
      // Redireccionar a la página del proyecto creado
      navigate(`/projects/${data.createProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    }
  };

  const getContextWorkspaces = () => {
    return workspacesData?.workspaces.filter(w => w.type === 'CONTEXT') || [];
  };

  const getProjectWorkspaces = () => {
    return workspacesData?.workspaces.filter(w => w.type === 'PROJECT') || [];
  };

  return (
    <>
      <div className="create-project-container">
        <div className="create-project-header">
          <h1 className="create-project-title">Crear Nuevo Proyecto</h1>
          <p className="create-project-subtitle">
            Configure los detalles de su nuevo proyecto
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="create-project-form">
          <div className="form-section">
            <h2>Información Básica ---</h2>
            
            <div className="form-group">
              <label htmlFor="title">Título del Proyecto *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? 'error' : ''}
                placeholder="Ej: Mi Nuevo Proyecto"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describa el propósito y objetivos del proyecto"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Tipo de Proyecto *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'error' : ''}
              >
                <option value="">Seleccione un tipo</option>
                <option value="General">General</option>
                <option value="WebApp">Aplicación Web</option>
                <option value="ReactNodeMongo">Stack React/Node/Mongo</option>
                <option value="Marketing">Marketing</option>
                <option value="Process">Proceso</option>
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>Configuración de IA</h2>
            
            <div className="form-group">
              <label htmlFor="openai_key">Clave API de OpenAI</label>
              <input
                type="password"
                id="openai_key"
                name="openai_key"
                value={formData.openai_key}
                onChange={handleChange}
                placeholder="sk-..."
              />
              <small>Deje en blanco para usar la clave API por defecto del sistema</small>
            </div>
          </div>

          <div className="form-section">
            <h2>Workspaces</h2>
            
            <div className="form-group">
              <label htmlFor="workspace_context">Workspace de Contexto</label>
              <div className="workspace-input-group">
                <select
                  id="workspace_context"
                  name="workspace_context"
                  value={formData.workspace_context || ''}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un workspace de contexto</option>
                  {getContextWorkspaces().map(workspace => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="workspace-add-button"
                  onClick={() => handleCreateWorkspace('CONTEXT')}
                  title="Crear nuevo workspace de contexto"
                >
                  +
                </button>
              </div>
              <small>Workspace para archivos de referencia y entrenamiento</small>
            </div>

            <div className="form-group">
              <label htmlFor="workspace_project">Workspace de Proyecto</label>
              <div className="workspace-input-group">
                <select
                  id="workspace_project"
                  name="workspace_project"
                  value={formData.workspace_project || ''}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un workspace de proyecto</option>
                  {getProjectWorkspaces().map(workspace => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="workspace-add-button"
                  onClick={() => handleCreateWorkspace('PROJECT')}
                  title="Crear nuevo workspace de proyecto"
                >
                  +
                </button>
              </div>
              <small>Workspace para archivos generados del proyecto</small>
            </div>
          </div>

          <div className="form-section">
            <h2>Relaciones</h2>
            
            <div className="form-group">
              <label htmlFor="project">Proyecto Padre</label>
              <select
                id="project"
                name="project"
                value={formData.project || ''}
                onChange={handleChange}
              >
                <option value="">Ninguno (Proyecto Independiente)</option>
                {projectsData?.projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              <small>Seleccione si este es un subproyecto de otro proyecto</small>
            </div>
          </div>

          {errors.submit && (
            <div className="error-banner">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>

        <WorkspaceModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onWorkspaceCreated={handleWorkspaceCreated}
          workspaceType={modalType}
        />
      </div>
    </>
  );
};

export default CreateProject;