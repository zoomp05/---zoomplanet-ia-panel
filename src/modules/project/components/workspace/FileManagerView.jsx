import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
//import { GET_DIRECTORIES, CREATE_DIRECTORY, UPDATE_DIRECTORY, DELETE_DIRECTORY, RESTORE_DIRECTORY } from '../apollo/directory';
import { GET_DIRECTORY_CONTENTS, CREATE_DIRECTORY, UPDATE_DIRECTORY, DELETE_DIRECTORY, RESTORE_DIRECTORY } from '../apollo/directory';
import { FolderIcon, ChevronRight, ChevronDown, Trash2, Edit, Plus, RotateCcw } from 'lucide-react';
import { Modal, message, Menu, Dropdown, Input, Button, Space, Tooltip } from 'antd';
import './FileManagerView.css';

const ContextMenu = ({ onRename, onDelete }) => (
  <Menu items={[
    {
      key: 'rename',
      icon: <Edit size={16} />,
      label: 'Rename',
      onClick: onRename
    },
    {
      key: 'delete',
      icon: <Trash2 size={16} />,
      label: 'Delete',
      className: 'text-red-500',
      onClick: onDelete
    }
  ]} />
);

const DirectoryItem = ({ 
  directory, 
  level = 0, 
  onAddDir, 
  onDeleteDir, 
  onRenameDir, 
  onRestoreDir,
  selectedDirectoryId, 
  setSelectedDirectoryId, 
  expandedDirectories, 
  setExpandedDirectories,
  isCreatingNewTop,
  setIsCreatingNewTop,
  topLevelNewDirName,
  setTopLevelNewDirName
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newDirName, setNewDirName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(directory.name);
  const renameInputRef = useRef(null);

  const isExpanded = expandedDirectories.includes(directory.id);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isExpanded) {
      setExpandedDirectories(prev => prev.filter(id => id !== directory.id));
    } else {
      setExpandedDirectories(prev => [...prev, directory.id]);
    }
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    setIsCreatingNew(true);
  };

  const handleCreateDir = async (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      const nameToUse = isCreatingNewTop ? topLevelNewDirName : newDirName;
      if (nameToUse.trim()) {
        const newDir = await onAddDir(directory.id, nameToUse.trim());
        if (newDir) {
          // Siempre expandir el directorio padre al crear un nuevo subdirectorio
          setExpandedDirectories(prev => [...prev, directory.id]);
        }
        setNewDirName('');
        if (isCreatingNewTop) {
          setTopLevelNewDirName('');
        }
      }
      setIsCreatingNew(false);
      setIsCreatingNewTop(false);
    }
  };

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleRenameClick = useCallback((e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setIsRenaming(true);
  }, []);

  const handleRename = async (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      if (renameValue.trim() && renameValue !== directory.name) {
        await onRenameDir(directory.id, renameValue.trim());
      }
      setIsRenaming(false);
    }
  };

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [isRenaming]);

  const isTrash = directory.path === 'trash' || directory.path.startsWith('trash/');

  const menuItems = {
    items: isTrash
      ? [
          {
            label: 'Restore',
            key: 'restore',
            icon: <RotateCcw size={16} />,
            onClick: () => onRestoreDir(directory)
          },
          {
            label: 'Delete Permanently',
            key: 'delete-permanent',
            icon: <Trash2 size={16} />,
            danger: true,
            onClick: () => setShowDeleteConfirm(true)
          }
        ]
      : [
          {
            label: 'Rename',
            key: 'rename',
            icon: <Edit size={16} />,
            onClick: (e) => handleRenameClick(e)
          },
          {
            label: 'Delete',
            key: 'delete',
            icon: <Trash2 size={16} />,
            danger: true,
            onClick: () => setShowDeleteConfirm(true)
          }
        ]
  };

  return (
    <div 
      className={`directory-item ${selectedDirectoryId === directory.id ? 'selected' : ''}`}
      onContextMenu={(e) => e.preventDefault()}  // Evita el menú nativo
    >
      <Dropdown trigger={['contextMenu']} menu={menuItems}>
        <div 
          className="directory-header" 
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => setSelectedDirectoryId(directory.id)}
        >
          <span className="directory-icon" onClick={handleToggle}>
            <span style={{ width: '16px', display: 'inline-block', textAlign: 'center' }}>
              {directory.children && directory.children.length > 0 ? (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : <span style={{ width: '16px', display: 'inline-block' }}></span>}
            </span>
            {directory.path === 'trash' ? <Trash2 size={16} /> : <FolderIcon size={16} />}
          </span>
          {isRenaming ? (
            <Input
              ref={renameInputRef}
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRename}
              onBlur={handleRename}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="directory-name">{directory.name}</span>
          )}
          {directory.path !== 'trash' && (
            <button className="add-button" onClick={handleAddClick}>
              <Plus size={16} />
            </button>
          )}
        </div>
      </Dropdown>

      <Modal
        title="Confirm Delete"
        open={showDeleteConfirm}
        onOk={() => {
          onDeleteDir(directory);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      >
        <p>Are you sure you want to move "{directory.name}" to trash?</p>
        <p>This will move the directory and all its contents to the trash folder.</p>
      </Modal>

      {(isCreatingNew || (isCreatingNewTop && selectedDirectoryId === directory.id)) && (
        <div className="new-directory-input" style={{ paddingLeft: `${(level + 1) * 30}px` }}>
          <span className="directory-icon">
            <span style={{ width: '16px', display: 'inline-block' }}></span>
            <FolderIcon size={16} />
          </span>
          <input
            autoFocus
            value={isCreatingNewTop ? topLevelNewDirName : newDirName}
            onChange={(e) => isCreatingNewTop ? setTopLevelNewDirName(e.target.value) : setNewDirName(e.target.value)}
            onKeyDown={handleCreateDir}
            onBlur={handleCreateDir}
            placeholder="New Folder"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {isExpanded && directory.children && directory.children.length > 0 && (
        <div className="directory-children">
          {directory.children.map(child => (
            <DirectoryItem 
              key={child.id} 
              directory={child} 
              level={level + 1}
              onAddDir={onAddDir}
              onDeleteDir={onDeleteDir}
              onRenameDir={onRenameDir}
              onRestoreDir={onRestoreDir}
              selectedDirectoryId={selectedDirectoryId}
              setSelectedDirectoryId={setSelectedDirectoryId}
              expandedDirectories={expandedDirectories}
              setExpandedDirectories={setExpandedDirectories}
              isCreatingNewTop={isCreatingNewTop}
              setIsCreatingNewTop={setIsCreatingNewTop}
              topLevelNewDirName={topLevelNewDirName}
              setTopLevelNewDirName={setTopLevelNewDirName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileManagerView = ({ workspaceId, projectId }) => {
  const { data, loading, error, refetch } = useQuery(GET_DIRECTORY_CONTENTS, {
    variables: { workspaceId }
  });

  const [createDirectory] = useMutation(CREATE_DIRECTORY);
  const [deleteDirectory] = useMutation(DELETE_DIRECTORY);
  const [restoreDirectory] = useMutation(RESTORE_DIRECTORY);
  const [updateDirectory] = useMutation(UPDATE_DIRECTORY);
  const [selectedDirectoryId, setSelectedDirectoryId] = useState(null);
  const [expandedDirectories, setExpandedDirectories] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newDirName, setNewDirName] = useState('');
  const [isCreatingNewTop, setIsCreatingNewTop] = useState(false);
  const [topLevelNewDirName, setTopLevelNewDirName] = useState('');
  const [directoryTree, setDirectoryTree] = useState([]);

  useEffect(() => {
    if (data && data.directories) {
      setDirectoryTree([...data.directories]);
    }
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.file-manager')) {
        setSelectedDirectoryId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateDirectory = async (parentId, name) => {
    try {
      const result = await createDirectory({
        variables: {
          input: {
            workspaceId,
            projectId,
            name,
            parentDirectoryId: parentId || null
          }
        }
      });

      if (result.data?.createDirectory) {
        const newDir = result.data.createDirectory;
        
        if (parentId) {
          setExpandedDirectories(prev => [...prev, parentId]);
          // Update tree with new directory
          setDirectoryTree(prevTree => {
            const updateTree = (nodes) => {
              return nodes.map(node => {
                if (node.id === parentId) {
                  return {
                    ...node,
                    children: [...(node.children || []), {
                      ...newDir,
                      children: []
                    }]
                  };
                }
                if (node.children && node.children.length > 0) {
                  return {
                    ...node,
                    children: updateTree(node.children)
                  };
                }
                return node;
              });
            };
            return updateTree(prevTree);
          });
        } else {
          // Add new directory to root level
          setDirectoryTree(prevTree => [...prevTree, { ...newDir, children: [] }]);
        }
        
        message.success('Directory created successfully');
        return newDir;
      }
    } catch (error) {
      console.error('Error creating directory:', error);
      message.error('Failed to create directory');
    }
  };

  const handleDeleteDirectory = async (directory) => {
    try {
      const isPermanent = directory.path.startsWith('trash/');
      const result = await deleteDirectory({
        variables: {
          id: directory.id,
          permanent: isPermanent
        }
      });

      if (result.data?.deleteDirectory) {
        message.success(isPermanent ? 'Directory permanently deleted' : 'Directory moved to trash');
        // Update the directory tree state directly
        setDirectoryTree(prevTree => {
          const removeNode = (nodes, id) => {
            return nodes.filter(node => node.id !== id).map(node => ({
              ...node,
              children: removeNode(node.children || [], id)
            }));
          };
          return removeNode(prevTree, directory.id);
        });
      }
    } catch (error) {
      console.error('Error deleting directory:', error);
      message.error('Failed to delete directory');
    }
  };

  const handleRestoreDirectory = async (directory) => {
    try {
      const result = await restoreDirectory({
        variables: {
          id: directory.id
        }
      });

      if (result.data?.restoreDirectory) {
        message.success('Directory restored successfully');
        refetch();
      }
    } catch (error) {
      console.error('Error restoring directory:', error);
      message.error('Failed to restore directory');
    }
  };

  const handleRenameDirectory = async (id, newName) => {
    try {
      const result = await updateDirectory({
        variables: {
          id,
          input: { name: newName }
        }
      });

      if (result.data?.updateDirectory) {
        const updatedDir = result.data.updateDirectory;
        // Update the directory tree state directly
        setDirectoryTree(prevTree => {
          const updateNode = (nodes) => {
            return nodes.map(node => {
              if (node.id === id) {
                return {
                  ...node,
                  name: updatedDir.name
                };
              }
              if (node.children) {
                return {
                  ...node,
                  children: updateNode(node.children)
                };
              }
              return node;
            });
          };
          return updateNode(prevTree);
        });
        message.success('Directory renamed successfully');
      }
    } catch (error) {
      console.error('Error renaming directory:', error);
      message.error('Failed to rename directory');
    }
  };

  const handleNewDirectoryClick = () => {
    // Mostrar el input para crear directorio donde corresponda
    setIsCreatingNewTop(true);
    setNewDirName('');
  };

  const handleCreateNewTop = async (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      if (newDirName.trim()) {
        // Usar el directorio seleccionado o crear en raíz
        await handleCreateDirectory(selectedDirectoryId, newDirName.trim());
        setNewDirName('');
      }
      setIsCreatingNewTop(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="file-manager">
      <div className="file-manager-toolbar" style={{ 
        padding: '8px', 
        borderBottom: '1px solid #e8e8e8',
        marginBottom: '8px'
      }}>
        <Space>
          <Tooltip title={selectedDirectoryId ? "Add to selected directory" : "Add root directory"}>
            <Button 
              type="primary" 
              icon={<Plus size={16} />}
              onClick={handleNewDirectoryClick}
            >
              New Directory
            </Button>
          </Tooltip>
        </Space>
      </div>

      {isCreatingNewTop && !selectedDirectoryId && (
        <div className="new-directory-input" style={{ padding: '0px 8px 8px 18px' }}>
          <span className="directory-icon">
            <span style={{ width: '16px', display: 'inline-block' }}></span>
            <FolderIcon size={16} />
          </span>
          <input
            autoFocus
            value={newDirName}
            onChange={(e) => setNewDirName(e.target.value)}
            onKeyDown={handleCreateNewTop}
            onBlur={handleCreateNewTop}
            placeholder="New Root Folder"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="file-manager-tree">
        {directoryTree.map(directory => (
          <DirectoryItem 
            key={directory.id} 
            directory={directory}
            onAddDir={handleCreateDirectory}
            onDeleteDir={handleDeleteDirectory}
            onRestoreDir={handleRestoreDirectory}
            onRenameDir={handleRenameDirectory}
            selectedDirectoryId={selectedDirectoryId}
            setSelectedDirectoryId={setSelectedDirectoryId}
            expandedDirectories={expandedDirectories}
            setExpandedDirectories={setExpandedDirectories}
            isCreatingNewTop={isCreatingNewTop}
            setIsCreatingNewTop={setIsCreatingNewTop}
            topLevelNewDirName={topLevelNewDirName}
            setTopLevelNewDirName={setTopLevelNewDirName}
          />
        ))}
      </div>
    </div>
  );
};

export default FileManagerView;
