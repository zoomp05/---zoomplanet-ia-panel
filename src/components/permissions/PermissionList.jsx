import React, { useState } from "react";
import { Table, Space, Button, Modal, Input, Select, Tag, Switch } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  GET_PERMISSIONS,
  DELETE_PERMISSION,
  DELETE_SOFT_PERMISSION,
  RESTORE_PERMISSION,
} from "../../apollo/permission";
import { toast } from "react-hot-toast";
import {
  RESOURCES,
  ACTIONS,
  formatEnumValue,
} from "../../constants/permissions";
import "../../css/Permission.css";

const { confirm } = Modal;
const { Search } = Input;

const getActionColor = (action) => {
  const colors = {
    CREATE: "green",
    READ: "blue",
    UPDATE: "orange",
    DELETE: "red",
    MANAGE: "purple",
    LIST: "cyan",
    ASSIGN: "geekblue",
  };
  return colors[action] || "default";
};

const PermissionList = ({ onEdit }) => {

  // Mover el estado de los filtros aquí
  const [filters, setFilters] = useState({
    search: "",
    resource: null,
    action: null,
    page: 1,
    pageSize: 10,
    sortField: "createdAt",
    sortOrder: "DESC",
    showDeleted: false, // Add showDeleted filter
  });

  const [deletingPermissionId, setDeletingPermissionId] = useState(null); // Add this line
  const [restoringPermissionId, setRestoringPermissionId] = useState(null); // Add this line

  const { loading, data } = useQuery(GET_PERMISSIONS, {
    variables: {
      filter: {
        ...filters,
        ...(!filters.search && { search: undefined }),
        ...(!filters.resource && { resource: undefined }),
        ...(!filters.action && { action: undefined }),
      },
    },
  });

  const [restorePermission, { loading: restoreLoading }] = useMutation(
    RESTORE_PERMISSION,
    {
      refetchQueries: [GET_PERMISSIONS, "permissions"],
      awaitRefetchQueries: true,
    }
  );

  if (!loading) console.log(" DATA LOADED ", data);

  const [deletePermission, { loading: deleteLoading }] = useMutation(
    DELETE_PERMISSION,
    {
      refetchQueries: [
        GET_PERMISSIONS, // DocumentNode object parsed with gql
        "permissions", // Query name
      ],
    }
  );

  const [deleteSoftPermission, { loading: deleteSoftLoading }] = useMutation(
    DELETE_SOFT_PERMISSION,
    {
      refetchQueries: [GET_PERMISSIONS, "permissions"], // Assuming "permissions" is the name of your query
      awaitRefetchQueries: true, // Ensure the refetch completes before continuing
    }
  );

  const handleFiltersChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset página al cambiar filtros
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

  /*const showDeleteConfirm = (permission) => {
    confirm({
      title: "¿Está seguro de eliminar este permiso?",
      icon: <ExclamationCircleOutlined />,
      content: `Se eliminará el permiso: ${permission.name}`,
      okText: "Sí",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        try {
          await deletePermission({
            variables: { id: permission.id },
          });
          toast.success("Permiso eliminado correctamente");
          //refreshData();
        } catch (error) {
          toast.error(error.message);
        }
      },
    });
  };*/

  const showDeleteSoftConfirm = (record) => {
    confirm({
      title: "¿Está seguro de eliminar este permiso?",
      icon: <ExclamationCircleOutlined />,
      content: `Se eliminará el permiso: ${record.name}`,
      okText: "Sí",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        setDeletingPermissionId(record.id);
        try {
          const { data } = await deleteSoftPermission({
            variables: { id: record.id },
          });

          if (data?.deleteSoftPermission.__typename === "NotFoundError") {
            toast.error(data.deleteSoftPermission.message);
            return;
          }
          if (data?.deleteSoftPermission.__typename === "ValidationError") {
            toast.error(data.deleteSoftPermission.message);
            return;
          }

          toast.success("Permission soft-deleted successfully"); // Indicate soft delete
        } catch (error) {
          console.error("Error soft-deleting permission:", error);
          toast.error("Error soft-deleting permission");
        } finally {
          setDeletingPermissionId(null); // Clear deleting ID after mutation, regardless of success/failure
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleDeletePermanent = async (id) => {
    try {
      const { data } = await deletePermission({ variables: { id } });
      toast.success("Permission permanently deleted!");
    } catch (error) {
      toast.error("Error permanently deleting permission");
    }
  };

  const handleRestore = async (id) => {
    try {
      const { data } = await restorePermission({ variables: { id } });

      if (data.restorePermission.__typename === "NotFoundError") {
        toast.error(data.restorePermission.message);
        return;
      }

      toast.success("Permission restored successfully!");
    } catch (error) {
      console.error("Error restoring permission:", error);
      toast.error("Error restoring permission");
    }
  };

  const showRestoreConfirm = (record) => {
    confirm({
      title: "Are you sure you want to restore this permission?",
      icon: <CheckCircleOutlined />, // A more appropriate icon
      content: `Permission ${record.name} will be restored.`,
      async onOk() {
        setRestoringPermissionId(record.id);
        try {
          await handleRestore(record.id);
        } finally {
          setRestoringPermissionId(null); // Clear restoring ID after mutation, regardless of success/failure
        }
      },
      onCancel() {
        console.log("Restore canceled");
      },
    });
  };

  const showPermanentDeleteConfirm = (record) => {
    confirm({
      title: "Are you sure you want to permanently delete this permission?",
      icon: <ExclamationCircleOutlined />,
      content: `Permission ${record.name} will be permanently deleted. This action cannot be undone.`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        setDeletingPermissionId(record.id); // Set deleting ID before mutation
        try {
          await handleDeletePermanent(record.id);
        } finally {
          setDeletingPermissionId(null); // Clear deleting ID after mutation, regardless of success/failure
        }
      },
      onCancel() {
        console.log("Permanent delete canceled");
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
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
      sorter: (a, b) => a.resource.localeCompare(b.resource),
      render: (text) => formatEnumValue(text),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      sorter: (a, b) => a.action.localeCompare(b.action),
      render: (text) => (
        <Tag color={getActionColor(text)}>{formatEnumValue(text)}</Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) =>
        filters.showDeleted ? (
          <Space>
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => showRestoreConfirm(record)}
              size="small"
              loading={restoreLoading && record.id === restoringPermissionId} // Loading state for restore
            >
              Restore
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => showPermanentDeleteConfirm(record)}
              size="small"
              loading={deleteLoading && record.id === deletingPermissionId}
            >
              Delete (Permanent)
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)} // Usar onEdit en lugar de console.log
              size="small"
            />

            <Button // Use the same button for soft delete
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteSoftConfirm(record)} // Call showDeleteConfirm
              size="small"
              loading={deleteSoftLoading && record.id === deletingPermissionId} // Add loading state
            />
          </Space>
        ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Buscar por nombre, código o descripción"
          allowClear
          onSearch={(value) => handleFiltersChange({ search: value })}
          style={{ width: 300 }}
        />
        <Select
          allowClear
          placeholder="Filtrar por recurso"
          style={{ width: 200 }}
          value={filters.resource}
          onChange={(value) => handleFiltersChange({ resource: value })}
        >
          <Select.Option key="001" value="">
            Todos
          </Select.Option>
          {Object.entries(RESOURCES).map(([key, value]) => (
            <Select.Option key={key} value={value}>
              {formatEnumValue(key)}
            </Select.Option>
          ))}
        </Select>
        <Select
          allowClear
          placeholder="Filtrar por acción"
          style={{ width: 200 }}
          value={filters.action}
          onChange={(value) => handleFiltersChange({ action: value })}
        >
          <Select.Option key="0001" value="">
            Todos
          </Select.Option>
          {Object.entries(ACTIONS).map(([key, value]) => (
            <Select.Option key={key} value={value}>
              {formatEnumValue(key)}
            </Select.Option>
          ))}
        </Select>

        <span style={{ marginRight: "10px" }}>Show Deleted</span>

        <Switch
          checked={filters.showDeleted}
          onChange={(checked) =>
            setFilters({ ...filters, showDeleted: checked, page: 1 })
          }
        />
      </Space>

      <Table
        loading={loading}
        columns={columns}
        dataSource={data?.permissions.edges}
        rowKey="id"
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: data?.permissions.totalCount,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} permisos`,
        }}
        onChange={handleTableChange}
        size="middle"
        bordered
      />
    </div>
  );
};

export default PermissionList;
