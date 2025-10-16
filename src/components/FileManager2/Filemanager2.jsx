import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Folder, File, ChevronDown, ChevronRight, Trash2, Copy, Move, Plus, FilePlus, FolderPlus } from 'lucide-react';
// Importamos explícitamente los estilos CSS para el componente
import './FileManager2.css';

// Estructura inicial de archivos
const initialFiles = [
  {
    id: '1',
    name: 'Documentos',
    type: 'folder',
    expanded: false,
    children: [
      {
        id: '2',
        name: 'Trabajo',
        type: 'folder',
        expanded: false,
        children: [
          { id: '3', name: 'Informe.pdf', type: 'file' },
          { id: '4', name: 'Presentación.pptx', type: 'file' }
        ]
      },
      { id: '5', name: 'Recetas.txt', type: 'file' }
    ]
  },
  {
    id: '6',
    name: 'Imágenes',
    type: 'folder',
    expanded: false,
    children: [
      { id: '7', name: 'Vacaciones.jpg', type: 'file' },
      { id: '8', name: 'Perfil.png', type: 'file' }
    ]
  },
  { id: '9', name: 'Notas.txt', type: 'file' }
];

// Helper function to update an item's property (e.g., isCut)
const updateItemPropertyRecursive = (items, id, propertyName, propertyValue) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      items[i][propertyName] = propertyValue;
      return true;
    }
    if (items[i].type === 'folder' && items[i].children) {
      if (updateItemPropertyRecursive(items[i].children, id, propertyName, propertyValue)) {
        return true;
      }
    }
  }
  return false;
};

// Helper to delete an item by ID recursively from a tree - AÑADIR ESTA FUNCIÓN FALTANTE
const deleteItemRecursive = (items, idToDelete) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === idToDelete) {
      items.splice(i, 1);
      return true;
    }
    if (items[i].type === 'folder' && items[i].children) {
      if (deleteItemRecursive(items[i].children, idToDelete)) {
        return true;
      }
    }
  }
  return false;
};

// Helper function to clear a property for all items (e.g., isCut)
const clearItemPropertyRecursive = (items, propertyName) => {
  items.forEach(item => {
    if (item.hasOwnProperty(propertyName)) {
      delete item[propertyName];
    }
    if (item.type === 'folder' && item.children) {
      clearItemPropertyRecursive(item.children, propertyName);
    }
  });
};

// Helper to remove an item by ID from a tree and return it
const removeItemAndReturnRecursive = (items, idToRemove) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === idToRemove) {
      const [removedItem] = items.splice(i, 1);
      return removedItem;
    }
    if (items[i].type === 'folder' && items[i].children) {
      const removedItem = removeItemAndReturnRecursive(items[i].children, idToRemove);
      if (removedItem) {
        return removedItem;
      }
    }
  }
  return null;
};

// Finds the ID of the parent folder for a given item ID. Returns null if item is at root.
const findParentFolderIdRecursiveGlobal = (items, childId, parentIdCandidate = null) => {
  for (const item of items) {
    if (item.id === childId) {
      return parentIdCandidate;
    }
    if (item.type === 'folder' && item.children) {
      const foundParentId = findParentFolderIdRecursiveGlobal(item.children, childId, item.id);
      if (foundParentId !== undefined) { 
        return foundParentId;
      }
    }
  }
  return undefined; 
};

// Helper to check if potentialAncestorId is an ancestor of childId, or if it's childId itself
const isAncestorOrSelfRecursive = (itemsToSearchIn, potentialAncestorId, childIdToFind) => {
  // Find the starting item (potentialAncestor) within its context in itemsToSearchIn
  let potentialAncestorItem = null;
  const findStartNode = (currentItems) => {
    for (const item of currentItems) {
      if (item.id === potentialAncestorId) {
        potentialAncestorItem = item;
        return true;
      }
      if (item.type === 'folder' && item.children) {
        if (findStartNode(item.children)) return true;
      }
    }
    return false;
  };

  findStartNode(itemsToSearchIn);

  if (!potentialAncestorItem) return false; // Ancestor not found in the provided tree context

  const queue = [potentialAncestorItem];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current.id === childIdToFind) {
      return true;
    }
    if (current.type === 'folder' && current.children) {
      queue.push(...current.children);
    }
  }
  return false;
};

// Helper function to generate a new ID
const generateNewId = () => Math.random().toString(36).substr(2, 9);

// Helper function for deep copying an item and its children with new IDs
const createDeepCopyRecursive = (item) => {
  const newItem = { ...item, id: generateNewId() };
  if (newItem.hasOwnProperty('isCut')) delete newItem.isCut;
  if (newItem.hasOwnProperty('expanded')) newItem.expanded = false; // Copies are not expanded by default
  if (item.type === 'folder' && item.children) {
    newItem.children = item.children.map(child => createDeepCopyRecursive(child));
  }
  return newItem;
};

