import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { 
  GET_DIRECTORY_CONTENTS, 
  CREATE_DIRECTORY,
  DELETE_DIRECTORY,
  UPDATE_DIRECTORY,
  RESTORE_DIRECTORY
} from '../apollo/directory';

export const useFileManager = (workspaceId, projectId) => {
  // Estados
  const [directoryTree, setDirectoryTree] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [isCreatingDirectory, setIsCreatingDirectory] = useState(false);
  const [loadedPaths, setLoadedPaths] = useState(new Set());

  // Función helper para buscar un directorio por ID (recursiva)
  const findDirectoryById = useCallback((tree, id) => {
    // Comprobar si tree es válido antes de intentar iterarlo
    if (!tree || typeof tree !== 'object') {
      console.warn('findDirectoryById: tree no es un objeto válido', tree);
      return null;
    }
    
    // Si id es null o undefined, retornar null
    if (id == null) {
      return null;
    }

    // Buscar en el primer nivel
    for (const key in tree) {
      const node = tree[key];
      if (node.id === id) {
        return node;
      }
      
      // Búsqueda recursiva si hay hijos
      if (node.children) {
        const found = findDirectoryById(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }, []);

  // Función para actualizar el nombre de un nodo en el árbol
  const updateTreeNodeName = useCallback((tree, nodeId, newName) => {
    return tree.map(node => {
      if (node.id === nodeId) {
        return { ...node, name: newName };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateTreeNodeName(node.children, nodeId, newName)
        };
      }
      return node;
    });
  }, []);

  // MOVER AQUÍ: Función helper para actualizar un nodo en el árbol
  const updateTreeNode = useCallback((nodeId, children) => {
    console.log("Actualizando nodo:", nodeId, "con hijos:", children);
    
    setDirectoryTree(prevTree => {
      // Implementación de la función para actualizar el nodo en el árbol
      const updateNode = (tree) => {
        if (!tree) return {};
        
        return Object.fromEntries(
          Object.entries(tree).map(([key, node]) => {
            if (node.id === nodeId) {
              // Encontrado el nodo a actualizar
              return [key, { ...node, children }];
            } else if (node.children) {
              // Buscar en los hijos
              return [key, { ...node, children: updateNode(node.children) }];
            } else {
              // No es el nodo buscado y no tiene hijos
              return [key, node];
            }
          })
        );
      };
      
      return updateNode(prevTree);
    });
  }, []);

  // Mutations y queries
  const { loading, error, refetch } = useQuery(GET_DIRECTORY_CONTENTS, {
    variables: { workspaceId, parentId: null },
    skip: !workspaceId,
    fetchPolicy: 'network-only', // Asegura que siempre se haga una petición nueva
    onCompleted: (data) => {
      console.log("Query inicial completada:", data);
      if (data?.directoryContents?.directories) {
        setDirectoryTree(data.directoryContents.directories);
        setLoadedPaths(new Set(['root']));
      }
    }
  });

  const [createDir] = useMutation(CREATE_DIRECTORY);
  const [deleteDir] = useMutation(DELETE_DIRECTORY);
  const [updateDir] = useMutation(UPDATE_DIRECTORY);
  const [restoreDir] = useMutation(RESTORE_DIRECTORY);

  // Asegúrate de que loadDirectoryContents esté haciendo la llamada correctamente
  const loadDirectoryContents = useCallback(async (parentId) => {
    console.log("loadDirectoryContents llamado con:", parentId);
    
    // Asegurar que parentId sea un string o null
    const idToUse = typeof parentId === 'object' && parentId !== null ? parentId.id : parentId;
    
    try {
      console.log("Haciendo petición a la API para:", idToUse);
      
      const { data } = await refetch({
        workspaceId,
        parentId: idToUse
      });
      
      console.log("Datos recibidos de la API:", data);

      if (data?.directoryContents?.directories) {
        // Actualizar el árbol de directorios
        if (!idToUse) {
          // Si es la raíz, actualizar todo el árbol
          setDirectoryTree(data.directoryContents.directories);
        } else {
          // Si es un subdirectorio, actualizar ese nodo específico
          updateTreeNode(idToUse, data.directoryContents.directories);
        }
        
        // Marcar como cargado
        setLoadedPaths(prev => new Set([...prev, idToUse || 'root']));
      }
    } catch (err) {
      console.error("Error al cargar contenido del directorio:", err);
    }
  }, [workspaceId, refetch, updateTreeNode]);

  // Asegúrate de que toggleDirectory esté implementado correctamente y llame a loadDirectoryContents
  const toggleDirectory = useCallback((directoryId) => {
    console.log("toggleDirectory llamado con:", directoryId);
    
    // Verificar si el directorio ya está expandido
    const isCurrentlyExpanded = expandedNodes.has(directoryId);
    
    if (isCurrentlyExpanded) {
      // Contraer el directorio
      console.log("Contrayendo directorio:", directoryId);
      setExpandedNodes(prevState => {
        const newState = new Set(prevState);
        newState.delete(directoryId);
        return newState;
      });
    } else {
      // Expandir el directorio
      console.log("Expandiendo directorio:", directoryId);
      
      // Actualizar el estado de expandedNodes
      setExpandedNodes(prevState => {
        const newState = new Set(prevState);
        newState.add(directoryId);
        return newState;
      });
      
      // Cargar el contenido si no ha sido cargado antes
      console.log("Verificando si el directorio ya está cargado:", directoryId);
      console.log("loadedPaths:", Array.from(loadedPaths));
      
      if (!loadedPaths.has(directoryId)) {
        console.log("Cargando contenido para:", directoryId);
        // Importante: Usar un setTimeout para asegurar que esta llamada no sea bloqueada
        // por la actualización de estado de React
        setTimeout(() => {
          loadDirectoryContents(directoryId);
        }, 0);
      }
    }
  }, [expandedNodes, loadedPaths, loadDirectoryContents]);

  // Función para seleccionar un nodo
  const handleSelectNode = useCallback((directoryId) => {
    // Si es el mismo directorio ya seleccionado, no hacer nada
    if (selectedNodes.size === 1 && selectedNodes.has(directoryId)) {
      return;
    }
    
    // Actualizar selección
    setSelectedNodes(new Set(directoryId ? [directoryId] : []));
    
    // Si se seleccionó un nuevo directorio, actualizar currentDirectory
    if (directoryId) {
      const selectedDir = findDirectoryById(directoryTree, directoryId);
      setCurrentDirectory(selectedDir);
    } else {
      setCurrentDirectory(null);
    }
  }, [selectedNodes, directoryTree, findDirectoryById]);

  // Función para selección múltiple - asegúrate de manejar casos nulos
  const handleMultiSelectNode = useCallback((selectedKeys) => {
    // Verificar que selectedKeys sea un array válido
    if (!Array.isArray(selectedKeys)) {
      console.warn('handleMultiSelectNode: selectedKeys no es un array', selectedKeys);
      selectedKeys = [];
    }
    
    // Actualizar estado de selección
    setSelectedNodes(new Set(selectedKeys));
    
    // Actualizar directorio actual si hay una selección
    if (selectedKeys.length === 1) {
      const selectedDir = findDirectoryById(directoryTree, selectedKeys[0]);
      setCurrentDirectory(selectedDir);
    } else if (selectedKeys.length === 0) {
      setCurrentDirectory(null);
    }
  }, [directoryTree, findDirectoryById]);
  
  // Función para crear un directorio
  const createDirectory = useCallback(async (name, parentDirectoryId = null) => {
    try {
      const { data } = await createDir({
        variables: {
          input: {
            name,
            workspaceId,
            projectId,
            parentDirectoryId
          }
        }
      });
      
      // Actualizar el árbol de directorios
      setDirectoryTree(prevTree => {
        // Crear una copia del árbol
        const newTree = {...prevTree};
        
        if (parentDirectoryId) {
          // Si hay un padre, actualizar los hijos del padre
          updateTreeNode(parentDirectoryId, (parentNode) => {
            if (!parentNode.children) parentNode.children = {};
            
            // Añadir el nuevo directorio a los hijos
            const newDir = transformDirectoryFromGraphQL(data.createDirectory);
            parentNode.children[newDir.id] = newDir;
            
            // Ordenar los hijos alfabéticamente
            parentNode.children = sortDirectoriesByName(parentNode.children);
            
            return parentNode;
          });
        } else {
          // Si no hay padre, añadir a la raíz
          const newDir = transformDirectoryFromGraphQL(data.createDirectory);
          newTree[newDir.id] = newDir;
          
          // Ordenar la raíz alfabéticamente
          const sortedRoot = sortDirectoriesByName(newTree);
          return sortedRoot;
        }
        
        return newTree;
      });
      
      // Actualizar la visualización
      return true;
    } catch (error) {
      console.error("Error creating directory:", error);
      return false;
    }
  }, [workspaceId, projectId, createDir, updateTreeNode]);

  // Función auxiliar para ordenar directorios por nombre
  const sortDirectoriesByName = (directories) => {
    if (!directories) return {};
    
    // Convertir el objeto a un array, ordenar y volver a convertir a objeto
    const entries = Object.entries(directories);
    entries.sort((a, b) => a[1].name.localeCompare(b[1].name));
    
    return Object.fromEntries(entries);
  };

  // Función para eliminar un directorio
  const handleDeleteDirectory = useCallback(async (directoryId, permanent = false) => {
    try {
      const { data } = await deleteDir({
        variables: {
          id: directoryId,
          permanent
        }
      });
      
      if (data?.deleteDirectory) {
        // Encontrar el directorio padre para recargar su contenido
        const dirToDelete = findDirectoryById(directoryTree, directoryId);
        const parentId = dirToDelete?.parentDirectory?.id || null;
        
        // Recargar directorios
        loadDirectoryContents(parentId);
        
        // Si el directorio actual fue eliminado, resetear la selección
        if (currentDirectory?.id === directoryId) {
          setCurrentDirectory(null);
          setSelectedNodes(new Set());
        }
      }
    } catch (error) {
      console.error("Error deleting directory:", error);
    }
  }, [deleteDir, directoryTree, currentDirectory, loadDirectoryContents]);
  
  // Función para renombrar un directorio
  const handleRenameDirectory = useCallback(async (directoryId, newName) => {
    if (!newName || !newName.trim()) return;
    
    try {
      const { data } = await updateDir({
        variables: {
          id: directoryId,
          input: {
            name: newName.trim()
          }
        }
      });
      
      if (data?.updateDirectory) {
        // Actualizar el directorio en el árbol
        setDirectoryTree(prevTree => updateTreeNodeName(prevTree, directoryId, newName));
        
        // Si es el directorio actual, actualizarlo también
        if (currentDirectory?.id === directoryId) {
          setCurrentDirectory(prev => ({
            ...prev,
            name: newName.trim()
          }));
        }
      }
    } catch (error) {
      console.error("Error renaming directory:", error);
    }
  }, [updateDir, currentDirectory]);
  
  // Función para restaurar un directorio
  const handleRestoreDirectory = useCallback(async (directoryId) => {
    try {
      const { data } = await restoreDir({
        variables: { id: directoryId }
      });
      
      if (data?.restoreDirectory) {
        // Recargar directorios
        loadDirectoryContents(null);
      }
    } catch (error) {
      console.error("Error restoring directory:", error);
    }
  }, [restoreDir, loadDirectoryContents]);

  // Actualizar la función updateNodeParent para mantener el estado actual
  const updateNodeParent = useCallback(async (directoryId, newParentId) => {
    try {
      console.log("Moviendo directorio:", directoryId, "al padre:", newParentId);
      
      // Buscar el directorio a mover para tener su información actual
      let directoryToMove = findDirectoryById(directoryTree, directoryId);
      if (!directoryToMove) {
        throw new Error("Directorio a mover no encontrado");
      }
      
      // Guardar el padre original antes de mover
      const originalParentId = directoryToMove.parentDirectory?.id || null;
      
      // Ejecutar mutación
      const response = await updateDir({
        variables: {
          id: directoryId,
          input: {
            parentDirectoryId: newParentId
          }
        }
      });
      
      // Verificar si hay errores en la respuesta
      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message || "Error al mover el directorio");
      }
      
      if (response.data?.updateDirectory) {
        console.log("Directorio movido exitosamente en la BD");
        
        // SOLUCIÓN MEJORADA QUE MANTIENE EL ESTADO ACTUAL:
        
        // 1. Guardar el estado expandido actual - importante hacerlo antes de cualquier cambio
        const currentExpandedNodes = new Set(expandedNodes);
        
        // 2. Actualizar solo los nodos afectados por el movimiento
        
        // 2.1 Actualizar el padre original (de donde se movió el directorio)
        if (originalParentId) {
          await loadDirectoryContents(originalParentId);
        } else {
          // Si estaba en la raíz, actualizar la raíz
          await loadDirectoryContents(null);
        }
        
        // 2.2 Actualizar el nuevo padre (a donde se movió el directorio)
        if (newParentId) {
          await loadDirectoryContents(newParentId);
          
          // Asegurarnos de que el nuevo padre esté expandido para ver el directorio movido
          currentExpandedNodes.add(newParentId);
        } else {
          // Si se movió a la raíz, actualizar la raíz
          await loadDirectoryContents(null);
        }
        
        // 3. Actualizar el directorio movido para mostrar sus subdirectorios
        await loadDirectoryContents(directoryId);
        
        // 4. Asegurarnos de que el directorio movido esté expandido si tenía subdirectorios
        currentExpandedNodes.add(directoryId);
        
        // 5. Aplicar el estado expandido actualizado
        setExpandedNodes(currentExpandedNodes);
        
        // 6. Seleccionar el directorio movido para que sea visible
        setSelectedNodes(new Set([directoryId]));
        
        return true;
      } else {
        throw new Error("La operación no retornó datos");
      }
    } catch (error) {
      console.error("Error al mover el directorio:", error);
      throw error;
    }
  }, [directoryTree, findDirectoryById, updateDir, loadDirectoryContents, expandedNodes, setExpandedNodes, setSelectedNodes]);
  
  // Usar useEffect para cargar directorios iniciales
  useEffect(() => {
    if (workspaceId) {
      loadDirectoryContents(null);
    }
  }, [workspaceId, loadDirectoryContents]);

  // Devolver todas las funciones y estados necesarios
  return {
    directoryTree,
    currentDirectory,
    loading,
    error,
    expandedNodes,
    selectedNodes,
    toggleDirectory,
    setExpandedNodes, // <-- asegúrate de exportar esto
    onSelect: handleSelectNode,
    onMultiSelect: handleMultiSelectNode,
    createDirectory,
    deleteDirectory: handleDeleteDirectory,
    renameDirectory: handleRenameDirectory,
    restoreDirectory: handleRestoreDirectory,
    isCreatingDirectory,
    handleCreateDirectory: () => setIsCreatingDirectory(true),
    handleCreateSubmit: (name, parentId) => {
      createDirectory(name, parentId);
      setIsCreatingDirectory(false);
    },
    loadDirectoryContents,
    setCurrentDirectory,
    setSelectedNodes,
    updateNodeParent
  };
};
