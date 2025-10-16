import React from 'react';
import { Plus, Edit2 } from 'lucide-react';

const WorkspaceSelector = ({ 
  workspace, 
  onAddClick, 
  label,
  description 
}) => {
  return (
    <div className="workspace-selector">
      <div className="workspace-selector-header">
        <h4>{label}</h4>
      </div>
      <div className="workspace-selector-content">
        {workspace ? (
          <div className="workspace-display">
            <span className="workspace-name">{workspace.name}</span>
            <button 
              className="workspace-action-button"
              onClick={onAddClick}
              title="Cambiar workspace"
            >
              <Edit2 size={16} />
            </button>
          </div>
        ) : (
          <div className="workspace-empty">
            <span className="workspace-placeholder">Sin workspace asignado</span>
            <button 
              className="workspace-action-button"
              onClick={onAddClick}
              title="Agregar workspace"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
      {description && (
        <div className="workspace-description">
          <small>{description}</small>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;