export default function FileManager2() {
  const [files, setFiles] = useState(initialFiles);
  const [selectedItem, setSelectedItem] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [clipboardOperation, setClipboardOperation] = useState(null); // 'copy' o 'move'
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, itemId: null });
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', itemId: null, targetId: null });
  const [newItemType, setNewItemType] = useState('file');
  const [newItemName, setNewItemName] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileManager2Ref = useRef(null);
  const contextMenuRef = useRef(null);

  // Definir funciones auxiliares y manejadores ANTES de usarlos en useEffects o otros useCallbacks

  const findItemById = useCallback((items, id, path = []) => {
    for (let i = 0; i < items.length; i++) {
      const currentPath = [...path, i];
      if (items[i].id === id) {
        return { item: items[i], path: currentPath };
      }
      if (items[i].type === 'folder' && items[i].children) {
        // Para la llamada recursiva, usamos la referencia de la función actual (findItemById)
        // que está en el scope de este useCallback.
        const result = findItemById(items[i].children, id, [...currentPath, 'children']);
        if (result) return result;
      }
    }
    return null;
  }, []); // Esta función no depende de nada del scope del componente que cambie, por lo que el array de dependencias es vacío.

  const findParentFolderIdRecursive = useCallback((currentFiles, childId, parentIdCandidate = null) => {
    for (const item of currentFiles) {
      if (item.id === childId) {
        return parentIdCandidate;
      }
      if (item.type === 'folder' && item.children) {
        const foundParentId = findParentFolderIdRecursive(item.children, childId, item.id);
        if (foundParentId !== undefined) {
          return foundParentId;
        }
      }
    }
    return undefined;
  }, []);

  // Nueva función auxiliar para buscar un ítem por nombre en una carpeta/raíz
  const findItemByNameInTarget = useCallback((currentFiles, parentFolderId, name, excludeId = null) => {
    let listToSearch = currentFiles;
    if (parentFolderId) {
      const parentResult = findItemById(currentFiles, parentFolderId);
      if (parentResult && parentResult.item.type === 'folder' && parentResult.item.children) {
        listToSearch = parentResult.item.children;
      } else {
        return null; // Parent not found or not a folder with children
      }
    }
    return listToSearch.find(item =>
      item.name.toLowerCase() === name.toLowerCase() &&
      (excludeId ? item.id !== excludeId : true)
    );
  }, [findItemById]);

  const handleShowConfirmDialog = useCallback((type, itemId, targetId = null, actionDetails = null) => {
    console.log(`[FileManager2] Showing confirm dialog for type: ${type}, itemId: ${itemId}, targetId: ${targetId}`);
    setConfirmAction({ type, itemId, targetId, ...actionDetails });
    setShowConfirmDialog(true);
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, [setConfirmAction, setShowConfirmDialog, setContextMenu]); 

  // REORDENAR: Mover estas funciones ANTES de los useEffect que las usan
  // Función para copiar un elemento al portapapeles
  const copyToClipboard = useCallback((id) => {
    const result = findItemById(files, id);
    if (result) {
      setClipboard({ ...result.item });
      setClipboardOperation('copy');
      setFiles(prevFiles => {
        const newFiles = JSON.parse(JSON.stringify(prevFiles));
        clearItemPropertyRecursive(newFiles, 'isCut');
        return newFiles;
      });
    }
  }, [files, findItemById, setClipboard, setClipboardOperation, setFiles]);

  // Función para mover un elemento al portapapeles
  const moveToClipboard = useCallback((id) => {
    const result = findItemById(files, id);
    if (result) {
      setClipboard({ ...result.item, isCut: undefined });
      setClipboardOperation('move');
      setFiles(prevFiles => {
        const newFiles = JSON.parse(JSON.stringify(prevFiles));
        clearItemPropertyRecursive(newFiles, 'isCut');
        updateItemPropertyRecursive(newFiles, id, 'isCut', true);
        return newFiles;
      });
      setSelectedItem(id);
    }
  }, [files, findItemById, setClipboard, setClipboardOperation, setFiles, setSelectedItem]);

  // Función para seleccionar un elemento
  const selectItem = useCallback((id) => {
    console.log(`[FileManager2] selectItem called for ID: ${id}`);
    setSelectedItem(id);
    console.log(`[FileManager2] Item selected: ${id}`);
  }, []);

  // Esta función es reemplazada por performActualPaste y la lógica de confirmación
  // const pasteItemWithClipboard = useCallback((targetId, itemToPaste, operation) => { ... });
  // Nueva función para realizar la operación de pegado/movimiento real
  const performActualPaste = useCallback((targetId, itemToPasteInput, operation, existingItemIdToOverwrite = null) => {
    setFiles(prevFiles => {
      let newFiles = JSON.parse(JSON.stringify(prevFiles));
      let parentNodeChildrenList;

      if (targetId && targetId !== 'root') {
        const targetResult = findItemById(newFiles, targetId);
        if (!targetResult || targetResult.item.type !== 'folder') {
          console.warn("[FileManager2] El destino del pegado no es una carpeta o no se encontró:", targetId);
          return prevFiles;
        }
        if (!targetResult.item.children) {
          targetResult.item.children = [];
        }
        parentNodeChildrenList = targetResult.item.children;
      } else {
        parentNodeChildrenList = newFiles;
      }

      if (operation === 'move' && itemToPasteInput.type === 'folder') {
        if (targetId && isAncestorOrSelfRecursive(newFiles, itemToPasteInput.id, targetId)) {
          console.warn("[FileManager2] No se puede mover una carpeta a sí misma o a uno de sus descendientes.");
          return prevFiles;
        }
        if (itemToPasteInput.id === targetId) {
            console.warn("[FileManager2] No se puede mover una carpeta a sí misma.");
            return prevFiles;
        }
      }
      
      if (existingItemIdToOverwrite) {
        console.log(`[FileManager2] Sobrescribiendo. Eliminando ítem existente: ${existingItemIdToOverwrite}`);
        // Encontrar la lista correcta de la cual eliminar
        let listToRemoveFrom = newFiles;
        const parentOfExisting = findParentFolderIdRecursive(newFiles, existingItemIdToOverwrite);
        if (parentOfExisting) {
            const parentResult = findItemById(newFiles, parentOfExisting);
            if (parentResult && parentResult.item.children) {
                listToRemoveFrom = parentResult.item.children;
            } else { // No debería pasar si el ítem existe y tiene padre
                 console.warn(`[FileManager2] Padre de ${existingItemIdToOverwrite} no encontrado o sin hijos durante sobrescritura.`);
            }
        } // Si no hay parentOfExisting, el ítem está en la raíz (listToRemoveFrom ya es newFiles)

        const indexToRemove = listToRemoveFrom.findIndex(item => item.id === existingItemIdToOverwrite);
        if (indexToRemove > -1) {
          listToRemoveFrom.splice(indexToRemove, 1);
          console.log(`[FileManager2] Ítem ${existingItemIdToOverwrite} eliminado para sobrescritura.`);
        } else {
          console.warn(`[FileManager2] Sobrescribir: Ítem existente ID ${existingItemIdToOverwrite} no encontrado para eliminar.`);
        }
      }

      const itemToPaste = { ...itemToPasteInput };
      if (itemToPaste.hasOwnProperty('isCut')) {
        delete itemToPaste.isCut;
      }

      let finalPastedItem;

      if (operation === 'copy') {
        finalPastedItem = createDeepCopyRecursive(itemToPaste); // Usa la función helper global
        parentNodeChildrenList.push(finalPastedItem);
      } else if (operation === 'move') {
        const originalItemId = itemToPaste.id;
        // Asegurarse de que no estamos intentando eliminar el ítem que acabamos de eliminar en la sobrescritura, si los IDs fueran iguales
        // (aunque la lógica de conflicto debería prevenir que itemToPaste.id sea igual a existingItemIdToOverwrite)
        if (originalItemId !== existingItemIdToOverwrite) {
            const movedItem = removeItemAndReturnRecursive(newFiles, originalItemId);
            if (movedItem) {
              if (movedItem.hasOwnProperty('isCut')) {
                delete movedItem.isCut;
              }
              finalPastedItem = movedItem;
              parentNodeChildrenList.push(finalPastedItem);
            } else {
              console.warn(`[FileManager2] Pegar (mover): Ítem original ID ${originalItemId} no encontrado para eliminar.`);
              // Si el ítem original no se encontró, podría ser porque ya fue eliminado (caso de sobrescribir el mismo ítem movido)
              // O podría ser un error. Si es crítico, retornar prevFiles.
              // Por ahora, si no se puede remover el original, no se pega.
              // Considerar si el itemToPaste ya es el objeto correcto y solo necesita ser añadido.
              // Si el item original no se encuentra, pero estamos en una operación de mover,
              // y no es el item que se está sobrescribiendo, es un problema.
              // Si es el item que se está sobrescribiendo, ya fue manejado.
              // Esta lógica es compleja. La clave es que removeItemAndReturnRecursive busca en *toda* la estructura.
              // Si el item a mover es el mismo que se va a sobrescribir, ya fue eliminado.
              // En ese caso, `movedItem` sería null. Deberíamos entonces usar `itemToPaste` directamente.
              // Esto es poco probable si la detección de conflictos funciona bien.
               console.warn(`[FileManager2] No se pudo mover el ítem ${originalItemId} porque no se encontró después de la posible sobrescritura.`);
               return prevFiles; // Ser conservador
            }
        } else { // El ítem a mover era el mismo que el ítem a sobrescribir. Ya fue eliminado.
            // Simplemente añadimos el itemToPaste (que es una copia del estado antes de la eliminación)
            finalPastedItem = itemToPaste; // Ya tiene el ID correcto del ítem original
            parentNodeChildrenList.push(finalPastedItem);
            console.log(`[FileManager2] Ítem a mover (${originalItemId}) era el mismo que el sobrescrito. Añadido directamente.`);
        }
      }

      if (finalPastedItem) {
        setSelectedItem(finalPastedItem.id);
      }
      
      clearItemPropertyRecursive(newFiles, 'isCut');
      if (operation === 'move') {
        setClipboard(null);
        setClipboardOperation(null);
      }
      return newFiles;
    });
  }, [findItemById, setSelectedItem, setClipboard, setClipboardOperation, setFiles, findParentFolderIdRecursive]); // Dependencias de performActualPaste

  // Manejador de eventos de teclado para atajos - MODIFICADO (sin confirmar copiar y cortar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Verificar primero si estamos dentro de un input para evitar interferir con la escritura
      const isInputActive = document.activeElement.tagName === 'INPUT' || 
                           document.activeElement.tagName === 'TEXTAREA';
      
      if (isInputActive) return;

      // Ctrl+V para pegar (mantener confirmación)
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        console.log('[FileManager2] Ctrl+V detected, clipboard:', clipboard);
        
        if (clipboard) {
          let pasteTargetId = null; // Default to root
          
          if (selectedItem) {
            const selInfo = findItemById(files, selectedItem);
            console.log('[FileManager2] Selected item for paste:', selInfo?.item);
            
            if (selInfo) {
              if (selInfo.item.type === 'folder') {
                pasteTargetId = selectedItem;
              } else { // Es un archivo, buscar su padre
                pasteTargetId = findParentFolderIdRecursive(files, selectedItem);
              }
              console.log(`[FileManager2] Paste target ID: ${pasteTargetId}`);
            }
          }
          
          // Modificado para pasar por la lógica de `pasteItem` que ahora maneja conflictos
          pasteItem(pasteTargetId); 
          // Ya no se llama a handleShowConfirmDialog directamente aquí para 'paste', 
          // pasteItem lo hará después de verificar conflictos.
        } else {
          console.log('[FileManager2] Nothing in clipboard to paste');
        }
      } 
      // Otros atajos requieren un elemento seleccionado
      else if (selectedItem) {
        console.log(`[FileManager2] Selected item for shortcuts: ${selectedItem}`);
        
        // Ctrl+C para copiar (sin confirmación)
        if (e.ctrlKey && e.key === 'c') {
          e.preventDefault();
          console.log(`[FileManager2] Copying item: ${selectedItem}`);
          copyToClipboard(selectedItem); // Ejecutar directamente sin confirmación
        }
        // Ctrl+X para cortar (sin confirmación)
        else if (e.ctrlKey && e.key === 'x') {
          e.preventDefault();
          console.log(`[FileManager2] Cutting item: ${selectedItem}`);
          moveToClipboard(selectedItem); // Ejecutar directamente sin confirmación
        }
        // Delete para eliminar (mantener confirmación)
        else if (e.key === 'Delete') {
          e.preventDefault();
          console.log(`[FileManager2] Deleting item: ${selectedItem}`);
          handleShowConfirmDialog('delete', selectedItem);
        }
      } else {
        console.log('[FileManager2] No item selected for shortcuts');
      }
    };

    console.log('[FileManager2] Adding global keydown listener');
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      console.log('[FileManager2] Removing global keydown listener');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItem, clipboard, files, findItemById, findParentFolderIdRecursive, handleShowConfirmDialog, copyToClipboard, moveToClipboard]);

  // Cerrar el menú contextual al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    // Usar mousedown para que se capture antes que los clics que podrían abrir otro menú o realizar otra acción
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible]); // Depender solo de contextMenu.visible

  // Función para obtener un elemento por su ruta
  const getItemAtPath = useCallback((items, path) => {
    if (path.length === 0) return { parent: null, index: -1 };
    
    let current = items;
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i] === 'children') continue;
      current = current[path[i]];
      if (path[i+1] === 'children') current = current.children;
    }
    
    const lastIndex = path[path.length - 1];
    if (lastIndex === 'children') return { parent: current, index: -1 };
    return { parent: current, index: lastIndex };
  }, []);

  // Función para expandir/colapsar una carpeta
  const toggleExpand = useCallback((id) => {
    console.log(`[FileManager2] toggleExpand called for ID: ${id}`);
    setFiles(prevFiles => {
      const newFiles = JSON.parse(JSON.stringify(prevFiles));
      const result = findItemById(newFiles, id); // Usa la versión memorizada de findItemById
      if (result && result.item.type === 'folder') {
        console.log(`[FileManager2] Expanding/collapsing item: ${result.item.name}`);
        result.item.expanded = !result.item.expanded;
      } else {
        console.warn(`[FileManager2] toggleExpand: Item not found or not a folder for ID: ${id}`);
      }
      return newFiles;
    });
  }, [findItemById, setFiles]); // findItemById es una dependencia

  // Función para mostrar el menú contextual
  const handleContextMenu = useCallback((e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      itemId: id
    });
    setSelectedItem(id);
  }, [setContextMenu, setSelectedItem]);

  // Función para eliminar un elemento
  const deleteItem = useCallback((id) => {
    console.log(`[FileManager2] Attempting to delete item ID: ${id}`);
    setFiles(prevFiles => {
      const newFiles = JSON.parse(JSON.stringify(prevFiles));
      if (deleteItemRecursive(newFiles, id)) { // deleteItemRecursive es global
        console.log(`[FileManager2] Item ID: ${id} deleted successfully from local state.`);
        if (selectedItem === id) {
          setSelectedItem(null);
        }
        if (clipboard && clipboard.id === id) {
          setClipboard(null);
          setClipboardOperation(null);
        }
      } else {
        console.warn(`[FileManager2] Item ID: ${id} not found for deletion in local state.`);
      }
      return newFiles;
    });
  }, [selectedItem, clipboard, setFiles, setSelectedItem, setClipboard, setClipboardOperation]);

  // Función para pegar desde el portapapeles en una carpeta
  // Refactorizada para manejar la confirmación de sobrescritura
  const pasteItem = useCallback((targetId) => {
    if (!clipboard) {
      console.warn("[FileManager2] No hay elemento en el portapapeles para pegar");
      return;
    }
    console.log(`[FileManager2] Iniciando pegado de ${clipboard.id} en ${targetId || 'root'}`);

    const actionDetails = {
      clipboardItemForPaste: { ...clipboard },
      clipboardOperationForPaste: clipboardOperation
    };

    // Verificar conflicto de nombres ANTES de mostrar el diálogo de confirmación.
    // Usamos `files` (estado actual) para esta verificación.
    const existingItem = findItemByNameInTarget(files, targetId, clipboard.name, clipboard.id);

    if (existingItem) {
      actionDetails.overwriteDetails = {
        conflictingItemName: existingItem.name,
        existingItemId: existingItem.id,
      };
      console.log(`[FileManager2] Conflicto de nombre detectado para "${clipboard.name}" en destino. Preparando para preguntar sobrescritura.`);
    }

    // Siempre mostrar diálogo de confirmación, que ahora puede incluir detalles de sobrescritura.
    handleShowConfirmDialog('paste', clipboard.id, targetId, actionDetails);
    setContextMenu(prev => ({ ...prev, visible: false }));

  }, [clipboard, clipboardOperation, files, findItemByNameInTarget, handleShowConfirmDialog, setContextMenu]);
  
  // Función para mostrar el diálogo de creación de nuevo elemento
  const showCreateDialog = useCallback((type, parentId) => {
    console.log(`[FileManager2] showCreateDialog called. Type: ${type}, ParentID: ${parentId}`);
    setNewItemType(type);
    setNewItemName('');
    setShowNewItemDialog(true);
    setSelectedItem(parentId); 
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, [setNewItemType, setNewItemName, setShowNewItemDialog, setSelectedItem, setContextMenu]);

  // Función para mostrar el diálogo de renombrar elemento
  const showRenameDialog = useCallback((itemId) => {
    console.log(`[FileManager2] showRenameDialog called for ID: ${itemId}`);
    const result = findItemById(files, itemId); // findItemById es memorizada
    if (result) {
      setNewItemName(result.item.name);
      // Guardar el ID del item original para la validación de nombre
      setConfirmAction({ type: 'rename', itemId, originalItemId: itemId }); 
      setShowNewItemDialog(true);
      setContextMenu(prev => ({ ...prev, visible: false }));
    }
  }, [files, findItemById, setNewItemName, setConfirmAction, setShowNewItemDialog, setContextMenu]);
  
  // Función para renombrar un elemento existente
  const renameItem = useCallback((itemId, newName) => {
    if (!newName.trim()) {
      console.warn("[FileManager2] No se puede renombrar con un nombre vacío");
      alert("El nombre no puede estar vacío.");
      return;
    }
    console.log(`[FileManager2] Renaming item ${itemId} to: ${newName}`);

    const parentId = findParentFolderIdRecursive(files, itemId);
    const existingItemWithNewName = findItemByNameInTarget(files, parentId, newName, itemId);

    if (existingItemWithNewName) {
      alert(`Ya existe un elemento llamado "${newName}" en esta ubicación. Por favor, elige otro nombre.`);
      return; // No continuar con el renombrado
    }

    setFiles(prevFiles => {
      const newFiles = JSON.parse(JSON.stringify(prevFiles));
      const itemToRename = findItemById(newFiles, itemId); // Memorizada
      if (itemToRename) {
        console.log(`[FileManager2] Found item to rename: ${itemToRename.item.name} -> ${newName}`);
        itemToRename.item.name = newName;
      } else {
        console.warn(`[FileManager2] Item ID: ${itemId} not found for renaming.`);
      }
      return newFiles;
    });
  }, [findItemById, setFiles]);

  // Función para crear un nuevo elemento
  const createNewItem = useCallback(() => {
    if (!newItemName.trim()) {
      console.warn("[FileManager2] No se puede crear un elemento con nombre vacío");
      alert("El nombre del elemento no puede estar vacío.");
      setShowNewItemDialog(false);
      return;
    }

    const parentIdForNewItem = selectedItem; // Puede ser null si se crea en la raíz
    const existingItem = findItemByNameInTarget(files, parentIdForNewItem, newItemName);

    if (existingItem) {
      alert(`Ya existe un elemento llamado "${newItemName}" en esta ubicación. Por favor, elige otro nombre.`);
      setShowNewItemDialog(false); // Cerrar diálogo
      return;
    }

    console.log(`[FileManager2] Creating new ${newItemType}: ${newItemName} under parent: ${selectedItem || 'root'}`);
    const newFilesTree = JSON.parse(JSON.stringify(files)); 
    const parentResult = selectedItem ? findItemById(newFilesTree, selectedItem) : null; // Memorizada
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      type: newItemType
    };
    if (newItemType === 'folder') {
      newItem.children = [];
      newItem.expanded = false;
    }
    if (parentResult && parentResult.item.type === 'folder') {
      if (!parentResult.item.children) parentResult.item.children = [];
      parentResult.item.children.push(newItem);
      if (!parentResult.item.expanded) {
        parentResult.item.expanded = true;
      }
    } else {
      newFilesTree.push(newItem);
    }
    setFiles(newFilesTree);
    setSelectedItem(newItem.id);
    setShowNewItemDialog(false);
  }, [newItemName, newItemType, selectedItem, files, findItemById, setFiles, setSelectedItem, setShowNewItemDialog]);

  // Funciones para Drag & Drop
  const handleDragStart = useCallback((e, id) => {
    e.stopPropagation();
    setDraggedItem(id);
    setIsDragging(true);
    // Agregar datos al evento de arrastre
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }, [setDraggedItem, setIsDragging]);

  const handleDragOver = useCallback((e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = id ? findItemById(files, id) : null; // files es dependencia
    if (result && result.item.type === 'folder') {
      if (dropTarget !== id) {
        setDropTarget(id);
      }
      e.dataTransfer.dropEffect = 'move';
    } else if (!id) { // Si id es null (área raíz del file-manager-content)
      if (dropTarget !== 'root') {
        setDropTarget('root');
      }
      e.dataTransfer.dropEffect = 'move';
    } else {
      // Arrastrando sobre un archivo, no es un destino de drop válido por sí mismo.
      // Podríamos opcionalmente establecer dropEffect a 'none' o dejar que el evento burbujee.
      // Si queremos que al arrastrar sobre un archivo en la raíz se active el drop en raíz:
      // const parentOfFile = findParentFolderIdRecursive(files, id);
      // if (parentOfFile === null && dropTarget !== 'root') setDropTarget('root');
      // Por ahora, lo mantenemos simple: solo las carpetas y el área raíz son drop targets activos.
      e.dataTransfer.dropEffect = 'none'; // Opcional: indicar que no se puede soltar aquí directamente
    }
  }, [files, dropTarget, findItemById, setDropTarget, findParentFolderIdRecursive]); // Añadidas dependencias

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Verificar si realmente debemos limpiar el dropTarget
    // Solo limpiar si el evento dragLeave no está entrando a un elemento hijo
    // usando relatedTarget podemos ver a dónde va el cursor después de salir
    const toElement = e.relatedTarget;
    
    // Si el cursor no va a otro elemento dentro del área de drop, entonces limpiamos
    if (!toElement || !fileManager2Ref.current.contains(toElement)) {
      setDropTarget(null);
    }
  }, [fileManager2Ref, setDropTarget]);

  const handleDrop = useCallback((e, targetId) => { // targetId es el ID del FileItem o null si se suelta en el área raíz
    e.preventDefault();
    e.stopPropagation();
    console.log(`[FileManager2] Drop on: ${targetId}`);
    const resetDragStateAndReturn = () => {
      setIsDragging(false);
      setDraggedItem(null);
      setDropTarget(null);
    };

    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      resetDragStateAndReturn();
      return;
    }

    const sourceItemInfo = findItemById(files, sourceId);
    if (!sourceItemInfo) {
      resetDragStateAndReturn();
      return;
    }

    let finalTargetIdForPaste; 

    if (targetId === null || targetId === 'root') { // Drop en el área raíz (file-manager-content)
      finalTargetIdForPaste = null;
    } else { 
      const targetItemInfo = findItemById(files, targetId);
      if (targetItemInfo && targetItemInfo.item.type === 'folder') {
        finalTargetIdForPaste = targetId; 
      } else {
        finalTargetIdForPaste = findParentFolderIdRecursive(files, targetId);
      }
    }
    
    // Validaciones para mover carpetas (evitar mover a sí mismo o a un descendiente)
    if (sourceItemInfo.item.type === 'folder') {
      if (finalTargetIdForPaste && isAncestorOrSelfRecursive(files, sourceItemInfo.item.id, finalTargetIdForPaste)) {
        console.warn("[FileManager2] Cannot move a folder into itself or one of its descendants.");
        resetDragStateAndReturn();
        return;
      }
      if (sourceItemInfo.item.id === finalTargetIdForPaste) {
        console.warn("[FileManager2] Cannot move a folder into itself.");
        resetDragStateAndReturn();
        return;
      }
    }

    const actionDetailsForDrop = {
      clipboardItem: { ...sourceItemInfo.item }, 
      clipboardOperation: 'move' 
    };

    // Verificar conflicto de nombres para drag & drop
    const existingItemInDropTarget = findItemByNameInTarget(files, finalTargetIdForPaste, sourceItemInfo.item.name, sourceItemInfo.item.id);

    if (existingItemInDropTarget) {
      actionDetailsForDrop.overwriteDetails = {
        conflictingItemName: existingItemInDropTarget.name,
        existingItemId: existingItemInDropTarget.id
      };
      console.log(`[FileManager2] Conflicto de nombre detectado en drop para "${sourceItemInfo.item.name}". Preparando para preguntar sobrescritura.`);
    }
    
    setConfirmAction({
      type: 'paste', 
      itemId: sourceId, 
      targetId: finalTargetIdForPaste, 
      ...actionDetailsForDrop
    });

    setFiles(prevFiles => {
      const newFiles = JSON.parse(JSON.stringify(prevFiles));
      clearItemPropertyRecursive(newFiles, 'isCut');
      updateItemPropertyRecursive(newFiles, sourceId, 'isCut', true);
      return newFiles;
    });

    setShowConfirmDialog(true);
    // No limpiar el estado de drag aquí, se hace después de la confirmación o cancelación del modal
    // o si la operación de drop se aborta antes.
    // La limpieza final del drag se hace en resetDragStateAndReturn o después del modal.
    // Por ahora, el resetDragStateAndReturn ya cubre los abortos tempranos.
    // El estado de drag se limpiará después de que el modal se cierre o la acción se complete.
    // Sin embargo, es bueno limpiar dropTarget y draggedItem después de iniciar la confirmación.
    setDraggedItem(null); // Limpiar el ítem arrastrado
    setDropTarget(null); // Limpiar el destino visual
    setIsDragging(false); // Indicar que ya no se está arrastrando activamente
  }, [files, findItemById, findParentFolderIdRecursive, setConfirmAction, setFiles, setDraggedItem, setDropTarget, setIsDragging]);
  
  // Componente para el menú contextual - MODIFICADO PARA CERRAR EL MENÚ DESPUÉS DE CADA ACCIÓN
  const ContextMenu = () => {
    if (!contextMenu.visible) return null;
    
    const result = findItemById(files, contextMenu.itemId);
    const isFolder = result && result.item.type === 'folder';
    const canPaste = clipboard !== null;
    
    // Referencias para los elementos del menú
    const createFileRef = useRef(null);
    const createFolderRef = useRef(null);
    const pasteRef = useRef(null);
    const copyRef = useRef(null);
    const moveRef = useRef(null);
    const renameRef = useRef(null);
    const deleteRef = useRef(null);

    // Añadimos listeners nativos para cada opción del menú
    useEffect(() => {
      // Función para configurar un listener nativo
      const setupClickListener = (ref, action) => {
        if (!ref.current) return;
        
        const handleClick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          action();
          // Cerrar el menú contextual después de cualquier acción
          setContextMenu(prev => ({ ...prev, visible: false }));
        };
        
        ref.current.addEventListener('mousedown', handleClick);
        return () => {
          if (ref.current) {
            ref.current.removeEventListener('mousedown', handleClick);
          }
        };
      };

      // Array para guardar las funciones de limpieza
      const cleanups = [];
      
      // Configurar listeners solo para los elementos que existen actualmente
      if (isFolder) {
        // Nuevo archivo
        if (createFileRef.current) {
          cleanups.push(
            setupClickListener(createFileRef, () => {
              showCreateDialog('file', contextMenu.itemId);
              // No necesitamos cerrar el menú aquí porque showCreateDialog ya lo hace
            })
          );
        }
        
        // Nueva carpeta
        if (createFolderRef.current) {
          cleanups.push(
            setupClickListener(createFolderRef, () => {
              showCreateDialog('folder', contextMenu.itemId);
              // No necesitamos cerrar el menú aquí porque showCreateDialog ya lo hace
            })
          );
        }
        
        // Pegar (solo si hay algo en el portapapeles) - MANTENER CONFIRMACIÓN
        if (canPaste && pasteRef.current) {
          cleanups.push(
            setupClickListener(pasteRef, () => {
              // Modificado: pasteItem ahora maneja la lógica de conflicto y llama a handleShowConfirmDialog
              pasteItem(contextMenu.itemId);
              // El menú se cerrará por el setupClickListener
            })
          );
        }
      }
      
      // Copiar - SIN CONFIRMACIÓN
      if (copyRef.current) {
        cleanups.push(
          setupClickListener(copyRef, () => {
            copyToClipboard(contextMenu.itemId);
            // El menú se cerrará automáticamente por el handler genérico en setupClickListener
          })
        );
      }
      
      // Mover/Cortar - SIN CONFIRMACIÓN
      if (moveRef.current) {
        cleanups.push(
          setupClickListener(moveRef, () => {
            moveToClipboard(contextMenu.itemId);
            // El menú se cerrará automáticamente por el handler genérico en setupClickListener
          })
        );
      }
      
      // Renombrar
      if (renameRef.current) {
        cleanups.push(
          setupClickListener(renameRef, () => {
            showRenameDialog(contextMenu.itemId);
            // No necesitamos cerrar el menú aquí porque showRenameDialog ya lo hace
          })
        );
      }
      
      // Eliminar - MANTENER CONFIRMACIÓN
      if (deleteRef.current) {
        cleanups.push(
          setupClickListener(deleteRef, () => {
            handleShowConfirmDialog('delete', contextMenu.itemId);
            // No necesitamos cerrar el menú aquí porque handleShowConfirmDialog ya lo hace
          })
        );
      }
      
      // Limpiar todos los listeners cuando el componente se desmonte o cambien las dependencias
      return () => {
        cleanups.forEach(cleanup => cleanup());
      };
    }, [
      contextMenu.itemId,
      isFolder,
      canPaste,
      clipboard,
      showCreateDialog,
      handleShowConfirmDialog,
      showRenameDialog,
      copyToClipboard,
      moveToClipboard,
      setContextMenu // Añadido setContextMenu como dependencia
    ]);

    return (
      <div 
        ref={contextMenuRef}
        className="file-manager2-contextmenu"
        style={{ 
          top: `${contextMenu.y}px`, 
          left: `${contextMenu.x}px`,
          zIndex: 1000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isFolder && (
          <>
            <div   
              ref={createFileRef}
              className="file-manager2-contextmenu-item"  
              // onClick eliminado, usamos listeners nativos
            >
              <FilePlus size={16} /> Nuevo Archivo
            </div>
            <div   
              ref={createFolderRef}
              className="file-manager2-contextmenu-item"  
              // onClick eliminado, usamos listeners nativos
            >
              <FolderPlus size={16} /> Nueva Carpeta
            </div>
            {canPaste && (
              <div   
                ref={pasteRef}
                className="file-manager2-contextmenu-item"  
                // onClick eliminado, usamos listeners nativos
              >
                <Plus size={16} /> Pegar
              </div>
            )}
            <div className="border-t my-1"></div>
          </>
        )}
        <div 
          ref={copyRef}
          className="file-manager2-contextmenu-item"
          // onClick eliminado, usamos listeners nativos
        >
          <Copy size={16} /> Copiar (Ctrl+C)
        </div>
        <div 
          ref={moveRef}
          className="file-manager2-contextmenu-item"
          // onClick eliminado, usamos listeners nativos
        >
          <Move size={16} /> Cortar (Ctrl+X)
        </div>
        <div 
          ref={renameRef}
          className="file-manager2-contextmenu-item"
          // onClick eliminado, usamos listeners nativos
        >
          <FilePlus size={16} /> Renombrar
        </div>
        <div className="border-t my-1"></div>
        <div 
          ref={deleteRef}
          className="file-manager2-contextmenu-item text-red-500"
          // onClick eliminado, usamos listeners nativos
        >
          <Trash2 size={16} /> Eliminar (Del)
        </div>
      </div>
    );
  };

  // Componente Modal genérico usando refs y listeners nativos para los botones (mousedown)
  const Modal = ({ title, onClose, onConfirm, children }) => {
    const modalRef = useRef(null);
    const cancelBtnRef = useRef(null);
    const confirmBtnRef = useRef(null);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Enter') {
          onConfirm();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Listeners nativos para mousedown, solo botón primario
      const handleCancelMouseDown = (e) => {
        if (!(e instanceof MouseEvent) || e.button !== 0) return; // Solo primario
        e.preventDefault();
        e.stopPropagation();
        onClose();
      };
      const handleConfirmMouseDown = (e) => {
        if (!(e instanceof MouseEvent) || e.button !== 0) return; // Solo primario
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
      };

      const cancelBtn = cancelBtnRef.current;
      const confirmBtn = confirmBtnRef.current;

      if (cancelBtn) cancelBtn.addEventListener('mousedown', handleCancelMouseDown);
      if (confirmBtn) confirmBtn.addEventListener('mousedown', handleConfirmMouseDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (cancelBtn) cancelBtn.removeEventListener('mousedown', handleCancelMouseDown);
        if (confirmBtn) confirmBtn.removeEventListener('mousedown', handleConfirmMouseDown);
      };
    }, [onClose, onConfirm]);

    // Overlay click
    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="file-manager2-modal-overlay"
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className="file-manager2-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="file-manager2-modal-title">{title}</div>
          <div className="file-manager2-modal-content">
            {children}
          </div>
          <div className="file-manager2-modal-footer">
            <button
              ref={cancelBtnRef}
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente para renderizar un elemento (archivo o carpeta) - CORREGIDO EL DROP TARGET
  const FileItem = React.memo(function FileItem({ item, depth = 0 }) {
    const isSelected = selectedItem === item.id;
    const isCut = !!item.isCut;
    const isDropTarget = dropTarget === item.id;
    const chevronRef = useRef(null);
    const itemRef = useRef(null);
    
    // Listener para el chevron (expandir/colapsar carpeta)
    useEffect(() => {
      const chevronElement = chevronRef.current;
      if (!chevronElement) return;
      
      const handleChevronMouseDown = (event) => {
        // Solo aceptar clicks primarios (izquierdo)
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        toggleExpand(item.id);
      };
      
      chevronElement.addEventListener('mousedown', handleChevronMouseDown);
      
      return () => {
        chevronElement.removeEventListener('mousedown', handleChevronMouseDown);
      };
    }, [item.id, toggleExpand]);

    // Listener para clics en el elemento
    useEffect(() => {
      const itemElement = itemRef.current;
      if (!itemElement) return;
      
      const handleItemClick = (event) => {
        // Solo aceptar clicks primarios (izquierdo)
        if (event.button !== 0) return;
        
        // Verificar si el clic fue en el área principal del elemento y no en el chevron
        const chevronElement = chevronRef.current;
        if (chevronElement && chevronElement.contains(event.target)) {
          // El clic fue en el chevron, ya está manejado por su propio listener
          return;
        }
        
        event.preventDefault();
        event.stopPropagation();
        console.log(`[FileManager2] Native click on item: ${item.name} (ID: ${item.id})`);
        selectItem(item.id);
      };
      
      itemElement.addEventListener('mousedown', handleItemClick);
      
      return () => {
        itemElement.removeEventListener('mousedown', handleItemClick);
      };
    }, [item.id, item.name, selectItem]);

    // Listener para contexto (click derecho)
    useEffect(() => {
      const itemElement = itemRef.current;
      if (!itemElement) return;
      
      const handleContextMenuEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
        selectItem(item.id); // También seleccionar al mostrar el menú contextual
        handleContextMenu(event, item.id);
      };
      
      itemElement.addEventListener('contextmenu', handleContextMenuEvent);
      
      return () => {
        itemElement.removeEventListener('contextmenu', handleContextMenuEvent);
      };
    }, [item.id, selectItem, handleContextMenu]);

    // Doble clic para expandir
    useEffect(() => {
      const itemElement = itemRef.current;
      if (!itemElement) return;
      
      const handleDoubleClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (item.type === 'folder') {
          toggleExpand(item.id);
        }
      };
      
      itemElement.addEventListener('dblclick', handleDoubleClick);
      
      return () => {
        itemElement.removeEventListener('dblclick', handleDoubleClick);
      };
    }, [item.id, item.type, toggleExpand]);
    
    // SOLUCIÓN MEJORADA PARA DRAG AND DROP
    useEffect(() => {
      if (!itemRef.current) return;
      
      // Asignar el ID del elemento al atributo de datos para la detección de drop targets
      const element = itemRef.current;
      
      // Importante: Asignar el ID del elemento como un atributo de datos para referencia
      element.setAttribute('data-item-id', item.id);
      
      // Para carpetas, marcarlas como objetivos válidos de drop
      if (item.type === 'folder') {
        element.classList.add('valid-drop-target');
        // Añadir un atributo de datos para indicar que es un folder
        element.setAttribute('data-folder', 'true');
      }
      
      // Inicializar arrastre manualmente
      const initDragStart = (e) => {
        if (e.button !== 0) return; // Solo botón izquierdo
        
        // Prevenir arrastre para clicks en el chevron
        if (chevronRef.current && chevronRef.current.contains(e.target)) {
          return;
        }
        
        // Usar setTimeout para estar seguros de que no interferimos con otros eventos
        setTimeout(() => {
          console.log(`[FileManager2] Manual dragStart for: ${item.id} - ${item.name}`);
          setDraggedItem(item.id);
          setIsDragging(true);
        }, 0);
      };
      
      element.addEventListener('mousedown', initDragStart);
      
      return () => {
        element.removeEventListener('mousedown', initDragStart);
      };
    }, [item.id, item.name, item.type, setDraggedItem, setIsDragging]);

    return (
      <div className="file-item-container">
        <div
          ref={itemRef}
          className={`file-item-row flex items-center p-1 ${isSelected ? 'file-item-selected bg-blue-100' : 'hover:bg-gray-100'} ${isCut ? 'opacity-50' : ''} ${isDropTarget ? 'file-item-drop-target' : ''}`}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {item.type === 'folder' && (
            <div
              ref={chevronRef}
              className="chevron-icon-wrapper mr-1 cursor-pointer"
              style={{ padding: '5px', zIndex: 1002 }}
            >
              {item.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
          <span className="mr-2 file-icon">
            {item.type === 'folder'
              ? <Folder size={16} className="text-yellow-500" />
              : <File size={16} className="text-gray-500" />}
          </span>
          <span className={`text-sm flex-1 truncate file-name ${isSelected ? 'font-semibold' : ''}`}>
            {item.name}
          </span>
        </div>
        {item.type === 'folder' && item.expanded && item.children && (
          <div className="file-children">
            {item.children.map(child => (
              <FileItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  });
  
  // Actualizamos el sistema de drag para mejorar la detección de folders como targets
  useEffect(() => {
    if (!isDragging || !draggedItem) return;
    
    // Mejorar la detección del drag
    const handleMouseMove = (e) => {
      // Mejorar la forma en que detectamos elementos bajo el cursor
      const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
      
      // Buscar primero carpetas específicas, luego el área general
      let foundDropTarget = null;
      
      // Función auxiliar para encontrar el elemento .file-item-row más cercano
      const findClosestFileItemRow = (element) => {
        if (!element) return null;
        
        // Si el elemento ya es un .file-item-row, devuélvelo
        if (element.classList.contains('file-item-row') && element.hasAttribute('data-item-id')) {
          return element;
        }
        
        // Sino, busca el ancestro más cercano que sea un .file-item-row
        return element.closest('.file-item-row');
      };
      
      // 1. Primero, buscar folders específicos bajo el cursor
      for (const el of elementsUnderCursor) {
        // Encontrar el elemento file-item-row más cercano (podría ser el mismo elemento o un ancestro)
        const fileItemRow = findClosestFileItemRow(el);
        
        if (fileItemRow && fileItemRow.hasAttribute('data-folder')) { 
          // Si es una carpeta, usarla como drop target
          const itemId = fileItemRow.getAttribute('data-item-id');
          
          // Solo cambiar el target si no es el mismo elemento arrastrado
          if (itemId && itemId !== draggedItem) {
            foundDropTarget = itemId;
            break; // Detenemos la búsqueda al encontrar un folder
          }
        }
      }
      
      // 2. Si no encontramos un folder específico, verificar si estamos sobre el área raíz
      if (!foundDropTarget) {
        for (const el of elementsUnderCursor) {
          if (el.classList.contains('file-manager-content')) {
            foundDropTarget = 'root';
            break;
          }
        }
      }
      
      // Solo actualizar si el target cambió
      if (foundDropTarget !== dropTarget) {
        console.log(`[FileManager2] Custom drag over: ${foundDropTarget || 'none'}`);
        setDropTarget(foundDropTarget);
      }
    };
    
    // Al soltar el botón del mouse terminamos el drag
    const handleMouseUp = (e) => {
      console.log('[FileManager2] Custom drag end');
      
      if (dropTarget) {
        console.log(`[FileManager2] Custom drop on: ${dropTarget}`);
        
        // Simular un drop con todos los datos necesarios
        const simulatedEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
          dataTransfer: {
            getData: () => draggedItem
          }
        };
        
        handleDrop(simulatedEvent, dropTarget === 'root' ? null : dropTarget);
      }
      
      // Limpiar el estado
      setIsDragging(false);
      setDraggedItem(null);
      setDropTarget(null);
      
      // Remover listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Agregar listeners mientras el drag está activo
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedItem, dropTarget, handleDrop, setDropTarget, setIsDragging, setDraggedItem]);

  // Agregamos estilos mejorados para el indicador visual de drop target
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .file-item-selected {
        background-color: #e0f2fe !important; /* Azul claro */
        font-weight: 600;
        border-radius: 4px;
        outline: 1px solid #60a5fa;
      }
      
      .file-item-drop-target {
        background-color: #dcfce7 !important; /* Verde claro */
        outline: 2px dashed #10b981 !important;
        z-index: 5;
      }
      
      .file-manager-root-drop-target {
        background-color: #f8fafc !important;
        outline: 2px dashed #10b981;
      }
      
      /* Mejorar el highlight de los folders como drop targets */
      .valid-drop-target {
        position: relative;
      }
      .valid-drop-target:hover {
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Función para mejorar la funcionalidad de copiar y pegar
  const handlePasteToRoot = useCallback(() => {
    if (!clipboard) return;
    // Modificado: pasteItem ahora maneja la lógica de conflicto y llama a handleShowConfirmDialog
    pasteItem(null); // Pegar en la raíz
  }, [clipboard, pasteItem]);

  // También necesitamos hacer lo mismo para los botones de la barra de herramientas
  useEffect(() => {
    // Referencias a los botones de la barra de herramientas
    const newFileBtn = document.querySelector('.file-manager2-toolbar .new-file-btn');
    const newFolderBtn = document.querySelector('.file-manager2-toolbar .new-folder-btn');
    const pasteRootBtn = document.querySelector('.file-manager2-toolbar .paste-root-btn');
    
    // Configurar listeners nativos
    const setupToolbarButton = (element, action) => {
      if (!element) return null;
      
      const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
      };
      
      element.addEventListener('mousedown', handleClick);
      return () => element.removeEventListener('mousedown', handleClick);
    };
    
    // Configurar los listeners
    const cleanups = [];
    
    if (newFileBtn) {
      cleanups.push(setupToolbarButton(newFileBtn, () => showCreateDialog('file', null)));
    }
    
    if (newFolderBtn) {
      cleanups.push(setupToolbarButton(newFolderBtn, () => showCreateDialog('folder', null)));
    }
    
    if (pasteRootBtn) {
      cleanups.push(setupToolbarButton(pasteRootBtn, handlePasteToRoot));
    }
    
    // Limpiar al desmontar
    return () => {
      cleanups.forEach(cleanup => cleanup && cleanup());
    };
  }, [showCreateDialog, handlePasteToRoot]); // Solo re-ejecutar si estas funciones cambian

  // Ejecutar acción después de la confirmación
  const executeConfirmedAction = useCallback(() => {
    const { type, itemId, targetId, clipboardItem, clipboardOperation: op, overwriteDetails, clipboardItemForPaste, clipboardOperationForPaste, originalItemId } = confirmAction;
    
    switch (type) {
      case 'delete':
        deleteItem(itemId);
        break;
      case 'copy':
        copyToClipboard(itemId);
        break;
      case 'move':
        moveToClipboard(itemId);
        break;
      case 'paste':
        // Determinar el item y la operación correctos (pueden venir de drag&drop o de clipboard normal)
        const itemForPaste = clipboardItem || clipboardItemForPaste;
        const operationForPaste = op || clipboardOperationForPaste;
        const existingIdToOverwrite = overwriteDetails ? overwriteDetails.existingItemId : null;
        
        if (itemForPaste && operationForPaste) {
          performActualPaste(targetId, itemForPaste, operationForPaste, existingIdToOverwrite);
        } else {
          console.warn("[FileManager2] Faltan datos del ítem o de la operación para la acción de pegar.");
        }
        break;
      case 'create':
        createNewItem();
        break;
      case 'rename':
        renameItem(itemId, newItemName);
        break;
      default:
        console.warn(`[FileManager2] Unknown action type: ${type}`);
        break;
    }
  }, [
    confirmAction, // Lo importante es que confirmAction es la dependencia, no sus propiedades
    newItemName,
    deleteItem,
    copyToClipboard,
    moveToClipboard,
    // pasteItemWithClipboard, // Reemplazado por performActualPaste
    // pasteItem, // pasteItem ahora solo prepara la acción
    createNewItem,
    renameItem,
    performActualPaste // Añadida dependencia
  ]);


  return (
    <div 
      className="file-manager2-container p-4"
      ref={fileManager2Ref}
      onClick={(e) => {
        // Solo deseleccionar si se hace clic directamente en el contenedor
        if (e.currentTarget === e.target) {
          setSelectedItem(null);
          setContextMenu(prev => ({ ...prev, visible: false }));
        }
      }}
    >
      <div className="border rounded-lg shadow-sm bg-white">
        <div className="bg-gray-100 p-2 border-b flex justify-between items-center file-manager2-toolbar">
          <h3 className="text-lg font-medium">Gestor de Archivos</h3>
          <div className="flex space-x-2">
            <button 
              className="p-1 hover:bg-gray-200 rounded flex items-center text-xs new-file-btn"
              // onClick removido, usando listeners nativos en su lugar
            >
              <FilePlus size={14} /> Archivo
            </button>
            <button 
              className="p-1 hover:bg-gray-200 rounded flex items-center text-xs new-folder-btn"
              // onClick removido, usando listeners nativos en su lugar
            >
              <FolderPlus size={14} /> Carpeta
            </button>
            {clipboard && (
              <button
                className="p-1 hover:bg-gray-200 rounded flex items-center text-xs paste-root-btn"
                // onClick removido, usando listeners nativos en su lugar
              >
                <Plus size={14} /> Pegar
              </button>
            )}
          </div>
        </div>
        
        <div 
          className={`p-2 min-h-64 max-h-96 overflow-auto file-manager-content ${dropTarget === 'root' ? 'file-manager-root-drop-target' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Clicked on file manager area');
          }}
        >
          {files.map(item => (
            <FileItem key={item.id} item={item} />
          ))}
        </div>
        
        <div className="bg-gray-50 p-2 border-t text-xs text-gray-500 file-manager-footer">
          {clipboard && (
            <p>
              {clipboardOperation === 'copy' ? 'Copiado: ' : 'Moviendo: '}
              {clipboard.name}
            </p>
          )}
          <div className="text-xs mt-1">
            <span className="font-semibold">Atajos:</span> Ctrl+C (Copiar), Ctrl+X (Cortar), Ctrl+V (Pegar), Del (Eliminar)
          </div>
        </div>
      </div>
      
      {/* Diálogo para crear nuevo elemento o renombrar existente */}
      {showNewItemDialog && (
        <Modal 
          title={confirmAction.type === 'rename' 
            ? 'Renombrar elemento' 
            // newItemType podría no estar actualizado si se abrió para renombrar
            : `Crear nuevo ${newItemType === 'file' ? 'archivo' : 'carpeta'}`}
          onClose={() => {
            setShowNewItemDialog(false);
            // Limpiar confirmAction si era para renombrar para evitar confusiones
            if (confirmAction.type === 'rename') {
              setConfirmAction({ type: '', itemId: null, targetId: null });
            }
          }}
          onConfirm={confirmAction.type === 'rename' ? executeConfirmedAction : createNewItem}
        >
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder={confirmAction.type === 'rename' 
              ? 'Nuevo nombre' 
              : `Nombre del ${newItemType === 'file' ? 'archivo' : 'carpeta'}`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            autoFocus
          />
        </Modal>
      )}
      
      {/* Diálogo de confirmación para acciones - MEJORAR CONTENIDO DEL MODAL */}
      {showConfirmDialog && (
        <Modal 
          title="Confirmar acción"
          onClose={() => {
            console.log("[FileManager2] Modal cerrado sin confirmar. Acción:", confirmAction);
            setShowConfirmDialog(false);
            setIsDragging(false); 
            const isMoveOperation = confirmAction.clipboardOperation === 'move' || (confirmAction.type === 'paste' && clipboardOperation === 'move');
            if (isMoveOperation && confirmAction.type === 'paste') {
              if (confirmAction.clipboardOperation === 'move') { 
                 setFiles(prevFiles => {
                    const newFiles = JSON.parse(JSON.stringify(prevFiles));
                    clearItemPropertyRecursive(newFiles, 'isCut'); 
                    return newFiles;
                  });
              }
            }
          }}
          onConfirm={() => {
            console.log("[FileManager2] Modal confirmado. Ejecutando acción:", confirmAction);
            executeConfirmedAction(); // Usar executeConfirmedAction, no memoizedExecuteConfirmedAction
            setShowConfirmDialog(false);
            setIsDragging(false); 
          }}
        >
          {(() => {
            const itemInfo = confirmAction.itemId ? findItemById(files, confirmAction.itemId) : null;
            let itemName = "";

            if (confirmAction.type === 'paste') {
              // Usar los datos de confirmAction, no del estado global clipboard
              const itemForDialog = confirmAction.clipboardItem || confirmAction.clipboardItemForPaste;
              itemName = itemForDialog ? itemForDialog.name : "elemento desconocido";
            } else {
              itemName = itemInfo ? itemInfo.item.name : "este elemento";
            }
            
            switch (confirmAction.type) {
              case 'delete':
                return <p>¿Estás seguro que deseas eliminar "{itemName}"?</p>;
              case 'copy':
                return <p>¿Copiar "{itemName}" al portapapeles?</p>;
              case 'move':
                return <p>¿Mover "{itemName}" al portapapeles (cortar)?</p>;
              case 'paste': {
                const itemToPasteName = confirmAction.clipboardItem?.name || confirmAction.clipboardItemForPaste?.name || "elemento desconocido";
                const currentOp = confirmAction.clipboardOperation || confirmAction.clipboardOperationForPaste || 'pegar';
                const operationDescription = currentOp === 'move' ? "Mover" : "Pegar";
                const targetInfo = confirmAction.targetId ? findItemById(files, confirmAction.targetId) : null;
                const targetName = targetInfo ? `la carpeta "${targetInfo.item.name}"` : "la raíz";

                if (confirmAction.overwriteDetails) {
                  const conflictingName = confirmAction.overwriteDetails.conflictingItemName || itemToPasteName;
                  return <p>Un elemento llamado "{conflictingName}" ya existe en {targetName}. ¿Deseas sobrescribirlo?</p>;
                }
                return <p>¿{operationDescription} "{itemToPasteName}" en {targetName}?</p>;
              }
              case 'create':
                return <p>¿Crear {newItemType === 'file' ? 'archivo' : 'carpeta'} "{newItemName}"?</p>;
              case 'rename':
                const originalItemName = itemInfo ? itemInfo.item.name : (confirmAction.originalItemId ? findItemById(files, confirmAction.originalItemId)?.item.name : "elemento desconocido");
                return <p>¿Renombrar "{originalItemName}" a "{newItemName}"?</p>;
              default:
                return <p>¿Confirmar esta acción?</p>;
            }
          })()}
        </Modal>
      )}
      
      {/* Menú contextual */}
      <ContextMenu />
      
      {/* Indicador visual del elemento arrastrado */}
      {isDragging && draggedItem && (
        <div 
          className="fixed pointer-events-none bg-blue-100 border border-blue-500 p-1 rounded opacity-70 z-50"
          style={{ 
            top: '20px',
            left: '20px',
            maxWidth: '200px'
          }}
        >
          {(() => {
            const draggedItemInfo = findItemById(files, draggedItem);
            return draggedItemInfo ? 
              <>
                {draggedItemInfo.item.type === 'folder' ? 
                  <Folder size={16} className="inline mr-1 text-yellow-500" /> : 
                  <File size={16} className="inline mr-1 text-gray-500" />
                }
                <span className="text-sm">{draggedItemInfo.item.name}</span>
              </> : 
              'Arrastrando...';
          })()}
        </div>
      )}
    </div>
  );
}