import React from 'react';
import { FileIcon, Trash2, Edit } from 'lucide-react';
import { Dropdown, Menu } from 'antd';

const FileList = ({ files, onDelete, onRename }) => {
  const renderFile = (file) => {
    const menuItems = {
      items: [
        {
          label: 'Rename',
          key: 'rename',
          icon: <Edit size={16} />,
          onClick: () => onRename(file)
        },
        {
          label: 'Delete',
          key: 'delete',
          icon: <Trash2 size={16} />,
          danger: true,
          onClick: () => onDelete(file)
        }
      ]
    };

    return (
      <div key={file.id} className="file-item">
        <Dropdown menu={menuItems} trigger={['contextMenu']}>
          <div className="file-header">
            <span className="file-icon">
              <FileIcon size={16} />
            </span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">{file.size}</span>
          </div>
        </Dropdown>
      </div>
    );
  };

  return (
    <div className="file-list">
      {files?.map(file => renderFile(file))}
    </div>
  );
};

export default FileList;
