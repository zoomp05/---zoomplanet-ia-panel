import React, { useState, useEffect } from "react";
import { Row, Col, Card, Table, Space, Button, Input, Popconfirm, Switch, Spin } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, QuestionCircleOutlined, UndoOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "react-hot-toast";
import { SOFT_DELETE_CONTACT_GROUP, RESTORE_CONTACT_GROUP, GET_CONTACT_GROUPS, ADD_CONTACTS_TO_GROUP, REMOVE_CONTACTS_FROM_GROUP } from "../apollo/contactGroup"; // Import REMOVE_CONTACTS_FROM_GROUP
import { GET_CONTACTS } from "../apollo/contact";
import ContactGroupModal from "../components/contactGroup/contactGroupModal";

const ContactGroupPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchContacts, setSearchContacts] = useState("");
  const [searchGroups, setSearchGroups] = useState(""); // New state for group search
  const [showDeleted, setShowDeleted] = useState(false);
  const [showWarning, setShowWarning] = useState(false); // New state for showing warning
  const [loadingAddAll, setLoadingAddAll] = useState(false); // New state for loading Add All button
  const [loadingRowSelection, setLoadingRowSelection] = useState(false); // New state for loading row selection
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [contactsPagination, setContactsPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [allSelectedContacts, setAllSelectedContacts] = useState(new Set());

  const { data: listsData, loading: loadingLists, refetch } = useQuery(GET_CONTACT_GROUPS, {
    variables: { 
      filter: { showDeleted, search: searchGroups },
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize
    }
  });
  const [softDelete] = useMutation(SOFT_DELETE_CONTACT_GROUP);
  const [restoreContactGroup] = useMutation(RESTORE_CONTACT_GROUP);
  const [addContactsToGroup] = useMutation(ADD_CONTACTS_TO_GROUP); // Add mutation for adding contacts to group
  const [removeContactsFromGroup] = useMutation(REMOVE_CONTACTS_FROM_GROUP); // Add mutation for removing contacts from group

  const { data: contactsData, loading: loadingContacts } = useQuery(GET_CONTACTS, {
    variables: { 
      filter: { search: searchContacts },
      limit: contactsPagination.pageSize,
      offset: (contactsPagination.current - 1) * contactsPagination.pageSize
    }
  });

  useEffect(() => {
    if (selectedList) {
      const contactIds = selectedList.contacts.map(contact => contact.id);
      setSelectedContacts(contactIds);
      setAllSelectedContacts(new Set(contactIds));
    } else {
      setSelectedContacts([]);
      setAllSelectedContacts(new Set());
    }
  }, [selectedList]);

  useEffect(() => {
    if (showWarning) {
      toast.error('Please select a group first');
      setShowWarning(false);
    }
  }, [showWarning]);

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await softDelete({ variables: { id } });

      if (!data?.softDeleteContactGroup) {
        throw new Error('Failed to delete group');
      }

      if (data.softDeleteContactGroup.__typename === 'ValidationError') {
        throw new Error(data.softDeleteContactGroup.message);
      }

      toast.success('Group deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      const { data } = await restoreContactGroup({ variables: { id } });

      if (!data?.restoreContactGroup) {
        throw new Error('Failed to restore group');
      }

      if (data.restoreContactGroup.__typename === 'ValidationError') {
        throw new Error(data.restoreContactGroup.message);
      }

      toast.success('Group restored successfully');
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddContactsToGroup = async (allContacts = false) => {
    if (!selectedList) {
      setShowWarning(true);
      return;
    }

    setLoadingAddAll(true);
    try {
      const contactsToAdd = allContacts ? contactsData.contacts.edges.map(contact => contact.id) : selectedContacts;
      const { data } = await addContactsToGroup({ variables: { groupId: selectedList.id, contactIds: contactsToAdd } });

      if (!data?.addContactsToGroup) {
        throw new Error('Failed to add contacts to group');
      }

      toast.success('Contacts added to group successfully');
      refetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingAddAll(false);
    }
  };

  const handleRowSelectionChange = async (selectedRowKeys, selectedRows) => {
    if (!selectedList) {
      setShowWarning(true);
      return;
    }

    setLoadingRowSelection(true);
    
    // Crear un nuevo Set con todos los contactos seleccionados
    const newAllSelected = new Set(allSelectedContacts);
    
    // Obtener los contactos actuales en la página
    const currentPageContactIds = contactsData?.contacts?.edges?.map(contact => contact.id) || [];
    
    // Determinar qué contactos fueron seleccionados/deseleccionados en la página actual
    currentPageContactIds.forEach(contactId => {
      if (selectedRowKeys.includes(contactId)) {
        newAllSelected.add(contactId);
      } else {
        newAllSelected.delete(contactId);
      }
    });

    // Determinar contactos añadidos y removidos
    const previousSelected = new Set(allSelectedContacts);
    const addedContacts = [...newAllSelected].filter(id => !previousSelected.has(id));
    const removedContacts = [...previousSelected].filter(id => !newAllSelected.has(id));

    // Procesar contactos añadidos
    if (addedContacts.length > 0) {
      try {
        const { data } = await addContactsToGroup({
          variables: {
            groupId: selectedList.id,
            contactIds: addedContacts
          }
        });
        if (!data?.addContactsToGroup) {
          throw new Error('Failed to add contacts to group');
        }
      } catch (error) {
        toast.error(error.message);
      }
    }

    // Procesar contactos removidos
    if (removedContacts.length > 0) {
      try {
        const { data } = await removeContactsFromGroup({
          variables: {
            groupId: selectedList.id,
            contactIds: removedContacts
          }
        });
        if (!data?.removeContactsFromGroup) {
          throw new Error('Failed to remove contacts from group');
        }
      } catch (error) {
        toast.error(error.message);
      }
    }

    setAllSelectedContacts(newAllSelected);
    setSelectedContacts(selectedRowKeys);
    refetch();
    setLoadingRowSelection(false);
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(newPagination);
  };

  const handleContactsTableChange = (newPagination, filters, sorter) => {
    setContactsPagination(newPagination);
  };

  const listColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Contacts',
      dataIndex: 'contacts',
      key: 'contacts',
      render: (contacts) => contacts?.length || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {showDeleted ? (
            <Button icon={<UndoOutlined />} onClick={() => handleRestore(record.id)} />
          ) : (
            <>
              <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
              <Popconfirm
                title="Delete Contact Group"
                description="Are you sure you want to delete this group?"
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  const handleModalClose = (refresh = false) => {
    setModalVisible(false);
    setSelectedGroup(null);
    if (refresh) refetch();
  };

  const contactColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  return (
    <Row gutter={16}>
      <Col span={10}>
        <Card title="Contact Groups" extra={<Switch checked={showDeleted} onChange={setShowDeleted} />}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space>
              <Input.Search
                placeholder="Search groups"
                onChange={(e) => setSearchGroups(e.target.value)}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Create Group
              </Button>
            </Space>
            <Table
              loading={loadingLists}
              dataSource={listsData?.contactGroups?.edges}
              columns={listColumns}
              rowKey="id"
              pagination={{
                ...pagination,
                total: listsData?.contactGroups?.totalCount,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`
              }}
              onChange={handleTableChange}
              onRow={(record) => ({
                onClick: () => setSelectedList(record),
                style: { cursor: 'pointer', backgroundColor: selectedList?.id === record.id ? '#e6f7ff' : 'inherit' } // Change cursor and highlight row
              })}
            />
          </Space>
        </Card>
      </Col>
      <Col span={14}>
        <Card
          title={selectedList ? `Contacts in ${selectedList.name}` : "Contacts"}
          extra={
            <Input.Search
              placeholder="Search contacts"
              onChange={(e) => setSearchContacts(e.target.value)}
            />
          }
        >
          <Popconfirm
            title="Add All Contacts"
            description="Are you sure you want to add all contacts to this group?"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleAddContactsToGroup(true)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              disabled={!selectedList || loadingAddAll}
            >
              {loadingAddAll ? <Spin /> : 'Add All Contacts to Group'}
            </Button>
          </Popconfirm>
          <Table
            loading={loadingContacts}
            dataSource={contactsData?.contacts?.edges}
            columns={contactColumns}
            rowKey="id"
            pagination={{
              ...contactsPagination,
              total: contactsData?.contacts?.totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} contacts`
            }}
            onChange={handleContactsTableChange}
            rowSelection={{
              selectedRowKeys: Array.from(allSelectedContacts),
              onChange: handleRowSelectionChange,
              getCheckboxProps: () => ({
                disabled: loadingRowSelection,
              }),
            }}
          />
        </Card>
      </Col>

      <ContactGroupModal
        visible={modalVisible}
        group={selectedGroup}
        onClose={handleModalClose}
      />
    </Row>
  );
};

export default ContactGroupPage;
