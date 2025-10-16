import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, FolderPlus, Trash2, RotateCcw } from 'lucide-react';

const initialFiles = {
  name: 'root',
  type: 'folder',
  children: [
    {
      name: 'Trash',
      type: 'folder',
      children: [],
      isTrash: true,
    },
    {
      name: 'Documents',
      type: 'folder',
      children: [
        { name: 'work.txt', type: 'file' },
        { name: 'resume.pdf', type: 'file' },
      ],
    },
    {
      name: 'Pictures',
      type: 'folder',
      children: [
        { name: 'vacation.jpg', type: 'file' },
        { name: 'family.jpg', type: 'file' },
      ],
    },
    { name: 'notes.txt', type: 'file' },
  ],
};

const FileManager = () => {
  const [files, setFiles] = useState(initialFiles);
  const [selectedPath, setSelectedPath] = useState([]);
  const [creatingType, setCreatingType] = useState(null);
  const [trashContents, setTrashContents] = useState([]);

  const handleSelect = (path) => {
    setSelectedPath(path);
  };

  const handleCreateItem = (name) => {
    const updatedFiles = { ...files };
    let target = updatedFiles;

    selectedPath.forEach((part) => {
      target = target.children.find((child) => child.name === part);
    });

    if (target && target.type === 'folder') {
      target.children.push({ name, type: creatingType, children: creatingType === 'folder' ? [] : undefined });
    }

    setFiles(updatedFiles);
    setCreatingType(null);
    setSelectedPath([...selectedPath, name]); // Mantener selección en el nuevo directorio
  };

  const handleMoveToTrash = (path) => {
    const updatedFiles = { ...files };
    let target = updatedFiles;
    let parent = null;
    let index = -1;

    path.forEach((part, idx) => {
      if (idx === path.length - 1) {
        index = target.children.findIndex((child) => child.name === part);
      } else {
        parent = target;
        target = target.children.find((child) => child.name === part);
      }
    });

    if (index !== -1) {
      const removedItem = target.children.splice(index, 1)[0];
      setTrashContents([...trashContents, { ...removedItem, originalPath: path.slice(0, -1) }]);
      setFiles(updatedFiles);
    }
  };

  const handleRestoreFromTrash = (name) => {
    const restoredItem = trashContents.find((item) => item.name === name);
    if (!restoredItem) return;

    const updatedFiles = { ...files };
    let target = updatedFiles;

    restoredItem.originalPath.forEach((part) => {
      target = target.children.find((child) => child.name === part);
    });

    if (target && target.type === 'folder') {
      target.children.push({ ...restoredItem });
    }

    setFiles(updatedFiles);
    setTrashContents(trashContents.filter((item) => item.name !== name));
  };

  return (
    <div>
      <FileTree 
        files={files} 
        selectedPath={selectedPath} 
        onSelect={handleSelect} 
        onMoveToTrash={handleMoveToTrash}
        onRestoreFromTrash={handleRestoreFromTrash}
      />
      {creatingType && (
        <CreateNewItem 
          onSubmit={handleCreateItem} 
          onCancel={() => setCreatingType(null)} 
          type={creatingType} 
          level={selectedPath.length} 
        />
      )}
    </div>
  );
};

const FileTree = ({ files, selectedPath, onSelect, onMoveToTrash, onRestoreFromTrash }) => {
  return (
    <div>
      {files.children.map((item) => (
        <FileTreeItem 
          key={item.name} 
          item={item} 
          level={0} 
          selectedPath={selectedPath} 
          onSelect={onSelect} 
          onMoveToTrash={onMoveToTrash}
          onRestoreFromTrash={onRestoreFromTrash}
        />
      ))}
    </div>
  );
};

const FileTreeItem = ({ item, level, selectedPath, onSelect, onMoveToTrash, onRestoreFromTrash }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedPath.join('/') === item.name;

  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        onClick={() => onSelect([item.name])}
      >
        {item.type === 'folder' ? (
          <>
            {isOpen ? <ChevronDown className="w-4 h-4 mr-2" onClick={() => setIsOpen(!isOpen)} /> : <ChevronRight className="w-4 h-4 mr-2" onClick={() => setIsOpen(!isOpen)} />}
            <Folder className="w-4 h-4 text-yellow-500 mr-2" />
          </>
        ) : (
          <FileText className="w-4 h-4 text-gray-500 mr-2" />
        )}
        <span>{item.name}</span>
        {item.isTrash ? (
          <button className="ml-auto text-red-500" onClick={() => onRestoreFromTrash(item.name)}>
            <RotateCcw className="w-4 h-4" />
          </button>
        ) : (
          <button className="ml-auto text-gray-500" onClick={() => onMoveToTrash([item.name])}>
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {isOpen && item.children && (
        <div className="ml-4">
          {item.children.map((child) => (
            <FileTreeItem 
              key={child.name} 
              item={child} 
              level={level + 1} 
              selectedPath={selectedPath} 
              onSelect={onSelect} 
              onMoveToTrash={onMoveToTrash}
              onRestoreFromTrash={onRestoreFromTrash}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CreateNewItem = ({ onSubmit, onCancel, type, level }) => {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedName = name.trim();
      if (trimmedName) onSubmit(trimmedName);
      else onCancel();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="py-1">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Nuevo ${type === 'folder' ? 'directorio' : 'archivo'}`}
        className="text-sm border rounded px-2 py-1 w-full"
      />
    </div>
  );
};

export default FileManager;
