import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { PlusCircle, Trash2, Edit2 } from "lucide-react";
import { toast } from "react-hot-toast";

const GET_PROJECT_TYPES = gql`
  query GetProjectTypes {
    types(type_of: "PROJECT") {
      id
      types {
        key
        label
        description
        order
        is_active
        metadata
      }
    }
  }
`;

const CREATE_TYPE = gql`
  mutation CreateType($input: CreateTypeInput!) {
    createType(input: $input) {
      id
      type_of
      types {
        key
        label
        description
      }
    }
  }
`;

const UPDATE_TYPE = gql`
  mutation UpdateType($id: ID!, $input: UpdateTypeInput!) {
    updateType(id: $id, input: $input) {
      id
      types {
        key
        label
        description
      }
    }
  }
`;

// Añadir la mutación DELETE_TYPE
const DELETE_TYPE = gql`
  mutation DeleteType($id: ID!) {
    deleteType(id: $id)
  }
`;

const TypeSelector = ({ currentValue, onSelect, onClose }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [newType, setNewType] = useState({
    key: "",
    label: "",
    description: "",
  });

  const { data, loading, error, refetch } = useQuery(GET_PROJECT_TYPES);
  const [createType] = useMutation(CREATE_TYPE);
  const [updateType] = useMutation(UPDATE_TYPE);
  const [deleteType] = useMutation(DELETE_TYPE);

  const handleSelect = (type) => {
    onSelect(type.key);
    onClose();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creating type...");

    try {
      await createType({
        variables: {
          input: {
            type_of: "PROJECT",
            types: [
              {
                ...newType,
                order: data?.types?.types?.length || 0,
                is_active: true,
              },
            ],
          },
        },
      });

      toast.success("Type created successfully", {
        id: loadingToast,
      });

      setNewType({ key: "", label: "", description: "" });
      setIsCreating(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Error creating type", {
        id: loadingToast,
      });
      console.error("Error creating type:", err);
    }
  };

  const handleDelete = async (typeKey) => {
    const loadingToast = toast.loading("Deleting type...");
    try {
      if (data?.types?.types.length <= 1) {
        toast.error("Cannot delete the last project type", {
          id: loadingToast,
        });
        return;
      }

      const updatedTypes = data.types.types.filter((t) => t.key !== typeKey);
      await updateType({
        variables: {
          id: data.types.id,
          input: {
            types: updatedTypes.map((t) => ({
              key: t.key,
              label: t.label,
              description: t.description,
              order: t.order,
              is_active: t.is_active,
              metadata: t.metadata || {},
            })),
          },
        },
      });

      toast.success("Type deleted successfully", { id: loadingToast });
      refetch();
    } catch (err) {
      toast.error(err.message || "Error deleting type", { id: loadingToast });
      console.error("Error deleting type:", err);
    }
  };

  /*const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating type...');
    
    try {
      await updateType({
        variables: {
          id: data.types.id,
          input: {
            types: data.types.types.map(t => 
              t.key === editingType.key ? editingType : t
            )
          }
        }
      });
      
      toast.success('Type updated successfully', {
        id: loadingToast
      });
      
      setEditingType(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Error updating type', {
        id: loadingToast
      });
      console.error('Error updating type:', err);
    }
  };*/

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Remover __typename y otros campos no permitidos
      const cleanedType = {
        key: editingType.key,
        label: editingType.label,
        description: editingType.description,
        order: editingType.order,
        is_active: editingType.is_active,
        metadata: editingType.metadata || {},
      };

      const updatedTypes = data.types.types.map((t) =>
        t.key === editingType.key
          ? cleanedType
          : {
              key: t.key,
              label: t.label,
              description: t.description,
              order: t.order,
              is_active: t.is_active,
              metadata: t.metadata || {},
            }
      );

      await updateType({
        variables: {
          id: data.types.id,
          input: {
            types: updatedTypes,
          },
        },
      });

      setEditingType(null);
      refetch();
    } catch (err) {
      console.error("Error updating type:", err);
      toast.error(err.message || "Error updating type");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  const types = data?.types?.types || [];

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Project Types</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <PlusCircle size={16} />
          New Type
        </button>
      </div>

      {isCreating && (
        <div className="p-4 border-b">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Key</label>
              <input
                type="text"
                value={newType.key}
                onChange={(e) =>
                  setNewType((prev) => ({
                    ...prev,
                    key: e.target.value.toUpperCase(),
                  }))
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={newType.label}
                onChange={(e) =>
                  setNewType((prev) => ({ ...prev, label: e.target.value }))
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={newType.description}
                onChange={(e) =>
                  setNewType((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-blue-500 text-white rounded"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {types.map((type) => (
          <div
            key={type.key}
            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
              currentValue === type.key ? "bg-blue-50" : ""
            }`}
          >
            {editingType?.key === type.key ? (
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={editingType.label}
                    onChange={(e) =>
                      setEditingType((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingType.description}
                    onChange={(e) =>
                      setEditingType((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingType(null)}
                    className="px-3 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-500 text-white rounded"
                  >
                    Update
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1" onClick={() => handleSelect(type)}>
                  <h3 className="font-medium">{type.label}</h3>
                  <p className="text-sm text-gray-500">{type.description}</p>
                  <span className="text-xs text-gray-400">{type.key}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingType(type);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "Are you sure you want to delete this type?"
                        )
                      ) {
                        handleDelete(type.key);
                      }
                    }}
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>

                  
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypeSelector;
