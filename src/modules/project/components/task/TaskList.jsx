import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigationGuard } from '@hooks/useNavigationGuard';
import CompactItemList from '@components/common/CompactItemList';
import './TaskList.css';
import '@components/common/CompactItemList.css';

const GET_TASKS = gql`
  query GetTasks($projectId: ID!) {
    tasks(projectId: $projectId) {
      id
      description
      dirBase
      files
      project {
        id
      }
      worker {
        id
        name
      }
      threads {
        id
        name
      }
      createdAt
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      id
      description
      dirBase
      files
      project {
        id
      }
      worker {
        id
        name
      }
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: TaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      description
      dirBase
      files
      project {
        id
      }
    }
  }
`;

export default function TaskList({ projectId, onTaskSelect, selectedTaskId }) {
  const [tasks, setTasks] = useState([]);
  const [draftTask, setDraftTask] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [createError, setCreateError] = useState(null);

  const { loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { projectId },
    onCompleted: (data) => setTasks(data.tasks || [])
  });

  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: [
      { query: GET_TASKS, variables: { projectId } }
    ]
  });

  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: [
      { query: GET_TASKS, variables: { projectId } }
    ]
  });

  const canNavigate = useNavigationGuard(
    hasUnsavedChanges,
    "You have an unsaved task. Do you want to discard it?"
  );

  const handleAddTask = () => {
    if (draftTask) return;

    const newDraft = {
      id: `draft-${Date.now()}`,
      description: '',
      projectId,
      isNew: true,
      isDraft: true
    };

    setDraftTask(newDraft);
    setHasUnsavedChanges(true);
  };

  const handleSaveTask = async (description) => {
    if (!description.trim()) {
      return false;
    }

    try {
      const result = await createTask({
        variables: {
          input: {
            description: description.trim(),
            dirBase: '/',
            files: [],
            projectId // Agregar projectId al input
          }
        }
      });

      const newTask = result.data.createTask;
      setTasks(prev => [newTask, ...prev]);
      setDraftTask(null);
      setHasUnsavedChanges(false);
      setCreateError(null);
      toast.success('Task created successfully');
      return true;
    } catch (error) {
      setCreateError(error.message);
      toast.error('Failed to create task. You can try again or discard.');
      return false;
    }
  };

  const handleUpdateTask = async (taskId, newDescription) => {
    try {
      const result = await updateTask({
        variables: {
          id: taskId,
          input: {
            description: newDescription,
            dirBase: "/",
            files: [],
            projectId // Asegurarnos de mantener el projectId
          }
        }
      });

      if (result.data?.updateTask) {
        toast.success('Task updated successfully');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error.message || 'Error updating task');
      throw error;
    }
  };

  const handleCancelDraft = () => {
    if (hasUnsavedChanges && draftTask?.description) {
      const shouldDiscard = window.confirm('Do you want to discard this task?');
      if (!shouldDiscard) return false;
    }

    setDraftTask(null);
    setHasUnsavedChanges(false);
    setCreateError(null);
    return true;
  };

  const handleDraftChange = (description) => {
    setDraftTask(prev => ({
      ...prev,
      description
    }));
    setHasUnsavedChanges(true);
  };

  const handleTaskSelect = (taskId) => {
    onTaskSelect?.(taskId);
  };

  // Transformar las tareas al formato que espera CompactItemList
  const transformTasksToItems = (tasks) => {
    return tasks?.map(task => ({
      id: task.id,
      type: 'abrev',
      text: task.description || 'Sin título',
      originalTask: task
    })) || [];
  };

  const handleItemUpdate = async (itemId, newText) => {
    const task = tasks.find(t => t.id === itemId);
    if (!task) return;

    try {
      await handleUpdateTask(itemId, newText);
      // Actualizar el estado local después de una actualización exitosa
      setTasks(prev => prev.map(t => 
        t.id === itemId ? { ...t, description: newText } : t
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleOpenChat = (taskId) => {
    // Primero seleccionamos la tarea
    handleTaskSelect(taskId);
    // Aquí podrías agregar lógica adicional para abrir el chat
  };

  if (loading) return <div className="task-list-loading">Loading tasks...</div>;
  if (error) return <div className="task-list-error">Error: {error.message}</div>;

  return (

      tasks && tasks.length >= 0 && (
        <CompactItemList
          id="tasks"
          items={transformTasksToItems(tasks)}
          onItemUpdate={handleItemUpdate}
          onItemSelect={handleTaskSelect}
          selectedItemId={selectedTaskId}
          title="Tareas"
          onAddItem={handleSaveTask}
          onOpenChat={handleOpenChat}
          defaultExpanded={true}
        />
      )
    
  );
}