import React, { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Plus } from "lucide-react";
import { SortableThreadItem } from "./SortableThreadItem";
import { LoadingSpinner } from "../common/LoadingScreen";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { useNavigationGuard } from "../../hooks/useNavigationGuard";
import { GET_THREADS, CREATE_THREAD, UPDATE_THREAD } from "../../apollo/thread";
import "./ThreadList.css";
import { MessageCircle } from 'lucide-react';
import CompactItemList from '../common/CompactItemList';

const GET_WORKER = gql`
  query GetWorker($id: ID!) {
    worker(id: $id) {
      id
      name
      email
      status
    }
  }
`;

// Componente para metadata del thread
const ThreadItemMeta = ({ thread }) => (
  <div className="thread-metadata">
    <span className="thread-messages">
      <MessageCircle size={12} />
      {thread.messages?.length || 0} mensajes
    </span>
    {thread.worker && (
      <span className="thread-worker">{thread.worker.name}</span>
    )}
  </div>
);

export default function ThreadList({
  taskId,
  onThreadSelect,
  selectedThreadId,
}) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [draftThread, setDraftThread] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Remover la query de worker por ahora ya que no la estamos usando
  // const { data: workerData } = useQuery(GET_WORKER, {
  //   variables: { id: workerId },
  //   skip: !workerId
  // });

  const canNavigate = useNavigationGuard(
    hasUnsavedChanges,
    "Tienes cambios sin guardar. ¿Quieres descartarlos?"
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { loading, error, refetch } = useQuery(GET_THREADS, {
    variables: { taskId },
    skip: !taskId, // Agregar esta línea para evitar la query si no hay taskId
    onCompleted: (data) => setThreads(data.threads || [])
  });

  const [createThread] = useMutation(CREATE_THREAD);
  const [updateThread] = useMutation(UPDATE_THREAD);

  const handleAddThread = () => {
    if (draftThread) return;

    const newDraft = {
      id: `draft-${Date.now()}`,
      name: "",
      taskId,
      // workerId,
      isNew: true,
      isDraft: true
    };

    setDraftThread(newDraft);
    setHasUnsavedChanges(true);
  };

  const handleDraftChange = (name) => {
    setDraftThread(prev => ({
      ...prev,
      name
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveThread = async (name) => {
    if (!name.trim()) return false;

    // Verificar que tengamos el worker y su assistant_id
    // const worker = workerData?.worker;
    // if (!worker?.openai_id) {
    //   setCreateError("No se encuentra el asistente asociado");
    //   return false;
    // }

    try {
      // 1. Crear el thread en OpenAI
      const openaiResponse = await fetch(`/api/assistants/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // assistantId: worker.openai_id // Pasamos el ID del asistente
        })
      });
      
      if (!openaiResponse.ok) {
        throw new Error('Error creating OpenAI thread');
      }
      
      const openaiData = await openaiResponse.json();

      // 2. Crear en nuestra BD con la referencia al worker
      const result = await createThread({
        variables: {
          input: {
            name: name.trim(),
            taskId,
            // workerId,
            openai_id: openaiData.threadId
          }
        }
      });

      if (result.data?.createThread.success) {
        const newThread = result.data.createThread.thread;
        setThreads(prev => [newThread, ...prev]);
        setDraftThread(null);
        setHasUnsavedChanges(false);
        setCreateError(null);
        toast.success("Nuevo thread creado");
        return true;
      } else {
        // Limpiar el thread de OpenAI si falla nuestra BD
        await fetch(`/api/assistants/threads/${openaiData.threadId}`, {
          method: 'DELETE'
        });
        
        throw new Error(result.data?.createThread.error || "Error al crear el thread");
      }
    } catch (error) {
      setCreateError(error.message);
      toast.error(error.message || "Error al crear el thread");
      return false;
    }
  };

  const handleCancelDraft = async () => {
    if (hasUnsavedChanges && draftThread?.name) {
      const shouldDiscard = window.confirm("¿Quieres descartar esta conversación?");
      if (!shouldDiscard) return false;
    }
    
    setDraftThread(null);
    setHasUnsavedChanges(false);
    setCreateError(null);
    return true;
  };

  const handleUpdateThread = async (threadId, newName) => {
    try {
      const result = await updateThread({
        variables: {
          id: threadId,
          input: {
            name: newName
          }
        }
      });

      if (result.data?.updateThread) {
        toast.success("Thread actualizado");
        setThreads(prev =>
          prev.map(thread =>
            thread.id === threadId ? { ...thread, name: newName } : thread
          )
        );
      }
    } catch (error) {
      console.error("Error updating thread:", error);
      toast.error(error.message || "Error al actualizar el thread");
      throw error;
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setThreads(items => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  // Transformar threads al formato de CompactItemList
  const transformThreadsToItems = (threads) => {
    return threads?.map(thread => ({
      id: thread.id,
      type: 'thread',
      text: thread.name || 'Sin título',
      originalThread: thread,
      metadata: <ThreadItemMeta thread={thread} />
    })) || [];
  };

  const handleCreateThread = async (name) => {
    try {
      // const worker = workerData?.worker;
      // if (!worker?.openai_id) {
      //   toast.error("No se encuentra el asistente asociado");
      //   return false;
      // }

      // Crear thread en OpenAI
      const openaiResponse = await fetch(`/api/assistants/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* assistantId: worker.openai_id */ })
      });
      
      if (!openaiResponse.ok) {
        throw new Error('Error creating OpenAI thread');
      }
      
      const openaiData = await openaiResponse.json();

      // Crear en nuestra BD
      const result = await createThread({
        variables: {
          input: {
            name: name.trim(),
            taskId,
            // workerId,
            openai_id: openaiData.threadId
          }
        }
      });

      if (result.data?.createThread.success) {
        toast.success("Nuevo thread creado");
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message || "Error al crear el thread");
      return false;
    }
  };

  // Referencia al setIsExpanded que vendrá del CompactItemList
  const expandedRef = useRef(null);

  useEffect(() => {
    // Si hay un taskId seleccionado, asegurar que la lista se expanda
    if (expandedRef.current && taskId) {
      expandedRef.current(true);
    }
  }, [taskId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="thread-list-error">Error: {error.message}</div>;

  return (
    <CompactItemList
      id="thread-list"
      items={transformThreadsToItems(threads)}
      onItemUpdate={handleUpdateThread}
      onItemSelect={onThreadSelect}
      selectedItemId={selectedThreadId}
      title="Conversaciones"
      onAddItem={handleCreateThread}
      defaultExpanded={false} // Dejar que el storage determine el estado inicial
      onExpandedRef={fn => {
        expandedRef.current = fn;
      }}
    />
  );
}