import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { LeftCircleOutlined, RightCircleOutlined, UnorderedListOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableTaskItem } from "./SortableTaskItem";
import { Button } from 'antd';
import Subtitle from '../Subtitle/Subtitle';
import { useCompactState } from '../../hooks/useCompactState';
import { use } from "react";

const pastelColors = [
  "bg-pink-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-orange-200",
  "bg-red-200",
  "bg-indigo-200",
];

const ToggleButton = ({ isExpanded, onClick, style }) => (
  <Button
    type="text"
    onClick={onClick}
    style={style}
    className="shadow-lg"
    icon={
      isExpanded
        ? <LeftCircleOutlined style={{ fontSize: 18 }} />
        : <RightCircleOutlined style={{ fontSize: 18 }} />
    }
  />
);

const CompactHeader = ({ title, onAdd, isExpanded, onToggle }) => {
  return (
    <div className="compact-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 30 }}>
      <UnorderedListOutlined style={{ fontSize: 16, marginRight: 8 }} />
      {isExpanded && <h3 className="header-title" style={{marginBottom:0}}>{title}</h3>}
      {isExpanded && (
        <button 
        className="button-plus"
        onClick={onAdd}
        aria-label={title}
        style={{ marginLeft: 8 }}
      >
        +
      </button>
      )}
      <ToggleButton
        isExpanded={isExpanded}
        onClick={onToggle}
        style={{ position: 'absolute', right: -20, top: 8 }}
      />
    </div>
  );
};
/*
const SortableItem = ({ 
  item, 
  isExpanded, 
  onUpdate, 
  onSelect, 
  isSelected, 
  isEditing, 
  onEditStart,
  onOpenChat 
}) => {
  // ...existing code...

  return (
    <div >
      <div className="task-item-content" {...(isEditing ? {} : listeners)}>
        
        
        {isExpanded && (
          <div className="task-item-right">
            {isEditing ? (
              <input / />
            ) : (
              <>
                <div className="task-item-main">
                  <span className="task-item-text">
                    {item.text}
                  </span>
                  
                  {item.metadata && (
                    <div className="task-item-metadata">
                      {item.metadata}
                    </div>
                  )}
                </div>
                
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
*/
const CompactItemList  = ({
  id, // Clave única para guardar el estado
  items: initialItems = [],
  onItemUpdate,
  onItemSelect,
  selectedItemId,
  title,
  onAddItem,
  onOpenChat,
  defaultExpanded = true,
  onExpandedRef, // Nuevo prop para pasar la función setIsExpanded
}) => {
  // Inicializar estado con useCompactState
  const [isExpanded, setIsExpanded] = useCompactState(id, defaultExpanded);

  // Solo registrar la referencia una vez al montar
  useEffect(() => {
    if (onExpandedRef) {
      onExpandedRef(setIsExpanded);
    }
  }, []);  // [] en lugar de [onExpandedRef] para evitar re-registros

  const [items, setItems] = useState(initialItems);
  const [isDraftItem, setIsDraftItem] = useState(false);

  // Actualizar items cuando cambien
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    console.log("isExpanded ", isExpanded, id);
  }, [isExpanded]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddItem = () => {
    if (isDraftItem) return;

    const draftItem = {
      id: `draft-${Date.now()}`,
      type: "abrev",
      text: "",
      isDraft: true,
    };

    setItems((prev) => [draftItem, ...prev]);
    setIsDraftItem(true);
  };

  const handleEditComplete = async (itemId, newText) => {
    if (itemId.toString().startsWith("draft-")) {
      if (await onAddItem?.(newText)) {
        setIsDraftItem(false);
      }
    } else {
      await onItemUpdate?.(itemId, newText);
    }
  };

  return (
    <div className="compact-list-container">
      <div className={`compact-list ${isExpanded ? "expanded" : ""}`}>
        <CompactHeader
          title={title}
          onAdd={handleAddItem}
          isExpanded={isExpanded}
          onToggle={() => {
            const newState = !isExpanded;
            setIsExpanded(newState);
            console.log(`Toggling ${id} to:`, newState);
          }}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableTaskItem
                key={item.id}
                item={item}
                isExpanded={isExpanded}
                onUpdate={handleEditComplete}
                onSelect={onItemSelect}
                isSelected={selectedItemId === item.id}
                isDraft={item.isDraft}
                onOpenChat={onOpenChat}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default CompactItemList ;
