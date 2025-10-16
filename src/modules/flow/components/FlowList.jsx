import React from 'react';
import { Table, Space, Button, Tag } from 'antd';
// Actualizamos para usar el patrón de namespace para Apollo Client
import * as ApolloClient from '@apollo/client';
const { useQuery, useMutation } = ApolloClient;
import { GET_FLOWS, DELETE_FLOW, ARCHIVE_FLOW } from '../apollo/flow';
// Actualizamos para usar el patrón de namespace para React Router
import * as ReactRouter from 'react-router';
const { useNavigate } = ReactRouter;

const FlowList = () => {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_FLOWS);
  const [deleteFlow] = useMutation(DELETE_FLOW);
  const [archiveFlow] = useMutation(ARCHIVE_FLOW);

  const handleDelete = async (id) => {
    try {
      await deleteFlow({ variables: { id } });
    } catch (error) {
      console.error('Error deleting flow:', error);
    }
  };

  const handleArchive = async (id) => {
    try {
      await archiveFlow({ variables: { id } });
    } catch (error) {
      console.error('Error archiving flow:', error);
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Contexto',
      dataIndex: ['context', 'name'],
      key: 'context',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={
          status === 'ACTIVE' ? 'green' :
          status === 'INACTIVE' ? 'orange' :
          'red'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" href={`/flows/edit/${record._id}`}>
            Editar
          </Button>
          <Button 
            type="link" 
            danger
            onClick={() => handleDelete(record._id)}
          >
            Eliminar
          </Button>
          <Button 
            type="link"
            onClick={() => handleArchive(record._id)}
          >
            Archivar
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Transform data structure for Table
  const tableData = data?.flows?.edges?.map(edge => edge.node) || [];

  return (
    <div>
      <Button 
        type="primary" 
        style={{ marginBottom: 16 }}
        href="/flows/create"
      >
        Crear Nuevo Flujo
      </Button>
      <Table 
        columns={columns} 
        dataSource={Array.isArray(tableData) ? tableData : []}
        rowKey="_id"
      />
    </div>
  );
};

export default FlowList;
