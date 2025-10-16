import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFileManager } from '../../hooks/useFileManager';
import { Tree, Input, Spin, Modal, message } from 'antd';
import { FolderOutlined, FileOutlined, SearchOutlined, FolderOpenOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Toolbar from '@components/FileManager/Toolbar';
import './styles/FileManager.css';

import FileManager2 from '@components/FileManager2/FileManager2';

const { Search } = Input;

const FileManager = ({ workspaceId, projectId }) => {
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  
  // La desestructuración del hook debe hacerse completa antes de cualquier return
  const {
    directoryTree,
    currentDirectory,
    loading,
    error,
    toggleDirectory,
    expandedNodes,
    selectedNodes,
    onSelect,
    onMultiSelect,
    createDirectory,
    deleteDirectory,
    renameDirectory,
    restoreDirectory,
    isCreatingDirectory,
    handleCreateDirectory,
    handleCreateSubmit,
    loadDirectoryContents,
    setCurrentDirectory,
    setSelectedNodes,
    updateNodeParent
  } = useFileManager(workspaceId, projectId);

  // Hoisting - Definir todos los hooks antes de retornos condicionales
  const handleOutsideClickRef = useRef(null);

  // useEffect para setup de event listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.ant-tree') && !e.target.closest('.file-manager-toolbar') && !e.target.closest('.file-manager-search')) {
        onSelect(null);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onSelect]);

  // useEffect para cargar directorios
  useEffect(() => {
    if (workspaceId && projectId) {
      loadDirectoryContents(null);
    }
  }, [workspaceId, projectId, loadDirectoryContents]);

  // Definimos la función goToRoot DESPUÉS de todos los hooks
  const goToRoot = useCallback(() => {
    loadDirectoryContents(null);
    setCurrentDirectory(null);
    setSelectedNodes(new Set());
  }, [loadDirectoryContents, setCurrentDirectory, setSelectedNodes]);
  
  // Modificar la función convertToAntTreeData para manejar correctamente los nodos cargables
  const convertToAntTreeData = useCallback((tree) => {
    if (!tree) return [];
    
    return Object.values(tree).map(node => ({
      key: node.id,
      title: node.name,
      isLeaf: node.type === 'file',
      selectable: true,
      isDirectory: node.type === 'directory',
      icon: ({ expanded }) => node.type === 'directory' 
        ? (expanded ? <FolderOpenOutlined /> : <FolderOutlined />) 
        : <FileOutlined />,
      // Si es un directorio y no tiene children explícitos, establecemos children como undefined
      // para que Ant Design sepa que debe llamar a loadData cuando se expande
      children: node.children ? convertToAntTreeData(node.children) : 
                node.type === 'directory' ? undefined : [], 
    }));
  }, []);
  
  const treeData = convertToAntTreeData(directoryTree);
  
  // Convertir expandedNodes (conjunto Set) a array de keys
  const expandedKeys = Array.from(expandedNodes || []);
  
  // Convertir selectedNodes (conjunto Set) a array de keys
  const selectedKeys = Array.from(selectedNodes || []);

  // Filtrado de datos para la búsqueda
  const getFilteredTreeData = useCallback((data) => {
    if (!searchValue) return data;

    const filterTreeNodes = (nodes) => {
      return nodes.map(node => {
        const matchNode = node.title.toLowerCase().includes(searchValue.toLowerCase());
        const filteredChildren = node.children ? filterTreeNodes(node.children) : [];
        
        if (matchNode || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
        return null;
      }).filter(Boolean);
    };

    return filterTreeNodes(data);
  }, [searchValue]);

  const filteredTreeData = getFilteredTreeData(treeData);
  
  // Manejador de búsqueda
  const handleSearch = (value) => {
    setSearchValue(value);
    setAutoExpandParent(true);
  };
  
  // Manejadores de eventos para el Tree de Ant Design
  const handleExpand = (expandedKeysValue, { expanded, node }) => {
    console.log("Expandiendo nodo:", node.key, expanded);
    
    // Es importante pasar el node.key y no todo el array expandedKeysValue
    toggleDirectory(node.key);
    setAutoExpandParent(false);
  };
  
  const handleTreeSelect = (selectedKeysValue, info) => {
    // Permite la selección múltiple o única de nodos
    onMultiSelect(selectedKeysValue);
  };
  
  const handleRightClick = ({ event, node }) => {
    event.preventDefault();
    // Implementar menú contextual aquí si es necesario
  };

  // Función mejorada para verificar si un nodo es descendiente de otro
  const checkIsDescendant = (treeData, ancestorKey, descendantKey) => {
    if (!descendantKey) return false;
    if (ancestorKey === descendantKey) return true;
    
    const findDescendants = (key, visited = new Set()) => {
      // Prevenir bucles infinitos
      if (visited.has(key)) return new Set();
      visited.add(key);
      
      const descendants = new Set();
      const node = findNodeById(treeData, key);
      
      if (node && node.children) {
        node.children.forEach(child => {
          descendants.add(child.key);
          // Añadir descendientes recursivamente
          const childDescendants = findDescendants(child.key, visited);
          childDescendants.forEach(d => descendants.add(d));
        });
      }
      
      return descendants;
    };
    
    const descendants = findDescendants(ancestorKey);
    return descendants.has(descendantKey);
  };

  // Reemplazar completamente la función onDrop
  const onDrop = (info) => {
    // Obtener las claves de los nodos
    const dragKey = info.dragNode.key;
    const dropKey = info.node.key;
    
    // Verificar y prevenir loops recursivos
    if (dragKey === dropKey) {
      message.error("No puedes mover un directorio dentro de sí mismo");
      return;
    }
    
    // Determinar el nuevo padre basado en si es una hoja o un directorio
    let newParentId = null;
    
    // Simplificar la lógica: siempre considerar que se suelta EN el directorio
    // a menos que explícitamente sea una GAP (espacio entre nodos) y pos sea 0 o 1
    if (info.dropToGap && (info.dropPosition === -1 || info.dropPosition === 1)) {
      // Soltar entre directorios - obtener el padre del nodo destino
      const parentInfo = findParentNode(treeData, dropKey);
      newParentId = parentInfo ? parentInfo.key : null;
    } else {
      // Soltar sobre un directorio
      if (info.node.isLeaf) {
        // Si es un archivo, usar su padre como destino
        const parentInfo = findParentNode(treeData, dropKey);
        newParentId = parentInfo ? parentInfo.key : null;
        message.info("Los archivos no pueden contener directorios, moviendo al directorio padre");
      } else {
        // Si es directorio, usarlo como nuevo padre
        newParentId = dropKey;
      }
    }
    
    // Verificar si el directorio destino es descendiente del directorio a mover
    const isDescendant = checkIsDescendant(treeData, dragKey, newParentId);
    if (isDescendant) {
      message.error("No puedes mover un directorio dentro de uno de sus descendientes");
      return;
    }
    
    // Confirmar el movimiento
    let targetName = "la raíz";
    if (newParentId) {
      const targetNode = findNodeById(treeData, newParentId);
      if (targetNode) {
        targetName = `"${targetNode.title}"`;
      }
    }
    
    Modal.confirm({
      title: 'Confirmar movimiento',
      icon: <ExclamationCircleOutlined />,
      content: `¿Estás seguro de mover "${info.dragNode.title}" a ${targetName}?`,
      okText: 'Sí',
      cancelText: 'No',
      onOk: async () => {
        try {
          await updateNodeParent(dragKey, newParentId);
          message.success('Directorio movido exitosamente');
        } catch (error) {
          // Mostrar mensaje de error específico si hay nombre duplicado
          if (error.message && error.message.includes("Ya existe un directorio")) {
            message.error(error.message);
          } else {
            message.error('Error al mover el directorio: ' + error.message);
          }
        }
      }
    });
  };

  // Función auxiliar para encontrar el nodo padre
  const findParentNode = (tree, key) => {
    if (!tree || !Array.isArray(tree)) return null;
    
    for (const node of tree) {
      if (node.children) {
        for (const child of node.children) {
          if (child.key === key) {
            return node;
          }
        }
        
        // Búsqueda recursiva en los hijos
        const found = findParentNode(node.children, key);
        if (found) return found;
      }
    }
    
    return null;
  };

  // Función auxiliar para encontrar un nodo por ID
  const findNodeById = (nodes, id) => {
    if (!nodes || !Array.isArray(nodes)) return null;
    
    for (const node of nodes) {
      if (node.key === id) return node;
      
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    
    return null;
  };

  // Función auxiliar para verificar si un nodo es hijo de otro
  const isChildOf = (node, targetId) => {
    if (!node) return false;
    if (!node.children) return false;
    
    for (const child of node.children) {
      if (child.key === targetId || isChildOf(child, targetId)) {
        return true;
      }
    }
    
    return false;
  };

  // Función mejorada para manejar la creación de directorios
  const handleCreateNewDirectory = useCallback(() => {
    // Obtener el ID del directorio seleccionado (si existe)
    const selectedId = selectedKeys.length === 1 ? selectedKeys[0] : null;
    const selectedNode = selectedId ? findNodeById(treeData, selectedId) : null;
    
    // Solo permitir crear dentro de directorios, no archivos
    const parentId = selectedNode && !selectedNode.isLeaf ? selectedId : null;
    
    // Llamar a la función original, pero pasando el parentId correcto
    handleCreateDirectory(parentId);
  }, [selectedKeys, treeData, handleCreateDirectory]);

  // Retornos condicionales - SOLO DESPUÉS de todos los hooks
  if (error) return <div>Error: {error.message}</div>;

  // Modificar loadData para que devuelva correctamente una Promise
  const loadData = (treeNode) => {
    return new Promise(resolve => {
      // No cargar datos si es un archivo (nodo hoja)
      if (treeNode.isLeaf) {
        resolve();
        return;
      }
      
      // Importante: No usar async/await directamente aquí para mantener la promesa
      loadDirectoryContents(treeNode.key)
        .then(() => {
          // Resolver la promesa cuando los datos se hayan cargado
          setTimeout(resolve, 300); // Un pequeño retraso para que el spinner sea visible
        })
        .catch(err => {
          console.error('Error cargando directorio:', err);
          resolve(); // Resolver incluso en caso de error para no bloquear la UI
        });
    });
  };

  // Renderizado principal
  return (
    <div className="file-manager">
      <Toolbar 
        currentDirectory={currentDirectory}
        onCreateDirectory={handleCreateNewDirectory}
        onGoToRoot={goToRoot}
      />
      <div className="file-manager-search">
        <Search
          placeholder="Buscar archivos"
          onChange={e => handleSearch(e.target.value)}
          style={{ width: '100%', marginBottom: '8px' }}
          prefix={<SearchOutlined />}
          allowClear
        />
      </div>
      <div className="file-manager-content">
        <Tree
          className="directory-tree"
          showIcon
          showLine={{ showLeafIcon: false }}
          treeData={filteredTreeData}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          onExpand={handleExpand}
          onSelect={handleTreeSelect}
          onRightClick={handleRightClick}
          loadData={loadData}
          autoExpandParent={autoExpandParent}
          multiple
          draggable={true}
          onDrop={onDrop}
        />
        {isCreatingDirectory && (
          <div className="create-directory-form">
            <input 
              type="text" 
              autoFocus 
              onBlur={() => handleCreateSubmit(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateSubmit(e.target.value);
                if (e.key === 'Escape') handleCreateSubmit(null);
              }}
            />
          </div>
        )}
      </div>

      <div className="file-manager-2">
        <FileManager2 />
      </div>
    </div>
  );
};

export default FileManager;
