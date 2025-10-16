import React, { useEffect } from 'react';
import { Button } from 'antd';
import { LeftCircleOutlined, RightCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import './CompactWidget.css';
import { useCompactState } from '../../hooks/useCompactState';

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

const CompactHeader = ({ title, onAdd, isExpanded, onToggle, icon: Icon = UnorderedListOutlined }) => {
  return (
    <div className="compact-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 30 }}>
      <Icon style={{ fontSize: 16, marginRight: 8 }} />
      {isExpanded && <h3 className="header-title" style={{marginBottom:0}}>{title}</h3>}
      {isExpanded && onAdd && (
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

const CompactWidget = ({
  id,               // Se requiere un id único para persistir el estado
  title,
  icon,
  onAdd,
  children,
  defaultExpanded = false,
  minWidth = "40px",
  maxWidth = "300px",
  onExpandedRef     // Nuevo prop para exponer la función de setIsExpanded
}) => {
  const [isExpanded, setIsExpanded] = useCompactState(id, defaultExpanded);

  useEffect(() => {
    if (onExpandedRef) {
      onExpandedRef(setIsExpanded);
    }
  }, []); // Se registra sólo al montar

  return (
    <div className="compact-widget-container">
      <div 
        className={`compact-widget ${isExpanded ? "expanded" : ""}`}
        style={{
          width: isExpanded ? maxWidth : minWidth
        }}
      >
        <CompactHeader
          title={title}
          icon={icon}
          //onAdd={handleAddItem}
          isExpanded={isExpanded}
          onToggle={() => {
            const newState = !isExpanded;
            setIsExpanded(newState);
            console.log(`Toggling ${id} to:`, newState);
          }}
        />
        {/* Encabezado 
        <CompactHeader
          title={title}
          icon={icon}
          onAdd={onAdd}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
        */}

        <div className="compact-widget-content">
          {isExpanded && children}
        </div>
      </div>
    </div>
  );
};

export default CompactWidget;
