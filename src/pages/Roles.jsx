// src/pages/Roles.jsx
import React, { useState } from 'react';
import RoleList from '../components/role/RoleList';
import RoleModal from '../components/role/RoleModal';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const RolesPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsModalVisible(true);
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRole(null);
  };

  return (
    <div className="roles-page">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div className="page-header">
          <h1>Roles</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Crear Rol
          </Button>
        </div>
        <RoleList onEdit={handleEdit} />
        <RoleModal
          visible={isModalVisible}
          role={selectedRole}
          onClose={handleModalClose}
        />
      </Space>
    </div>
  );
};

export default RolesPage;