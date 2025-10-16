// src/components/user/UserList.jsx
import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, DELETE_SOFT_USER, RESTORE_USER } from "../../apollo/user";
import { Modal, Table, Space, Input, Select, Button, Switch, Tag } from "antd";
import { toast } from "react-hot-toast";
import {
  KeyOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileModal from "./UserProfileModal";

const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;

const UserList = ({ onEdit }) => {
  const [filters, setFilters] = useState({
    search: "",
    status: null,
    role: null,
    page: 1,
    pageSize: 10,
    sortField: "createdAt",
    sortOrder: "DESC",
    showDeleted: false,
  });

  const [deletingUserId, setDeletingUserId] = useState(null);
  const [restoringUserId, setRestoringUserId] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { loading, error, data } = useQuery(GET_USERS, {
    variables: {
      filter: {
        ...filters,
        ...(!filters.search && { search: undefined }),
        ...(!filters.status && { status: undefined }),
        ...(!filters.role && { role: undefined }),
      },
      limit: filters.pageSize,
      offset: (filters.page - 1) * filters.pageSize,
    },
  });

  const [deleteSoftUser, { loading: deleteSoftLoading }] = useMutation(DELETE_SOFT_USER, {
    refetchQueries: [GET_USERS, "users"],
    awaitRefetchQueries: true,
  });

  const [restoreUser] = useMutation(RESTORE_USER, {
    refetchQueries: [GET_USERS, "users"],
    awaitRefetchQueries: true,
  });

  const handleFiltersChange = (newFilters) => {
    console.log("New filters:", newFilters);
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sorter.field || "createdAt",
      sortOrder: sorter.order === "ascend" ? "ASC" : "DESC",
    }));
  };

  const handleDelete = async (record) => {

    console.log("Deleting user with ID:", record.id);

    confirm({
        title: "¿Está seguro de eliminar este usuario?",
        icon: <ExclamationCircleOutlined />,
        content: `Se eliminará el usuario: ${record.name || record.email}`,
        okText: "Sí",
        okType: "danger",
        cancelText: "No",
        async onOk() {
            setDeletingUserId(record.id);
            try {
              const { data } = await deleteSoftUser({ variables: { id: record.id } });
              if (data.deleteSoftUser.__typename === "NotFoundError") {
                toast.error(data.deleteSoftUser.message);
                return;
              }
              toast.success("User soft-deleted successfully");
            } catch (error) {
              toast.error("Error soft-deleting user");
            } finally {
              setDeletingUserId(null);
            }
        },
        onCancel() {
          console.log("Cancel");
        },
      });
      
   
  };

  const handleRestore = async (id) => {
    setRestoringUserId(id);
    try {
      const { data } = await restoreUser({ variables: { id } });
      if (data?.restoreUser.__typename === "NotFoundError") {
        toast.error(data.restoreUser.message);
        return;
      }
      toast.success("User restored successfully!");
    } catch (error) {
      toast.error("Error restoring user");
    } finally {
      setRestoringUserId(null);
    }
  };

  const handlePasswordChange = (user) => {
    setSelectedUser(user);
    setPasswordModalVisible(true);
  };

  const handlePasswordModalClose = () => {
    setPasswordModalVisible(false);
    setSelectedUser(null);
  };

  const handleProfileEdit = (user) => {
    setSelectedUser(user);
    setIsProfileModalVisible(true);
  };


  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        role ? <Tag color="blue" key={role.id}>{role.name}</Tag> : <Tag>-</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        filters.showDeleted ? (
          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => handleRestore(record.id)}
            loading={restoringUserId === record.id}
            size="small"
          >
            Restore
          </Button>
        ) : (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            >
              Edit
            </Button>
            <Button
              icon={<KeyOutlined />}
              onClick={() => handlePasswordChange(record)}
              size="small"
            >
              Change Password
            </Button>
            <Button
                icon={ <UserOutlined /> } 
                onClick={() => handleProfileEdit(record)}
                size="small"
            >
              Edit Profile
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              //loading={deletingUserId === record.id}
              loading={deleteSoftLoading && record.id === deletingUserId}
              size="small"
            >
              Delete
            </Button>
          </Space>
        ),
    },
  ];

  //if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Search by name or email"
          allowClear
          onSearch={(value) => handleFiltersChange({ search: value })}
          style={{ width: 300 }}
        />
        <Select
          allowClear
          placeholder="Filter by Status"
          style={{ width: 200 }}
          onChange={(value) => handleFiltersChange({ status: value })}
        >
          <Option value={null}>All</Option>
          <Option value="ACTIVE">Active</Option>
          <Option value="INACTIVE">Inactive</Option>
        </Select>
        <Space>
          <span>Show Deleted</span>
          <Switch
            checked={filters.showDeleted}
            onChange={(checked) =>
              setFilters({ ...filters, showDeleted: checked, page: 1 })
            }
          />
        </Space>
      </Space>

      <Table
        loading={loading}
        columns={columns}
        dataSource={data?.users.edges}
        rowKey="id"
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: data?.users.totalCount,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`,
        }}
        onChange={handleTableChange}
        size="middle"
      />

      <ChangePasswordModal
        visible={passwordModalVisible}
        user={selectedUser}
        onClose={handlePasswordModalClose}
        passwordLevel="low"
      />

      <ProfileModal
        visible={isProfileModalVisible}
        user={selectedUser}
        onClose={() => setIsProfileModalVisible(false)}
      />
    </div>
  );
};

export default UserList;
