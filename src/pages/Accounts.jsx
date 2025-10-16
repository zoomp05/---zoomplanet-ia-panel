// AccountsPage.jsx
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNTS } from '../apollo/Account';
import AccountList from '../components/accounts/AccountList';
import AccountModal from '../components/accounts/AccountModal';
import { Button, Space, message, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import '../css/Account.css';

const AccountsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  const [filter, setFilter] = useState({
    search: '',
    status: null,
    type: null,
    showDeleted: false
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const { loading, error, data, refetch } = useQuery(GET_ACCOUNTS, {
    variables: {
      filter,
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize
    },
    fetchPolicy: 'cache-and-network',
  });

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setFilter(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusFilter = (status) => {
    setFilter(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  
  const handleCreate = () => {
    setSelectedAccount(null);
    setIsModalVisible(true);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setIsModalVisible(true);
  };

  const handleModalClose = (refreshList = false) => {
    setIsModalVisible(false);
    setSelectedAccount(null);
    if (refreshList) {
      refetch();
    }
  };

  
  const handleRefresh = async () => {
    try {
      await refetch();
      message.success('Account list updated successfully');
    } catch (err) {
      message.error('Failed to refresh accounts');
    }
  };


  return (
    <div className="accounts-page">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div className="page-header">
          <div className="page-title">
            <h1>Accounts</h1>
          </div>
          <Space>
            <Input.Search
              placeholder="Search accounts..."
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Status"
              allowClear
              onChange={handleStatusFilter}
              style={{ width: 120 }}
            >
              <Select.Option value="ACTIVE">Active</Select.Option>
              <Select.Option value="SUSPENDED">Suspended</Select.Option>
              <Select.Option value="CANCELLED">Cancelled</Select.Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={loading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create Account
            </Button>
          </Space>
        </div>
        <AccountList
          loading={loading}
          accounts={data?.accounts.edges || []}
          pagination={{
            ...pagination,
            total: data?.accounts.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} accounts`
          }}
          onChange={handleTableChange}
          onEdit={handleEdit}
        />
        <AccountModal
          visible={isModalVisible}
          account={selectedAccount}
          onClose={handleModalClose}
        />
      </Space>
    </div>
  );
};

export default AccountsPage;