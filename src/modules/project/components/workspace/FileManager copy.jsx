import React, { useCallback, useEffect, useRef } from 'react';
import { useFileManager } from '../../hooks/useFileManager';
import DirectoryTree from '@components/FileManager/DirectoryTree';
import Toolbar from '@components/FileManager/Toolbar';
import './styles/FileManager.css';

const FileManager = ({ workspaceId, projectId }) => {
  // La desestructuración del hook debe hacerse completa antes de cualquier return
  const {
    directoryTree,
    currentDirectory,
    loading,
    error,
    toggleDirectory,
    expandedNodes,
    selectedNodes,
    onSelect,
    onMultiSelect,
    createDirectory,
    deleteDirectory,
    renameDirectory,
    restoreDirectory,
    isCreatingDirectory,
    handleCreateDirectory,
    handleCreateSubmit,
    loadDirectoryContents,
    setCurrentDirectory,
    setSelectedNodes
  } = useFileManager(workspaceId, projectId);

  // Hoisting - Definir todos los hooks antes de retornos condicionales
  const handleOutsideClickRef = useRef(null);

  // useEffect para setup de event listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.directory-tree') && !e.target.closest('.file-manager-toolbar')) {
        onSelect(null);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onSelect]);

  // useEffect para cargar directorios
  useEffect(() => {
    if (workspaceId && projectId) {
      loadDirectoryContents(null);
    }
  }, [workspaceId, projectId, loadDirectoryContents]);

  // Definimos la función goToRoot DESPUÉS de todos los hooks
  const goToRoot = useCallback(() => {
    loadDirectoryContents(null);
    setCurrentDirectory(null);
    setSelectedNodes(new Set());
  }, [loadDirectoryContents, setCurrentDirectory, setSelectedNodes]);

  // Retornos condicionales - SOLO DESPUÉS de todos los hooks
  if (error) return <div>Error: {error.message}</div>;

  // Renderizado principal
  return (
    <div className="file-manager">
      <Toolbar 
        currentDirectory={currentDirectory}
        onCreateDirectory={handleCreateDirectory}
        onGoToRoot={goToRoot}
      />
      <div className="file-manager-content">
        <DirectoryTree
          tree={directoryTree}
          currentDirectory={currentDirectory}
          expandedNodes={expandedNodes}
          selectedNodes={selectedNodes}
          onExpand={toggleDirectory}
          onSelect={onSelect}
          onMultiSelect={onMultiSelect}
          onCreateDirectory={createDirectory}
          onDelete={deleteDirectory}
          onRename={renameDirectory}
          onRestore={restoreDirectory}
          creatingDirectory={isCreatingDirectory}
          onCreateSubmit={handleCreateSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default FileManager;
