import React, { useState } from 'react';
import PermissionList from '../components/permissions/PermissionList';
import PermissionModal from '../components/permissions/PermissionModal';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const PermissionsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  
  const handleCreate = () => {
    setSelectedPermission(null);
    setIsModalVisible(true);
  };

  const handleEdit = (permission) => {
    setSelectedPermission(permission);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPermission(null);
  };


  return (
    <div className="permissions-page">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div className="page-header">
          <h1>Permisos</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            Crear Permiso
          </Button>
        </div>

        <PermissionList 
          onEdit={handleEdit}
        />

        <PermissionModal
          visible={isModalVisible}
          permission={selectedPermission}
          onClose={handleModalClose}
        />
      </Space>
    </div>
  );
};

export default PermissionsPage;
