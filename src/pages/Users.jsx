// src/pages/Users.jsx
import React, { useState } from 'react';
import UserList from '@modules/user/components/user/UserList.jsx';
import UserModal from '@modules/user/components/user/UserModal.jsx';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const UsersPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalVisible(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Users</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create User
          </Button>
        </div>
        <UserList onEdit={handleEdit} />
        <UserModal
          visible={isModalVisible}
          user={selectedUser}
          onClose={handleModalClose}
        />
      </Space>
    </div>
  );
};

export default UsersPage;
