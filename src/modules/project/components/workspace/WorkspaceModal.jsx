import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import './WorkspaceModal.css';

const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) {
      id
      name
      type
      description
    }
  }
`;

const GET_WORKSPACE = gql`
  query GetWorkspace($id: ID!) {
    workspace(id: $id) {
      id
      name
      type
      description
    }
  }
`;

const UPDATE_WORKSPACE = gql`
  mutation UpdateWorkspace($id: ID!, $input: UpdateWorkspaceInput!) {
    updateWorkspace(id: $id, input: $input) {
      id
      name
      type
      description
    }
  }
`;


const WorkspaceModal = ({ 
  isOpen, 
  onClose, 
  onWorkspaceCreated, 
  onWorkspaceUpdated,
  workspaceType,
  workspaceId = null,
  projectId,
  initialData = null // Nuevo prop para datos iniciales
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: workspaceType
  });

  console.log('workspaceId ', workspaceId);
  const [createWorkspace, { loading: createLoading }] = useMutation(CREATE_WORKSPACE);
  const [updateWorkspace, { loading: updateLoading }] = useMutation(UPDATE_WORKSPACE);
  
   // Query para obtener datos del workspace
   const { data: workspaceData, loading: loadingWorkspace, refetch } = useQuery(GET_WORKSPACE, {
    variables: { id: workspaceId },
    skip: !workspaceId,
    fetchPolicy: 'network-only' // Forzar refetch cada vez
  });

  const [error, setError] = useState('');

  // Cargar datos del workspace cuando está en modo edición
  useEffect(() => {
    if (isOpen) {
      if (workspaceId) {
        // Si tenemos datos iniciales, usarlos inmediatamente
        if (initialData) {
          setFormData({
            name: initialData.name || '',
            description: initialData.description || '',
            type: workspaceType
          });
        } 
        // Si no hay datos iniciales, refrescar datos del workspace
        else {
          refetch().then(({ data }) => {
            if (data?.workspace) {
              setFormData({
                name: data.workspace.name || '',
                description: data.workspace.description || '',
                type: workspaceType
              });
            }
          });
        }
      } else {
        // Modo creación: resetear formulario
        setFormData({
          name: '',
          description: '',
          type: workspaceType
        });
      }
      setError('');
    }
  }, [isOpen, workspaceId, workspaceType, initialData, refetch]);


  // Resetear el formulario al cerrar o cambiar de modo
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        type: workspaceType
      });
      setError('');
    }
  }, [isOpen, workspaceType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (workspaceId) {
        // Modo actualización
        const { data } = await updateWorkspace({
          variables: {
            id: workspaceId,
            input: {
              name: formData.name,
              description: formData.description,
              type: workspaceType
            }
          }
        });
        onWorkspaceUpdated?.(data.updateWorkspace);
      } else {
        // Modo creación
        const { data } = await createWorkspace({
          variables: {
            input: {
              ...formData,
              projectId,
              workspaceFor: workspaceType
            }
          }
        });
        onWorkspaceCreated(data.createWorkspace);
      }
      
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  const isLoading = createLoading || updateLoading || loadingWorkspace;
  const isEditMode = Boolean(workspaceId);
  const modalTitle = isEditMode ? 'Editar' : 'Crear';
  const submitText = isEditMode ? 'Guardar cambios' : 'Crear Workspace';
  const workspaceTypeText = workspaceType === 'PROJECT' ? 'de Proyecto' : 'de Contexto';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{modalTitle} Workspace {workspaceTypeText}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        {loadingWorkspace ? (
          <div className="modal-loading">Cargando datos del workspace...</div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre del workspace"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción del workspace"
                rows="3"
                disabled={isLoading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose}
                className="cancel-button"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : submitText}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WorkspaceModal;