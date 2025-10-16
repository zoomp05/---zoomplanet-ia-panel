import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ROLES } from "../../apollo/role";
import { DELETE_SOFT_ROLE, RESTORE_ROLE } from "../../apollo/role"; // Import mutations
import { Modal, Table, Tag, Space, Input, Select, Button, Switch } from "antd";
import { toast } from "react-hot-toast";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;

const RoleList = ({ onEdit }) => {
  const [filters, setFilters] = useState({
    search: "",
    isSystem: false,
    scope: null,
    page: 1,
    pageSize: 10,
    sortField: "createdAt",
    sortOrder: "DESC",
    showDeleted: false,
  });

  //const [showDeleted, setShowDeleted] = useState(false); // State for showDeleted filter
  const [deletingRoleId, setDeletingRoleId] = useState(null);
  const [restoringRoleId, setRestoringRoleId] = useState(null);

  const { loading, error, data } = useQuery(GET_ROLES, {
    variables: {
      filter: {
        ...filters,
        ...(!filters.search && { search: undefined }),
        ...(!filters.isSystem && { isSystem: undefined }),
        ...(!filters.scope && { scope: undefined }),
      },
      limit: filters.pageSize,
      offset: (filters.page - 1) * filters.pageSize,
    },
  });

  const [deleteSoftRole, { loading: deleteLoading }] = useMutation(
    DELETE_SOFT_ROLE,
    {
      refetchQueries: [GET_ROLES, "roles"],
      awaitRefetchQueries: true,
    }
  );
  const [restoreRole, { loading: restoreLoading }] = useMutation(RESTORE_ROLE, {
    refetchQueries: [GET_ROLES, "roles"],
    awaitRefetchQueries: true,
  });

  const handleFiltersChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset page when filters change
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

  const handleDelete = async (id) => {
    setDeletingRoleId(id);
    try {
      const { data } = await deleteSoftRole({ variables: { id } });
      if (data.deleteSoftRole.__typename === "NotFoundError") {
        toast.error(data.deleteSoftRole.message);
        return;
      }

      toast.success("Role soft-deleted successfully");
    } catch (error) {
      console.error("Error deleting Role:", error);
      toast.error("Error soft-deleting role");
    } finally {
      setDeletingRoleId(null);
    }
  };

  const handleRestore = async (id) => {
    setRestoringRoleId(id);

    try {
      const { data } = await restoreRole({ variables: { id } });
      if (data?.restoreRole.__typename === "NotFoundError") {
        toast.error(data.restoreRole.message);
        return;
      }
      toast.success("Role restored successfully!");
    } catch (error) {
      console.error("Error restoring role:", error);
      toast.error("Error restoring role");
    } finally {
      setRestoringRoleId(null);
    }
  };

  const showDeleteSoftConfirm = (record) => {
    console.log("Soft delete", record.id);
    confirm({
      title: "Are you sure you want to soft-delete this role?",
      icon: <ExclamationCircleOutlined />,
      content: "This action can be undone by restoring the role.", // Clarify soft delete
      okText: "Sí",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        await handleDelete(record.id);
      },
      onCancel() {
        console.log("Soft delete canceled");
      },
    });
  };

  const showRestoreConfirm = (record) => {
    confirm({
      title: "Are you sure you want to restore this role?",
      icon: <CheckCircleOutlined />, // A more appropriate icon
      content: `Role ${record.name} will be restored.`,
      onOk: async () => {
        await handleRestore(record.id);
      },
      onCancel() {
        console.log("Restore canceled");
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions) => (
        <>
          {permissions.map((permission) => (
            <Tag color="blue" key={permission.id}>
              {permission.code} {/* Ideally, display permission name here */}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "System Role?",
      dataIndex: "isSystem",
      key: "isSystem",
      render: (text) => (text ? "Yes" : "No"),
      sorter: (a, b) => a.isSystem - b.isSystem, // This sorts booleans correctly
    },
    {
      title: "Scope",
      dataIndex: "scope",
      key: "scope",
      sorter: (a, b) => a.scope.localeCompare(b.scope),
      filters: [
        { text: "GLOBAL", value: "GLOBAL" },
        { text: "ACCOUNT", value: "ACCOUNT" },
        { text: "PROJECT", value: "PROJECT" },
      ],
      onFilter: (value, record) => record.scope.indexOf(value) === 0,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        filters.showDeleted ? (
          <Space size="middle">
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => showRestoreConfirm(record)}
              loading={restoreLoading && record.id === restoringRoleId}
              size="small"
            >
              Restore
            </Button>
          </Space>
        ) : (
          <Space size="middle">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            >
              Edit
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteSoftConfirm(record)}
              size="small"
              loading={deleteLoading && record.id === deletingRoleId}
            >
              Soft Delete
            </Button>
          </Space>
        ),
    },
  ];

  //if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Search by name or description"
          allowClear
          onSearch={(value) => handleFiltersChange({ search: value })}
          style={{ width: 300 }}
        />
        <Select
          allowClear
          placeholder="Filter by System Role"
          style={{ width: 200 }}
          value={filters.isSystem}
          onChange={(value) => handleFiltersChange({ isSystem: value })}
        >
          <Option value={null}>All</Option> {/* Added option for 'All' */}
          <Option value={true}>Yes</Option>
          <Option value={false}>No</Option>
        </Select>
        <Select
          allowClear
          placeholder="Filter by Scope"
          style={{ width: 200 }}
          onChange={(value) => handleFiltersChange({ scope: value })}
          value={filters.scope}
        >
          <Option value={null}>All</Option> {/* Added option for 'All' */}
          <Option value="GLOBAL">GLOBAL</Option>
          <Option value="ACCOUNT">ACCOUNT</Option>
          <Option value="PROJECT">PROJECT</Option>
        </Select>

        <Space style={{ marginBottom: 16 }}>
          <span style={{ marginRight: "10px" }}>Show Deleted</span>

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
        dataSource={data?.roles.edges}
        rowKey="id"
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: data?.roles.totalCount,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} roles`,
        }}
        onChange={handleTableChange}
        size="middle"
      />
    </div>
  );
};

export default RoleList;
