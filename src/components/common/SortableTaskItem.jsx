import React, { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { Avatar } from "antd";

const pastelColors = [
  "#fed7e2",
  "#e9d5ff",
  "#bee3f8",
  "#c6f6d5",
  "#fef9c3",
  "#fed7aa",
  "#fecaca",
  "#e0e7ff",
];

export const SortableTaskItem = ({
  item,
  isExpanded,
  onUpdate,
  onSelect,
  isSelected,
  isDraft,
  onOpenChat,
  subtitle, // Nuevo prop para el componente opcional
}) => {
  const [isEditing, setIsEditing] = useState(isDraft);
  const [editValue, setEditValue] = useState(item.text);
  const inputRef = useRef(null);

  // Generar color aleatorio una sola vez
  const randomColor = useRef(
    pastelColors[Math.floor(Math.random() * pastelColors.length)]
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    // En modo compacto, sólo seleccionamos y no editamos
    if (!isExpanded) {
      onSelect?.(item.id);
      return;
    }
    // En modo expandido, permitir selección y posterior edición
    onSelect?.(item.id);
    if (isSelected) {
      setIsEditing(true);
    }
  };

  const handleSubmit = async () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== item.text) {
      const success = await onUpdate?.(item.id, trimmedValue);
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
      setEditValue(item.text);
    }
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(item.text);
    }
  };

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item ${isSelected ? "selected" : ""} ${
        isDraft ? "draft" : ""
      }`}
    >
      <div className="task-drag-handle" {...attributes} {...listeners}>
        <div className="drag-icon">⋮⋮</div>
      </div>

      <div className="task-item-content" onClick={handleClick}>
        <Avatar
          size="small"
          style={{
            backgroundColor: randomColor.current,
            border: "none",
          }}
        >
          {(item.text || "??").substring(0, 2).toUpperCase()}
        </Avatar>

        {isExpanded && (
          <div className="task-item-right">
            <div className="task-item-main">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSubmit}
                  className="task-item-input"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="task-item-text" onClick={handleClick}>
                    {item.text}
                  </span>
                  {subtitle && !isEditing && (
                    <div className="task-item-subtitle">{subtitle}</div>
                  )}
                </>
              )}
              {item.metadata && (
                <div className="task-item-metadata">{item.metadata}</div>
              )}
            </div>
            <button
              className="task-item-chat"
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat?.(item.id);
              }}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
