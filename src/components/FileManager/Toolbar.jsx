import React from 'react';
import { Home, FolderPlus, RefreshCw } from 'lucide-react';
import './styles/Toolbar.css';

const Toolbar = ({ currentDirectory, onCreateDirectory, onGoToRoot }) => {
  return (
    <div className="file-manager-toolbar">
      <div className="file-manager-actions">
        <button 
          className="file-manager-action-button"
          onClick={() => onGoToRoot && onGoToRoot()}
          title="Volver a raíz"
        >
          <Home size={18} />
        </button>
        
        <button 
          className="file-manager-action-button"
          onClick={() => onCreateDirectory && onCreateDirectory(currentDirectory?.id || null)}
          title="Nuevo directorio"
        >
          <FolderPlus size={18} />
        </button>
        
        <button 
          className="file-manager-action-button"
          onClick={() => onGoToRoot && onGoToRoot()} // También refresca la vista
          title="Actualizar"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      
      {currentDirectory && (
        <div className="file-manager-breadcrumb">
          <span>Ubicación actual: </span>
          <span className="folder-name">{currentDirectory.name}</span>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
