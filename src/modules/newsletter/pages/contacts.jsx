import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CONTACTS } from '../apollo/contact';
import ContactList from '../components/contact/contactList';
import ContactModal from '../components/contact/contactModal';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

let contactsQueryCount = 0;
const ContactsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    type: null,
    status: null,
    showDeleted: false
  });
  const [sort, setSort] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  contactsQueryCount++;
  console.log(`[ContactsPage] Consulta de contactos #${contactsQueryCount}`, {
    filter,
    sort,
    limit: pagination.pageSize,
    offset: (pagination.current - 1) * pagination.pageSize
  });
  const { loading, error, data, refetch } = useQuery(GET_CONTACTS, {
    variables: {
      filter,
      sort,
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize
    },
    fetchPolicy: 'cache-and-network',
  });

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    // Actualizar ordenamiento si el usuario hace click en el sorter
    if (sorter && sorter.field && sorter.order) {
      const direction = sorter.order === 'ascend' ? 'ASC' : 'DESC';
      let field = sorter.field.toUpperCase();
      if (field === 'GENERATEDAT') field = 'GENERATED_AT';
      setSort({ field, direction });
    } else {
      setSort(null);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilter(prev => ({
      ...prev,
      ...newFilters
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCreate = () => {
    setSelectedContact(null);
    setIsModalVisible(true);
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setIsModalVisible(true);
  };

  const handleModalClose = (refreshList = false) => {
    setIsModalVisible(false);
    setSelectedContact(null);
    if (refreshList) refetch();
  };

  return (
    <div className="contacts-page">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div className="page-header">
          <div className="page-title">
            <h1>Contacts</h1>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create Contact
          </Button>
        </div>

        <ContactList
          loading={loading}
          contacts={data?.contacts.edges || []}
          filters={filter}
          onFilterChange={handleFilterChange}
          pagination={{
            ...pagination,
            total: data?.contacts.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} contacts`
          }}
          onChange={handleTableChange}
          onEdit={handleEdit}
          onRefresh={refetch}
        />

        <ContactModal
          visible={isModalVisible}
          contact={selectedContact}
          onClose={handleModalClose}
        />
      </Space>
    </div>
  );
};

export default ContactsPage;