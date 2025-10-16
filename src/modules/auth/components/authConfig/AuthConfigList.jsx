// src/modules/auth/components/authConfig/AuthConfigList.jsx
import React, { useState } from "react";
import * as ApolloClient from "@apollo/client";
import { GET_AUTH_CONFIGS, DELETE_AUTH_CONFIG } from "../../apollo/authConfig";
import { Table, Space, Button, Modal, Tag } from "antd";
import { toast } from "react-hot-toast";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  GoogleOutlined,
  FacebookOutlined
} from "@ant-design/icons";

const { useQuery, useMutation } = ApolloClient;
const { confirm } = Modal;

const AuthConfigList = ({ onEdit }) => {
  const [deletingId, setDeletingId] = useState(null);

  const { loading, error, data } = useQuery(GET_AUTH_CONFIGS);

  const [deleteAuthConfig, { loading: deleteLoading }] = useMutation(DELETE_AUTH_CONFIG, {
    refetchQueries: [{ query: GET_AUTH_CONFIGS }],
    awaitRefetchQueries: true,
  });

  const handleDelete = (record) => {
    confirm({
      title: "¿Está seguro de eliminar esta configuración?",
      icon: <ExclamationCircleOutlined />,
      content: `Se eliminará la configuración para la cuenta: ${record.account}`,
      okText: "Sí",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        setDeletingId(record.id);
        try {
          const { data } = await deleteAuthConfig({ variables: { id: record.id } });
          if (data.deleteAuthConfig) {
            toast.success("Configuración eliminada con éxito");
          } else {
            toast.error("Error al eliminar la configuración");
          }
        } catch (error) {
          toast.error("Error al eliminar la configuración");
          console.error(error);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const columns = [
    {
      title: "ID de Cuenta",
      dataIndex: "account",
      key: "account",
    },
    {
      title: "Google Auth",
      dataIndex: ["google", "enabled"],
      key: "googleAuth",
      render: (enabled, record) => (
        <Tag color={enabled ? "green" : "red"} icon={<GoogleOutlined />}>
          {enabled ? "Habilitado" : "Deshabilitado"}
        </Tag>
      ),
    },
    {
      title: "Facebook Auth",
      dataIndex: ["facebook", "enabled"],
      key: "facebookAuth",
      render: (enabled, record) => (
        <Tag color={enabled ? "blue" : "red"} icon={<FacebookOutlined />}>
          {enabled ? "Habilitado" : "Deshabilitado"}
        </Tag>
      ),
    },
    {
      title: "Fecha de Creación",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Última Actualización",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          >
            Editar
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={deletingId === record.id}
            size="small"
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  if (error) {
    return <div>Error al cargar las configuraciones: {error.message}</div>;
  }

  return (
    <Table
      columns={columns}
      dataSource={data?.authConfigs || []}
      rowKey="id"
      loading={loading || deleteLoading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default AuthConfigList;
