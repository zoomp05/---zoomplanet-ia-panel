import { useState, useEffect, useCallback, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_DIRECTORY_CONTENTS, CREATE_DIRECTORY } from '../../../apollo/directory';
import { useAsyncStorage } from './useAsyncStorage';

export const useFileManager = (workspaceId, projectId) => {
  // 1. Todos los useState primero
  const [directoryTree, setDirectoryTree] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [loadedPaths, setLoadedPaths] = useState(new Set());
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [isCreatingDirectory, setIsCreatingDirectory] = useState(false);

  // 2. useRef después de useState
  const initialized = useRef(false);

  // 3. Hooks personalizados
  const { 
    getStoredTree, 
    storeTree, 
    getLastOpenDirectory, 
    storeLastOpenDirectory,
    getLoadedPaths,
    storeLoadedPaths
  } = useAsyncStorage();

  // 4. Apollo hooks
  const [fetchDirectories] = useLazyQuery(GET_DIRECTORY_CONTENTS, {
    onCompleted: (data) => {
      if (data?.directoryContents?.directories) {
        const { directories } = data.directoryContents;
        setDirectoryTree(prevTree => {
          if (!currentDirectory) {
            const newTree = directories;
            storeTree(workspaceId, newTree);
            return newTree;
          }
          const newTree = updateTreeWithContents(prevTree, currentDirectory.id, directories);
          storeTree(workspaceId, newTree);
          return newTree;
        });
        setIsLoadingContents(false);
      }
    }
  });

  const [createDir] = useMutation(CREATE_DIRECTORY);

  // 5. Todos los useCallback juntos
  const updateTreeWithContents = useCallback((tree, parentId, newContents) => {
    if (!tree || !Array.isArray(tree)) return [];
    return tree.map(node => {
      if (node.id === parentId) {
        return {
          ...node,
          children: newContents.map(content => ({
            ...content,
            children: []
          }))
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateTreeWithContents(node.children, parentId, newContents)
        };
      }
      return node;
    });
  }, []);

  const loadDirectoryContents = useCallback(async (parentId = null) => {
    setIsLoadingContents(true);
    try {
      await fetchDirectories({ 
        variables: { workspaceId, parentId }
      });
    } catch (error) {
      console.error('Error loading directory contents:', error);
      setIsLoadingContents(false);
    }
  }, [fetchDirectories, workspaceId]);

  const onSelect = useCallback((directory) => {
    if (!directory) {
      setSelectedNodes(new Set());
      setCurrentDirectory(null);
    } else {
      setSelectedNodes(new Set([directory.id]));
      setCurrentDirectory(directory);
    }
  }, []);

  const onMultiSelect = useCallback((directory) => {
    setSelectedNodes(prev => {
      const next = new Set(prev);
      if (next.has(directory.id)) {
        next.delete(directory.id);
      } else {
        next.add(directory.id);
      }
      return next;
    });
  }, []);

  const updateDirectoryTree = useCallback(async (parentId = null) => {
    try {
      const { data } = await fetchDirectories({
        variables: { workspaceId, parentId }
      });

      if (data?.directoryContents?.directories) {
        setDirectoryTree(prevTree => {
          if (!parentId) {
            return data.directoryContents.directories;
          }

          // Función auxiliar para actualizar el nodo y sus hijos
          const updateNode = (nodes) => {
            return nodes.map(node => {
              if (node.id === parentId) {
                return {
                  ...node,
                  hasChildren: true,
                  children: data.directoryContents.directories.map(dir => ({
                    ...dir,
                    children: []
                  }))
                };
              }
              if (node.children && node.children.length > 0) {
                return {
                  ...node,
                  children: updateNode(node.children)
                };
              }
              return node;
            });
          };

          const newTree = updateNode(prevTree);
          storeTree(workspaceId, newTree);
          return newTree;
        });
      }
    } catch (error) {
      console.error('Error updating directory tree:', error);
    }
  }, [fetchDirectories, workspaceId, storeTree]);

  const createDirectory = useCallback(async (parentId, name) => {
    if (!name.trim()) return;

    try {
      const { data } = await createDir({
        variables: {
          input: {
            name: name.trim(),
            workspaceId,
            projectId,
            parentDirectoryId: parentId
          }
        }
      });

      if (data?.createDirectory) {
        // Marcar el directorio padre como expandido si existe
        if (parentId) {
          setExpandedNodes(prev => new Set([...prev, parentId]));
        }

        // Actualizar el árbol desde el nivel correcto
        await updateDirectoryTree(parentId);
        
        // Si el directorio padre está en loadedPaths, actualizarlo
        if (parentId) {
          setLoadedPaths(prev => new Set([...prev, parentId]));
        }
      }
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }, [createDir, workspaceId, projectId, updateDirectoryTree]);

  const toggleDirectory = useCallback(async (directory) => {
    if (!directory) return;
    
    if (expandedNodes.has(directory.id)) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        next.delete(directory.id);
        return next;
      });
      if (currentDirectory?.id === directory.id) {
        setCurrentDirectory(null);
      }
    } else if (directory.hasChildren) {
      setExpandedNodes(prev => new Set([...prev, directory.id]));
      setCurrentDirectory(directory);
      
      if (!loadedPaths.has(directory.id)) {
        await loadDirectoryContents(directory.id);
        setLoadedPaths(prev => new Set([...prev, directory.id]));
        await storeLoadedPaths(workspaceId, Array.from([...loadedPaths, directory.id]));
      }
      
      await storeLastOpenDirectory(workspaceId, directory);
    }
  }, [expandedNodes, currentDirectory, loadedPaths, workspaceId, loadDirectoryContents, storeLastOpenDirectory, storeLoadedPaths]);

  const handleCreateSubmit = useCallback((name) => {
    if (name) {
      createDirectory(currentDirectory?.id || null, name.trim());
    }
    setIsCreatingDirectory(false);
  }, [createDirectory, currentDirectory]);

  const handleCreateDirectory = useCallback(() => {
    setIsCreatingDirectory(true);
  }, []);

  // 6. useEffect al final
  useEffect(() => {
    const initializeFileManager = async () => {
      if (!workspaceId || initialized.current) return;
      try {
        const storedTree = await getStoredTree(workspaceId);
        if (storedTree?.length > 0) {
          setDirectoryTree(storedTree);
          const lastOpenDir = await getLastOpenDirectory(workspaceId);
          if (lastOpenDir) {
            setCurrentDirectory(lastOpenDir);
            setExpandedNodes(new Set([lastOpenDir.id]));
          }
        } else {
          await loadDirectoryContents(null);
        }
        initialized.current = true;
      } catch (error) {
        console.error('Error initializing file manager:', error);
      }
    };

    initializeFileManager();
  }, [workspaceId, getStoredTree, getLastOpenDirectory, loadDirectoryContents]);

  return {
    directoryTree,
    currentDirectory,
    loading: isLoadingContents,
    expandedNodes,
    selectedNodes,
    toggleDirectory,
    onSelect,
    onMultiSelect,
    createDirectory,
    isCreatingDirectory,
    handleCreateDirectory,
    handleCreateSubmit,
  };
};
