import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router";
import { LoadingSpinner } from "../components/common/LoadingScreen";
import { InlineEdit } from "../components/common/InlineEdit";
import WorkspaceModal from "../components/workspace/WorkspaceModal";
import { useNavigationGuard } from "../hooks/useNavigationGuard";
import { PROJECT_TYPES, typeLabels } from "../constants/project";
import { GET_PROJECT, UPDATE_PROJECT } from "../apollo/project";
import { GET_WORKSPACES } from "../apollo/workspace";
import "../css/ProjectView.css";
import toast from "react-hot-toast";
import Modal from "../components/Modal/Modal";
import TypeSelector from "../components/type/TypeSelector";
import TaskList from "../components/task/TaskList";
import ThreadList from "../components/thread/ThreadList";
import Chat from "../components/Chat/Chat";
import WorkspaceManager from "../components/workspace/WorkspaceManager";
import { Switch } from "antd";
import CompactItemList from "../components/common/CompactItemList";
import { MessageSquare } from "lucide-react";
import CompactWidget from "../components/common/CompactWidget";

const ProjectView = () => {
  const { id: projectId } = useParams(); // Use projectId instead of id
  const navigate = useNavigate();
  const [pendingChanges, setPendingChanges] = useState({});
  const [modifiedFields, setModifiedFields] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [isCompactView, setIsCompactView] = useState(false);

  // Dentro del componente ProjectView, agregar el estado para el modal
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
  });

  const { data: workspacesData, refetch: refetchWorkspaces } =
    useQuery(GET_WORKSPACES);

  const [updateProject] = useMutation(UPDATE_PROJECT);

  // Usar el hook de navegación
  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;
  const canNavigate = useNavigationGuard(
    hasUnsavedChanges,
    "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"
  );

  // Handlers
  const handleTaskSelect = (taskId) => {
    setSelectedTaskId(taskId);
    setSelectedThreadId(null); // Limpiar thread seleccionado al cambiar de tarea
  };

  const handleThreadSelect = (threadId) => {
    setSelectedThreadId(threadId);
  };

  const handleNavigate = useCallback(
    (to) => {
      if (canNavigate(to)) {
        navigate(to);
      }
    },
    [canNavigate, navigate]
  );

  // Prevenir cierre de ventana si hay cambios pendientes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Convertir PROJECT_TYPES a formato de opciones
  const projectTypeOptions = Object.values(PROJECT_TYPES).map((value) => ({
    value: value,
    label: typeLabels[value],
  }));

  // Función auxiliar para obtener la etiqueta de un tipo de proyecto
  const getProjectTypeLabel = (type) => {
    return typeLabels[type] || type;
  };

  const handleFieldChange = (field, value) => {
    setPendingChanges((prev) => ({
      ...prev,
      [field]: value,
    }));
    setModifiedFields((prev) => new Set(prev).add(field));
  };

  const handleSave = async () => {
    console.log("pending changes", pendingChanges);
    try {
      const currentProject = {
        title: project.title,
        type: project.type,
        description: project.description || null,
        openai_key: project.openai_key || null,
        workspace_project: project.workspace_project?.id || null,
        project: project.project?.id || null,
      };

      // Combinar los cambios pendientes con los valores actuales
      const updateInput = {
        ...currentProject,
        ...pendingChanges,
      };

      const result = await updateProject({
        variables: {
          id: projectId,
          input: updateInput,
        },
      });

      const response = result.data.updateProject;

      switch (response.__typename) {
        case "Project":
          toast.success("Project updated successfully");
          await refetch();
          setPendingChanges({});
          setModifiedFields(new Set());
          break;
        case "ValidationError":
          toast.error(`Validation error: ${response.message}`);
          break;
        case "NotFoundError":
          toast.error(`Project not found: ${response.message}`);
          navigate("/projects");
          break;
        default:
          toast.error("Unexpected response type");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(error.message || "Error updating project");
    }
  };

  const handleCancel = () => {
    setPendingChanges({});
    setModifiedFields(new Set());
  };

  const handleWorkspaceAdd = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleWorkspaceCreated = async (workspace) => {
    try {
      await refetchWorkspaces();
      const field = "workspace_project";
      handleFieldChange(field, workspace.id);

      // Refrescar los datos del proyecto
      await refetch();

      // Mostrar mensaje de éxito
      toast.success(`Workspace ${modalType.toLowerCase()} creado exitosamente`);

      // Cerrar el modal
      setModalOpen(false);
    } catch (error) {
      console.error("Error after workspace creation:", error);
      toast.error("Error al actualizar el proyecto");
    }
  };

  const handleWorkspaceUpdated = async (workspace) => {
    try {
      // Refrescar los datos del proyecto
      await refetch();
      await refetchWorkspaces();

      // Mostrar mensaje de éxito
      toast.success(`Workspace actualizado exitosamente`);

      // Cerrar el modal
      setModalOpen(false);
    } catch (error) {
      console.error("Error after workspace update:", error);
      toast.error("Error al actualizar el workspace");
    }
  };

  const getWorkspaceInitialData = () => {
    if (!modalType || !project) return null;

    const workspace = project.workspace_project;

    if (!workspace) return null;

    return {
      name: workspace.name,
      description: workspace.description,
      type: modalType,
    };
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  const project = data.project;

  console.log("Project ", project);

  return (
    <div className="container-row project-view">
      {isCompactView ? (
        <CompactItemList
          items={tasks}
          onItemClick={handleTaskSelect}
          selectedId={selectedTaskId}
        />
      ) : (
        <TaskList
          projectId={projectId}
          onTaskSelect={handleTaskSelect}
          selectedTaskId={selectedTaskId}
        />
      )}

      {selectedTaskId ? (
        isCompactView ? (
          <CompactItemList
            items={threads}
            onItemClick={handleThreadSelect}
            selectedId={selectedThreadId}
          />
        ) : (
          <ThreadList
            taskId={selectedTaskId}
            onThreadSelect={handleThreadSelect}
            selectedThreadId={selectedThreadId}
          />
        )
      ) : (
        <div className="no-task-selected">
          <p>Selecciona una tarea para ver sus conversaciones</p>
        </div>
      )}

      <CompactWidget
        title="Chat"
        icon={MessageSquare}
        defaultExpanded={true}
        minWidth="48px"
        maxWidth="400px"
      >
        {selectedThreadId ? (
          <Chat workerId={null} threadId={selectedThreadId} />
        ) : (
          <div className="no-thread-selected">
            <p>Selecciona una conversación para ver los mensajes</p>
          </div>
        )}
      </CompactWidget>

      {projectId ? (
            <WorkspaceManager projectId={projectId} />
          ) : (
            <div className="no-thread-selected">
              <p>Selecciona un Proyecto</p>
            </div>
          )}

    
      <div className="col-30">
        <div className="project-view-header">
          <InlineEdit
            type="text"
            value={pendingChanges.title ?? project.title}
            onChange={(value) => handleFieldChange("title", value)}
            isModified={modifiedFields.has("title")}
            className="project-view-title"
          />
          <div
            className="project-view-type"
            onClick={() => setIsTypeModalOpen(true)}
          >
            <div
              className={`inline-edit-display ${
                modifiedFields.has("type") ? "modified" : ""
              }`}
            >
              {getProjectTypeLabel(pendingChanges.type ?? project.type)}
            </div>
          </div>
        </div>

        <div className="project-view-content">
          <div className="project-view-section">
            <h3>Descripción</h3>
            <InlineEdit
              type="textarea"
              value={pendingChanges.description ?? project.description}
              onChange={(value) => handleFieldChange("description", value)}
              isModified={modifiedFields.has("description")}
              className="project-view-description"
            />
          </div>

          <div className="project-view-section">
            <h3>Configuración</h3>
            <div className="project-view-config">
              <div className="config-item">
                <label>OpenAI Key</label>
                <InlineEdit
                  //type="password"
                  value={pendingChanges.openai_key ?? project.openai_key}
                  onChange={(value) => handleFieldChange("openai_key", value)}
                  isModified={modifiedFields.has("openai_key")}
                />
              </div>
            </div>
          </div>

          <div className="project-view-section">
            <h3>Workspaces</h3>
            <div className="workspaces-grid">
              <div className="workspace-card">
                <h4>Proyecto</h4>
                <div className="workspace-input-group">
                  <div className="workspace-display">
                    {project.workspace_project ? (
                      <span>{project.workspace_project.name}</span>
                    ) : (
                      <span className="workspace-placeholder">
                        Sin workspace asignado
                      </span>
                    )}
                    <button
                      type="button"
                      className="workspace-add-button"
                      onClick={() => {
                        setModalType("PROJECT");
                        setModalOpen(true);
                      }}
                      title={
                        project.workspace_project
                          ? "Editar workspace"
                          : "Crear workspace"
                      }
                    >
                      {project.workspace_project ? "✎" : "+"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="save-bar">
          <div className="save-bar-content">
            <span>Tienes cambios sin guardar</span>
            <div className="save-bar-actions">
              <button className="save-bar-button cancel" onClick={handleCancel}>
                Cancelar
              </button>
              <button className="save-bar-button save" onClick={handleSave}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      <WorkspaceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        workspaceType={modalType}
        projectId={projectId}
        workspaceId={project.workspace_project?.id}
        initialData={getWorkspaceInitialData()} // Pasar datos iniciales
        onWorkspaceCreated={handleWorkspaceCreated}
        onWorkspaceUpdated={handleWorkspaceUpdated}
      />

      <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)}>
        <TypeSelector
          currentValue={pendingChanges.type ?? project.type}
          onSelect={(value) => {
            handleFieldChange("type", value);
            setIsTypeModalOpen(false);
          }}
          onClose={() => setIsTypeModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ProjectView;
