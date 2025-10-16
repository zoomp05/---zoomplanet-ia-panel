import React, { useState } from 'react';
import { Table, Space, Button, Tag, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { SOFT_DELETE_NEWSLETTER, GET_NEWSLETTERS } from '../../apollo/newsletter';
import { toast } from 'react-hot-toast';
import { useModuleNavigation } from '@hooks/useModuleNavigation';

const getStatusColor = (status) => {
  const statusColors = {
    DRAFT: 'default',
    SCHEDULED: 'processing',
    SENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'error'
  };
  return statusColors[status] || 'default';
};

const NewsletterList = () => {
  const { navigateContextual, getContextualLink } = useModuleNavigation();
  const [filter, setFilter] = useState({
    search: '',
    status: null,
    showDeleted: false
  });

  const { loading, data, refetch } = useQuery(GET_NEWSLETTERS, {
    variables: { filter }
  });

  console.log('data:', data);

  const [softDelete] = useMutation(SOFT_DELETE_NEWSLETTER, {
    onCompleted: () => {
      toast.success('Newsletter deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleDelete = async (id) => {
    try {
      await softDelete({ variables: { id } });
    } catch (error) {
      console.error('Error deleting newsletter:', error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigateContextual(`newsletter/edit/${record.id}`)}>{text}</a>
      )
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigateContextual(`newsletter/edit/${record.id}`)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigateContextual('create')}
          >
            Create Newsletter
          </Button>
          <Input.Search
            placeholder="Search newsletters..."
            onSearch={(value) => setFilter({ ...filter, search: value })}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setFilter({ ...filter, status: value })}
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'SCHEDULED', label: 'Scheduled' },
              { value: 'SENDING', label: 'Sending' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'FAILED', label: 'Failed' }
            ]}
          />
        </Space>

        <Table
          loading={loading}
          dataSource={data?.newsletters?.edges || []}
          columns={columns}
          rowKey="id"
        />
      </Space>
    </div>
  );
};

export default NewsletterList;