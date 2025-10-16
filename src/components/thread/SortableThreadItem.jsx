import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageCircle, ChevronRight } from 'lucide-react';

export function SortableThreadItem({ 
  thread, 
  onUpdate, 
  onSave, 
  onCancel, 
  onChange,
  error, 
  isEditing: defaultEditing = false, 
  isDraft = false,
  onSelect,
  isSelected = false,
  navigateToWorkspace
}) {
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [editValue, setEditValue] = useState(thread.name || '');
  const [localName, setLocalName] = useState(thread.name || '');

  useEffect(() => {
    setLocalName(thread.name || '');
    setEditValue(thread.name || '');
  }, [thread.name]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: thread.id,
    disabled: isDraft || isEditing 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const handleBlur = async (forceSave = false) => {
    if (isDraft && !forceSave) return;
    
    if (editValue.trim() !== thread.name) {
      try {
        await onUpdate(editValue.trim());
        setLocalName(editValue.trim());
        setIsEditing(false);
      } catch (error) {
        setEditValue(thread.name);
      }
    } else if (!isDraft) {
      setIsEditing(false);
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isDraft) {
        const success = await onSave(editValue);
        if (success) {
          setLocalName(editValue);
        }
      } else {
        handleBlur(true);
      }
    } else if (e.key === 'Escape') {
      if (isDraft) {
        onCancel();
      } else {
        setEditValue(localName);
        setIsEditing(false);
      }
    }
  };

  /*const handleClickContent = (e) => {
    // Si el clic viene del botón de navegación o está en modo edición, no hacemos nada
    if (e.target.closest('.thread-navigate') || isEditing || isDraft) {
      return;
    }
    setIsEditing(true);
  };*/

  const handleClickContent = (e) => {
    // Si está en modo edición o es borrador, no hacemos nada
    if (isEditing || isDraft) {
      return;
    }
    onSelect?.(thread.id); // Llamar directamente a onSelect con el id del thread
  };

  
  const handleMessageClick = (e) => {
    e.stopPropagation();
    onSelect?.(task.id);
  };


  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`thread-item 
        ${isDragging ? 'dragging' : ''} 
        ${isDraft ? 'draft' : ''}
        ${isSelected ? 'selected' : ''} 
        ${error ? 'error' : ''}
      `}
    >
      {!isDraft && (
        <button 
          className="thread-drag-handle"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
      )}
      
      {(isEditing || isDraft) ? (
        <div className="thread-input-wrapper">
          <input
            type="text"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              if (isDraft && onChange) {
                onChange(e.target.value);
              }
            }}
            onBlur={(e) => !isDraft && handleBlur()}
            onKeyDown={handleKeyDown}
            className={`thread-input ${error ? 'error' : ''}`}
            placeholder="Nombre de la conversación..."
            autoFocus
          />
          {isDraft && (
            <div className="thread-draft-actions">
              <button 
                onClick={onCancel}
                className="thread-action-button cancel"
                type="button"
              >
                ✕
              </button>
              <button 
                onClick={() => onSave(editValue)}
                className="thread-action-button save"
                type="button"
                disabled={!editValue.trim()}
              >
                ✓
              </button>
            </div>
          )}
          {error && (
            <div className="thread-error">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div 
          className="thread-content"
          onClick={handleClickContent}
        >
          <div className="thread-info">
            <div className="thread-header">
              <h4>{localName}</h4>
              {thread.worker && (
                <span className="thread-worker">
                  {thread.worker.name}
                </span>
              )}
            </div>
            <div className="thread-metadata">
              <span className="thread-messages">
                <MessageCircle size={14} />
                {thread.messageCount || 0} mensajes
              </span>
            </div>
          </div>

          <button 
            className="thread-navigate"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(thread.id);
            }}
            type="button"
            title="Ver mensajes"
          >
            <MessageCircle size={16} />
            <span className="thread-count">
              {thread.messageCount || 0}
            </span>
          </button>
          
        </div>
      )}
    </div>
  );
}