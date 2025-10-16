import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageCircle } from 'lucide-react';

export function SortableTaskItem({ 
  task, 
  onUpdate, 
  onSave, 
  onCancel, 
  onChange, 
  error, 
  isEditing: defaultEditing = false, 
  isDraft = false,
  onSelect,
  isSelected = false
}) {
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [editValue, setEditValue] = useState(task.description || '');
  const [localDescription, setLocalDescription] = useState(task.description || '');

  useEffect(() => {
    setLocalDescription(task.description || '');
    setEditValue(task.description || '');
  }, [task.description]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    disabled: isDraft || isEditing 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const handleBlur = async (forceSave = false) => {
    if (isDraft && !forceSave) return;
    
    if (editValue.trim() !== task.description) {
      try {
        await onUpdate(editValue.trim());
        setLocalDescription(editValue.trim());
        setIsEditing(false);
      } catch (error) {
        setEditValue(task.description);
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
          setLocalDescription(editValue);
        }
      } else {
        handleBlur(true);
      }
    } else if (e.key === 'Escape') {
      if (isDraft) {
        onCancel();
      } else {
        setEditValue(localDescription);
        setIsEditing(false);
      }
    }
  };

  const handleCardClick = (e) => {
    // Ignore clicks on the thread button or if editing/draft
    if (e.target.closest('.task-thread-button') || isEditing || isDraft) {
      return;
    }
    // If not selected, select it
    if (!isSelected) {
      onSelect?.(task.id);
    } else {
      // If already selected and the user clicked on the title, edit
      if (e.target.classList.contains('task-content')) {
        setIsEditing(true);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item ${isDragging ? 'dragging' : ''} 
                 ${isDraft ? 'draft' : ''} 
                 ${error ? 'error' : ''} 
                 ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
    >
      {!isDraft && (
        <button 
          className="task-drag-handle"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
      )}
      
      {(isEditing || isDraft) ? (
        <div className="task-input-wrapper">
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
            className={`task-input ${error ? 'error' : ''}`}
            placeholder="Enter task description..."
            autoFocus
          />
          {isDraft && (
            <div className="task-draft-actions">
              <button 
                onClick={onCancel}
                className="task-action-button cancel"
                type="button"
              >
                ✕
              </button>
              <button 
                onClick={() => onSave(editValue)}
                className="task-action-button save"
                type="button"
                disabled={!editValue.trim()}
              >
                ✓
              </button>
            </div>
          )}
          {error && (
            <div className="task-error">
              {error}
            </div>
          )}
        </div>
      ) : (
        <>
          <div 
            className="task-content"
            data-full-text={localDescription}
          >
            {localDescription}
          </div>

          <button 
            className="task-thread-button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(task.id);
            }}
            title="Ver conversaciones"
            type="button"
          >
            <MessageCircle size={16} />
            <span className="thread-count">
              {task.threads?.length || 0}
            </span>
          </button>
        </>
      )}
    </div>
  );
}