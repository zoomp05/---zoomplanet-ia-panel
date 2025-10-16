import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import * as ReactRouter from 'react-router';
const { useParams, useNavigate, useSearchParams } = ReactRouter;
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
import FileManager from "../components/FileManager";
import FileTree from "../components/File/FileTree";
import FileBrowser from "../components/FileBrowser/FileBrowser";

const ProjectView = () => {
  const { id: projectId } = useParams(); // Use projectId instead of id
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Inicializar desde la url, por ejemplo ?taskId=123&threadId=456
  const initialTaskId = searchParams.get("taskId");
  const initialThreadId = searchParams.get("threadId");

  const [pendingChanges, setPendingChanges] = useState({});
  const [modifiedFields, setModifiedFields] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId);
  const [selectedThreadId, setSelectedThreadId] = useState(initialThreadId);
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
    setSearchParams({ taskId, threadId: "" });
  };

  const handleThreadSelect = (threadId) => {
    setSelectedThreadId(threadId);
    setSearchParams((prev) => {
      const params = Object.fromEntries([...prev]);
      return { ...params, threadId };
    });
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
  const workspace = project.workspace_project; // Obtener el workspace del proyecto

  // Validar que existe el workspace antes de renderizar FileManagerView
  return (
    <div className="container-row project-view">
      <TaskList
        projectId={projectId}
        onTaskSelect={handleTaskSelect}
        selectedTaskId={selectedTaskId}
      />

      <ThreadList
        taskId={selectedTaskId}
        onThreadSelect={handleThreadSelect}
        selectedThreadId={selectedThreadId}
      />

      <CompactWidget
        id="chat-widget"
        title="Chat"
        icon={MessageSquare}
        defaultExpanded={true}
        minWidth="48px"
        maxWidth="400px"
      >
        {selectedThreadId && (
          <Chat workerId={null} threadId={selectedThreadId} />
        )}
      </CompactWidget>

      <CompactWidget
        id="code-editor-widget"
        title="Code Editor"
        icon={MessageSquare}
        defaultExpanded={true}
        minWidth="48px"
        maxWidth="400px"
      ></CompactWidget>

      <CompactWidget
        id="project-widget"
        title="Project Workspace"
        icon={MessageSquare}
        defaultExpanded={true}
        minWidth="48px"
        maxWidth="400px"
      >
        {projectId && (
          <WorkspaceManager
            projectId={projectId}
            onWorkspaceAdd={handleWorkspaceAdd}
          />
        )}
      </CompactWidget>

      {workspace && (
        <CompactWidget
          id="file-manager-widget"
          title="File Manager"
          icon={MessageSquare}
          defaultExpanded={true}
          minWidth="48px"
          maxWidth="800px"
        >
          <FileManager 
            workspaceId={workspace.id} 
            projectId={projectId}
          />
        </CompactWidget>
      )}

      {/*
      <FileTree />

      <FileBrowser />*/}
    </div>
  );
};

export default ProjectView;
