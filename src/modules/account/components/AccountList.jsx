import React from 'react';
import { Table, Space, Button, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { DELETE_ACCOUNT } from '../apollo/account';
import { toast } from 'react-hot-toast';

const AccountList = ({ loading, accounts, onEdit, onRefresh }) => {
  const [deleteAccount] = useMutation(DELETE_ACCOUNT);

  const handleDelete = async (id) => {
    try {
      await deleteAccount({ variables: { id } });
      toast.success('Account deleted successfully');
      onRefresh && onRefresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'PERSONAL' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Plan',
      dataIndex: ['subscription', 'plan'],
      key: 'plan',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      columns={columns}
      dataSource={accounts}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default AccountList;