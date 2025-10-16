import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Modal from "../Modal/Modal";
import { LoadingSpinner } from "../common/LoadingScreen";
import { toast } from "react-hot-toast";
import "./OpenAIIDSelector.css";


const GET_CONFIGURATIONS = gql`
  query GetConfigurations {
    configurations {
      id
      openai_ids {
        id
      }
    }
  }
`;

const CREATE_CONFIGURATION = gql`
  mutation CreateConfiguration($input: ConfigurationInput!) {
    createConfiguration(input: $input) {
      id
      openai_ids {
        id
      }
    }
  }
`;

const UPDATE_CONFIGURATION = gql`
  mutation UpdateConfiguration($id: ID!, $input: ConfigurationInput!) {
    updateConfiguration(id: $id, input: $input) {
      id
      openai_ids {
        id
      }
    }
  }
`;

const OpenAIIDSelector = ({
    value, 
    onChange, 
    isModified
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOpenAIID, setNewOpenAIID] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef(null);
  
  const { data, loading, error, refetch } = useQuery(GET_CONFIGURATIONS);
  const [createConfiguration] = useMutation(CREATE_CONFIGURATION);
  const [updateConfiguration] = useMutation(UPDATE_CONFIGURATION);
  
  useEffect(() => {
    if (editingKey !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingKey]);

  const handleSelectOpenAIID = (id) => {
    onChange(id);
    setIsModalOpen(false);
  };
  
  const handleStartEdit = (key, currentValue) => {
    setEditingKey(key);
    setEditingValue(currentValue);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditingValue("");
  };

  const handleEditChange = (e) => {
    setEditingValue(e.target.value);
  };

  const handleUpdateOpenAIID = async (configurationId) => {
    try {
      const result = await updateConfiguration({
        variables: {
          id: configurationId,
          input: {
            openai_ids: [{ id: editingValue }],
          },
        },
      });

      if (result.data?.updateConfiguration) {
        toast.success("OpenAI ID actualizado exitosamente");
        setEditingKey(null);
        setEditingValue("");
        await refetch();
      }
    } catch (error) {
      console.error("Error updating OpenAI ID:", error);
      toast.error(error.message || "Error al actualizar el OpenAI ID");
    }
  };

  const handleCreateOpenAIID = async () => {
    if (!newOpenAIID.trim()) return;
    
    try {
      const result = await createConfiguration({
        variables: {
          input: {
            openai_ids: [{ id: newOpenAIID }],
          },
        },
      });

      if (result.data?.createConfiguration) {
        toast.success("Nuevo OpenAI ID creado exitosamente");
        setNewOpenAIID("");
        await refetch();
      }
    } catch (error) {
      console.error("Error creating OpenAI ID:", error);
      toast.error(error.message || "Error al crear el OpenAI ID");
    }
  };

  if (loading) return <LoadingSpinner size="small" />;
  if (error) return <div>Error: {error.message}</div>;

  const configurations = data?.configurations || [];

  return (
    <div className="openai-id-selector">
      <div
        className={`openai-id-display ${isModified ? "modified" : ""}`}
        onClick={() => setIsModalOpen(true)}
      >
        {value || "Seleccionar OpenAI ID"}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3>Seleccionar OpenAI ID</h3>
        <ul className="openai-id-list">
          {configurations.map((config) =>
            config.openai_ids.map((openAIID, index) => {
              const key = `${config.id}-${index}`;
              const isEditing = editingKey === key;
              
              return (
                <li key={key} className="openai-id-item">
                  {isEditing ? (
                    <div className="editing-openai-id">
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingValue}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                      <div className="edit-actions">
                        <button 
                          onClick={() => handleUpdateOpenAIID(config.id)}
                          className="save-button"
                        >
                          Guardar
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="cancel-button"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="openai-id-content">
                      <span 
                        className="openai-id-value"
                        onClick={() => handleSelectOpenAIID(openAIID.id)}
                      >
                        {openAIID.id}
                      </span>
                      <button 
                        onClick={() => handleStartEdit(key, openAIID.id)}
                        className="edit-button"
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
        <div className="create-openai-id">
          <input
            type="text"
            value={newOpenAIID}
            onChange={(e) => setNewOpenAIID(e.target.value)}
            placeholder="Ingrese un nuevo OpenAI ID"
            className="create-input"
          />
          <button 
            onClick={handleCreateOpenAIID}
            className="create-button"
            disabled={!newOpenAIID.trim()}
          >
            Crear
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OpenAIIDSelector;