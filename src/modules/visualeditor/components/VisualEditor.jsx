import React, { useState, useRef } from 'react';
import { Layout, Plus, Settings, GripHorizontal } from 'lucide-react';
//import { Card, CardContent } from '@/components/ui/card';
import { Card, Button } from 'antd';
//import { Button } from '@/components/ui/button';

const VerticalResizeHandler = ({ onResize }) => {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const startResize = (e) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    
    const section = e.currentTarget.parentElement;
    startHeight.current = section.getBoundingClientRect().height;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    
    const dy = e.clientY - startY.current;
    const newHeight = Math.max(200, startHeight.current + dy); // Mínimo 200px
    onResize(newHeight);
  };

  const stopResize = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stopResize);
  };

  return (
    <div
      className="absolute bottom-0 left-0 z-10 h-1 w-full cursor-row-resize bg-gray-300 hover:bg-blue-500"
      onMouseDown={startResize}
    />
  );
};

const HorizontalResizeHandler = ({ onResize, columnIndex }) => {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidths = useRef({ left: 0, right: 0 });
  const totalInitialWidth = useRef(0);

  const startResize = (e) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    
    const handler = e.currentTarget;
    const leftColumn = handler.parentElement;
    const rightColumn = leftColumn.nextElementSibling;
    const container = leftColumn.parentElement;
    
    totalInitialWidth.current = container.getBoundingClientRect().width - (parseInt(window.getComputedStyle(container).gap) * (container.children.length - 1));
    
    startWidths.current = {
      left: leftColumn.getBoundingClientRect().width,
      right: rightColumn.getBoundingClientRect().width
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - startX.current;
    const minWidth = 50;
    
    let newLeftWidth = Math.max(minWidth, startWidths.current.left + dx);
    let newRightWidth = Math.max(minWidth, startWidths.current.right - dx);
    
    const originalTotal = startWidths.current.left + startWidths.current.right;
    if (newLeftWidth + newRightWidth !== originalTotal) {
      const adjustment = originalTotal - (newLeftWidth + newRightWidth);
      newRightWidth += adjustment;
    }
    
    if (newLeftWidth >= minWidth && newRightWidth >= minWidth) {
      const leftPercent = (newLeftWidth / totalInitialWidth.current) * 100;
      const rightPercent = (newRightWidth / totalInitialWidth.current) * 100;
      onResize(columnIndex, leftPercent, rightPercent);
    }
  };

  const stopResize = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stopResize);
  };

  return (
    <div
      className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize bg-gray-300 hover:bg-blue-500"
      onMouseDown={startResize}
    />
  );
};

const AddColumnHandler = ({ onClick }) => {
  return (
    <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="h-8 w-8 rounded-full p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

const SectionTitle = ({ children }) => {
  return (
    <div className="absolute -left-2 -top-3 z-10 flex items-center gap-2 bg-white px-2 text-sm text-gray-500">
      <Layout className="h-4 w-4" />
      <span>{children}</span>
    </div>
  );
};

const VisualEditor = () => {
  const [sections, setSections] = useState([
    {
      id: '1',
      type: 'container',
      height: 200,
      children: [{
        id: 'col1',
        width: '50%',
        content: 'Columna 1'
      }, {
        id: 'col2',
        width: '50%',
        content: 'Columna 2'
      }]
    }
  ]);

  const handleResize = (sectionId, columnIndex, leftPercent, rightPercent) => {
    setSections(prev => 
      prev.map(section => {
        if (section.id === sectionId) {
          const newChildren = [...section.children];
          const leftPercentStr = `${leftPercent.toFixed(3)}%`;
          const rightPercentStr = `${rightPercent.toFixed(3)}%`;
          
          newChildren[columnIndex] = {
            ...newChildren[columnIndex],
            width: leftPercentStr
          };
          
          newChildren[columnIndex + 1] = {
            ...newChildren[columnIndex + 1],
            width: rightPercentStr
          };
          
          return { ...section, children: newChildren };
        }
        return section;
      })
    );
  };

  const handleVerticalResize = (sectionId, newHeight) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, height: newHeight }
          : section
      )
    );
  };

  const addColumn = (sectionId) => {
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          const lastColumnIndex = section.children.length - 1;
          const lastColumn = section.children[lastColumnIndex];
          
          const lastWidth = parseFloat(lastColumn.width);
          const newWidth = (lastWidth / 2).toFixed(3) + '%';
          
          const newChildren = [...section.children];
          newChildren[lastColumnIndex] = {
            ...lastColumn,
            width: newWidth
          };
          
          newChildren.push({
            id: `col${section.children.length + 1}`,
            width: newWidth,
            content: `Columna ${section.children.length + 1}`
          });
          
          return { ...section, children: newChildren };
        }
        return section;
      })
    );
  };

  const addSection = () => {
    const newSection = {
      id: `section-${sections.length + 1}`,
      type: 'container',
      height: 200,
      children: [{
        id: `col1-section-${sections.length + 1}`,
        width: '50%',
        content: 'Columna 1'
      }, {
        id: `col2-section-${sections.length + 1}`,
        width: '50%',
        content: 'Columna 2'
      }]
    };
    setSections([...sections, newSection]);
  };

  const renderColumn = (column, sectionId, columnIndex, isLast) => {
    return (
      <div
        key={column.id}
        className="relative flex h-full items-center justify-center rounded border-2 border-gray-300 bg-white"
        style={{ 
          width: column.width,
          minWidth: '50px'
        }}
      >
        {column.content}
        {!isLast && (
          <HorizontalResizeHandler
            columnIndex={columnIndex}
            onResize={(colIndex, leftPercent, rightPercent) => 
              handleResize(sectionId, colIndex, leftPercent, rightPercent)
            }
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editor Visual</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={addSection}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Sección
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border-2 border-dashed border-gray-300 bg-white p-4">
        {sections.map(section => (
          <Card 
            key={section.id} 
            className="group relative p-5" // Aumentamos el padding a 20px (p-5)
            style={{ height: section.height }}
          >
            <SectionTitle>Sección</SectionTitle>
            <AddColumnHandler onClick={() => addColumn(section.id)} />

            <div className="h-full p-0"> {/* Quitamos el padding por defecto del CardContent */}
              <div className="flex h-full gap-5"> {/* Aumentamos el gap entre columnas a 20px (gap-5) */}
                {section.children.map((column, index) =>
                  renderColumn(
                    column,
                    section.id,
                    index,
                    index === section.children.length - 1
                  )
                )}
              </div>
            </div>

            <VerticalResizeHandler
              onResize={(newHeight) => handleVerticalResize(section.id, newHeight)}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VisualEditor;