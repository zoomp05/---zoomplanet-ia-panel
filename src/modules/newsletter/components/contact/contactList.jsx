import React, { useState } from 'react';
import { Table, Space, Button, Tag, Input, Select, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { DELETE_SOFT_CONTACT, RESTORE_CONTACT } from '../../apollo/contact';
import { toast } from 'react-hot-toast';

const { Search } = Input;
const { Option } = Select;

const ContactList = ({ loading, contacts, filters, pagination, onChange, onEdit, onRefresh, onFilterChange }) => {
  const [deletingContactId, setDeletingContactId] = useState(null);
  const [restoringContactId, setRestoringContactId] = useState(null);

  const [softDeleteContact] = useMutation(DELETE_SOFT_CONTACT, {
    onCompleted: onRefresh
  });

  const [restoreContact] = useMutation(RESTORE_CONTACT, {
    onCompleted: onRefresh
  });

  const handleDelete = async (id) => {
    setDeletingContactId(id);
    try {
      await softDeleteContact({ variables: { id } });
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error('Error deleting contact');
    } finally {
      setDeletingContactId(null);
    }
  };

  const handleRestore = async (id) => {
    setRestoringContactId(id);
    try {
      await restoreContact({ variables: { id } });
      toast.success('Contact restored successfully');
    } catch (error) {
      toast.error('Error restoring contact');
    } finally {
      setRestoringContactId(null);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',  // Cambiar de ['name'] a 'name'
      key: 'name',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',  // Cambiar de ['email'] a 'email'
      key: 'email',
      sorter: true,
    },
    {
      title: 'WhatsApp',
      dataIndex: 'whatsapp',  // Cambiar de ['whatsapp'] a 'email'
      key: 'whatsapp',
      sorter: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',  // Cambiar de ['type'] a 'type'
      key: 'type',
      render: (type) => (
        <Tag color={type === 'CUSTOMER' ? 'green' : 'blue'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',  // Cambiar de ['status'] a 'status'
      key: 'status',
      render: (status) => {
        const colors = {
          ACTIVE: 'green',
          UNSUBSCRIBED: 'orange',
          BOUNCED: 'red',
          COMPLAINED: 'red'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <>
          {tags?.map(tag => (
            <Tag key={tag.id} color={tag.color}>{tag.name}</Tag> // Cambiar tag.text por tag.name
          ))}
        </>
      )
    },
      {
        title: 'Generado el',
        dataIndex: 'generatedAt',
        key: 'generatedAt',
        sorter: true,
        render: (date) => date ? new Date(date).toLocaleDateString() : ''
      },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        filters.showDeleted ? (
          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => handleRestore(record.id)}
            loading={restoringContactId === record.id}
          >
            Restore
          </Button>
        ) : (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              loading={deletingContactId === record.id}
            />
          </Space>
        )
      ),
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Search by name or email"
          allowClear
          onSearch={(value) => onFilterChange({ search: value })}
          style={{ width: 300 }}
        />
        <Select
          allowClear
          placeholder="Filter by Type"
          style={{ width: 200 }}
          onChange={(value) => onFilterChange({ type: value })}
        >
          <Option value="LEAD">Lead</Option>
          <Option value="CUSTOMER">Customer</Option>
          <Option value="SUBSCRIBER">Subscriber</Option>
          <Option value="PARTNER">Partner</Option>
        </Select>
        <Select
          allowClear
          placeholder="Filter by Status"
          style={{ width: 200 }}
          onChange={(value) => onFilterChange({ status: value })}
        >
          <Option value="ACTIVE">Active</Option>
          <Option value="UNSUBSCRIBED">Unsubscribed</Option>
          <Option value="BOUNCED">Bounced</Option>
          <Option value="COMPLAINED">Complained</Option>
        </Select>
        <Space>
          <span>Show Deleted</span>
          <Switch
            checked={filters.showDeleted}
            onChange={(checked) => onFilterChange({ showDeleted: checked })}
          />
        </Space>
      </Space>

      <Table
        loading={loading}
        columns={columns}
        dataSource={contacts}
        rowKey="id"
        pagination={pagination}
        onChange={onChange}
      />
    </div>
  );
};

export default ContactList;