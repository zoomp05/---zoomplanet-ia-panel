import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import * as ReactRouter from 'react-router';
const { useParams, useNavigate } = ReactRouter;
import { LoadingSpinner } from "../components/common/LoadingScreen";
import { InlineEdit } from "../components/common/InlineEdit";
import { useNavigationGuard } from "../hooks/useNavigationGuard";
import { toast } from "react-hot-toast";
import { GET_WORKER, CREATE_WORKER, UPDATE_WORKER } from "../apollo/worker";

import OpenAIIDSelector from "../components/configuration/OpenAIIDSelector";
import "../css/WorkerView.css";

const WORKER_MODELS = {
  GPT_4: "GPT-4",
  GPT_4_0: "GPT-4.0",
  GPT_4_TURBO: "GPT-4 Turbo",
  GPT_3_5_TURBO: "GPT-3.5 Turbo",
};

const WORKER_TOOLS = {
  CODE_INTERPRETER: "Code Interpreter",
  RETRIEVAL: "Retrieval",
  FUNCTION_CALLING: "Function Calling",
};

const WorkerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreateMode = !id;
  const [editingOpenAIID, setEditingOpenAIID] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    model: 'GPT_4',
    tools: ['CODE_INTERPRETER'],
  });

  const [modifiedFields, setModifiedFields] = useState(new Set());

  const { data, loading, error, refetch } = useQuery(GET_WORKER, {
    variables: { id },
    skip: isCreateMode,
    onCompleted: (data) => {
      if (!isCreateMode && !data?.worker) {
        toast.error("Worker no encontrado");
        navigate("/workers");
      }
    },
  });

  const [createWorker] = useMutation(CREATE_WORKER);
  const [updateWorker] = useMutation(UPDATE_WORKER);

  useEffect(() => {
    if (!isCreateMode && data?.worker) {
      setFormData({
        name: data.worker.name,
        instructions: data.worker.instructions,
        model: data.worker.model,
        tools: data.worker.tools
      });
    }
  }, [isCreateMode, data]);

  const hasUnsavedChanges = modifiedFields.size > 0;
  const canNavigate = useNavigationGuard(
    hasUnsavedChanges,
    "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"
  );

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

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setModifiedFields((prev) => new Set(prev).add(field));
  };

  const handleToolToggle = (tool) => {
    const updatedTools = formData.tools.includes(tool)
      ? formData.tools.filter((t) => t !== tool)
      : [...formData.tools, tool];

    handleFieldChange("tools", updatedTools);
  };

  const handleSave = async () => {
    try {
      if (isCreateMode) {
        // No incluir openai_id en la creación
        const { openai_id, ...createInput } = formData;
        
        const result = await createWorker({
          variables: {
            input: createInput
          }
        });
  
        if (result.data?.createWorker.__typename === 'Worker') {
          toast.success("Worker creado exitosamente");
          navigate(`/workers/${result.data.createWorker.id}`);
        } else {
          throw new Error(result.data?.createWorker.message || 'Error al crear el worker');
        }
      } else {
        const result = await updateWorker({
          variables: {
            id,
            input: formData
          }
        });
  
        if (result.data?.updateWorker.__typename === 'Worker') {
          toast.success("Worker actualizado exitosamente");
          await refetch();
          setModifiedFields(new Set());
        } else {
          throw new Error(result.data?.updateWorker.message || 'Error al actualizar el worker');
        }
      }
    } catch (error) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} worker:`, error);
      toast.error(error.message);
    }
  };

  const handleCancel = () => {
    if (isCreateMode) {
      navigate("/workers");
    } else {
      setFormData({
        name: data.worker.name,
        instructions: data.worker.instructions,
        model: data.worker.model,
        tools: data.worker.tools,
       
      });
      setModifiedFields(new Set());
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;
  if (!isCreateMode && !data?.worker) return null;

  const pageTitle = isCreateMode ? "Crear Worker" : "Editar Worker";
  const buttonText = isCreateMode ? "Crear" : "Guardar cambios";

  return (
    <div className="worker-view">
      <div className="worker-view-header">
        <label>Nombre</label>
        <InlineEdit
          type="text"
          value={formData.name}
          onChange={(value) => handleFieldChange("name", value)}
          isModified={modifiedFields.has("name")}
          className="worker-view-title"
          placeholder="Nombre del worker"
        />
      </div>

        {!isCreateMode && (
          <div className="worker-view-section">
            <h3>Assistant ID</h3>
            <div className="">
              {formData.openai_id || ''}
            </div>
          </div>
        )}

        

      <div className="worker-view-content">
        <div className="worker-view-section">
          <h3>Instrucciones</h3>
          <InlineEdit
            type="textarea"
            value={formData.instructions}
            onChange={(value) => handleFieldChange("instructions", value)}
            isModified={modifiedFields.has("instructions")}
            placeholder="Instrucciones detalladas para el worker"
          />
        </div>

        <div className="worker-view-section">
          <h3>Configuración</h3>
          <div className="config-item">
            <label>Modelo</label>
            <select
              value={formData.model}
              onChange={(e) => handleFieldChange("model", e.target.value)}
              className={modifiedFields.has("model") ? "modified" : ""}
            >
              {Object.entries(WORKER_MODELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="config-item">
            <label>Herramientas</label>
            <div className="tools-grid">
              {Object.entries(WORKER_TOOLS).map(([value, label]) => (
                <label key={value} className="tool-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.tools.includes(value)}
                    onChange={() => handleToolToggle(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>


        {!isCreateMode && (
          <div className="worker-view-section">
            <h3>Archivos Asociados</h3>
            <div className="files-list">
              {data.worker.openai_files_ids?.map((file) => (
                <div key={file.id} className="file-item">
                  {file.id}
                </div>
              )) || <p>No hay archivos asociados</p>}
            </div>
          </div>
        )}
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
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerView;