import React, { useState } from 'react';
import { FolderIcon, ChevronRight, ChevronDown, Trash2, Edit, RotateCcw, Loader } from 'lucide-react';
import { Dropdown, Input } from 'antd';
import './styles/DirectoryTree.css'; // Asegúrate de importar los estilos

const DirectoryTree = ({ 
  tree = [], 
  currentDirectory, 
  expandedNodes = new Set(),
  selectedNodes = new Set(),
  onExpand, 
  onDelete, 
  onRename, 
  onRestore,
  onSelect,
  onMultiSelect,
  onCreateDirectory,
  creatingDirectory = false,
  onCreateSubmit,
  isLoading = false
}) => {
  const renderNewDirectoryInput = (level = 0) => (
    <div className="new-directory-input" style={{ paddingLeft: `${level * 20}px` }}>
      <span className="directory-icon-container">
        <span className="drill-icon-space">
          <span style={{ width: '16px', display: 'inline-block' }} />
        </span>
        
        <FolderIcon size={16} />

      </span>
      <Input
        autoFocus
        placeholder="New Folder"
        size="small"
        onPressEnter={(e) => onCreateSubmit(e.target.value)}
        onBlur={() => onCreateSubmit(null)}
      />
    </div>
  );

  const renderDirectory = (directory, level = 0) => {
    const isExpanded = expandedNodes?.has?.(directory.id) || false;
    const isSelected = selectedNodes?.has?.(directory.id) || false;
    const isTrash = directory.path === 'trash' || directory.path.startsWith('trash/');

    const menuItems = {
      items: isTrash ? [
        {
          label: 'Restore',
          key: 'restore',
          icon: <RotateCcw size={16} />,
          onClick: () => onRestore(directory)
        },
        {
          label: 'Delete Permanently',
          key: 'delete',
          icon: <Trash2 size={16} />,
          danger: true,
          onClick: () => onDelete(directory, true)
        }
      ] : [
        {
          label: 'Rename',
          key: 'rename',
          icon: <Edit size={16} />,
          onClick: () => onRename(directory)
        },
        {
          label: 'Delete',
          key: 'delete',
          icon: <Trash2 size={16} />,
          danger: true,
          onClick: () => onDelete(directory)
        }
      ]
    };

    const handleClick = (e) => {
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey) {
        onMultiSelect?.(directory);
      } else {
        onSelect?.(directory);
      }
    };

    const handleExpandClick = (e) => {
      e.stopPropagation();
      onExpand(directory);
    };

    return (
      <div key={directory.id} className="directory-item">
        <Dropdown menu={menuItems} trigger={['contextMenu']}>
          <div 
            className={`directory-row ${isSelected ? 'selected' : ''}`}
            onClick={handleClick}
          >
            <div className="directory-header" style={{ paddingLeft: `${level * 20}px` }}>
              <div className="directory-icon-container">
                <span className="drill-icon-space" onClick={handleExpandClick}>
                  {directory.hasChildren ? (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  ) : <span style={{ width: '16px', display: 'inline-block' }} />}
                </span>
                <span className="folder-icon">
                  {directory.path === 'trash' ? <Trash2 size={16} /> : <FolderIcon size={16} />}
                </span>
              </div>
              <span className="directory-name">
                {directory.name}
              </span>
            </div>
          </div>
        </Dropdown>

        {isSelected && creatingDirectory && renderNewDirectoryInput(level + 1)}

        {isExpanded && directory.children && directory.children.length > 0 && (
          <div className="directory-children">
            {directory.children.map(child => renderDirectory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="directory-tree-container">
      {/* Preloader flotante */}
      {isLoading && (
        <div className="directory-loading-overlay">
          <div className="directory-loading-content">
            <Loader size={24} className="directory-loading-spinner" />
            <span>Cargando directorios...</span>
          </div>
        </div>
      )}
      
      {/* Contenedor principal del árbol */}
      <div className="directory-tree">
        {!currentDirectory && creatingDirectory && renderNewDirectoryInput(0)}
        {tree.length === 0 && !isLoading && (
          <div className="directory-empty">
            No hay directorios disponibles. Crea uno nuevo.
          </div>
        )}
        {Array.isArray(tree) ? tree.map(directory => renderDirectory(directory)) : null}
      </div>
    </div>
  );
};

export default DirectoryTree;
