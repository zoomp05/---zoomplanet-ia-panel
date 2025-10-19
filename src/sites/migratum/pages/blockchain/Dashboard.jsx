import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Button } from 'antd';
import { 
  DatabaseOutlined, 
  WalletOutlined, 
  LinkOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

/**
 * Dashboard principal de Blockchain para Migratum
 * Muestra un resumen de las redes, billeteras, transacciones y contratos
 */
const BlockchainDashboard = () => {
  // Datos de ejemplo (en producción vendrían de la API)
  const mockNetworks = [
    { id: 1, name: 'Ethereum Mainnet', status: 'connected', blockHeight: 18742156 },
    { id: 2, name: 'Polygon', status: 'connected', blockHeight: 49876543 },
    { id: 3, name: 'BSC', status: 'disconnected', blockHeight: 0 },
  ];

  const mockTransactions = [
    { 
      id: '0x1234...abcd', 
      network: 'Ethereum', 
      type: 'Transfer', 
      amount: '1.5 ETH', 
      status: 'confirmed',
      timestamp: '2025-01-19 14:30:25'
    },
    { 
      id: '0x5678...efgh', 
      network: 'Polygon', 
      type: 'Contract Call', 
      amount: '100 MATIC', 
      status: 'pending',
      timestamp: '2025-01-19 14:28:10'
    },
    { 
      id: '0x9012...ijkl', 
      network: 'Ethereum', 
      type: 'Migration', 
      amount: '0.1 ETH', 
      status: 'failed',
      timestamp: '2025-01-19 14:25:45'
    },
  ];

  const networkColumns = [
    {
      title: 'Red',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'connected' ? 'green' : 'red'}>
          {status === 'connected' ? 'Conectado' : 'Desconectado'}
        </Tag>
      ),
    },
    {
      title: 'Altura del Bloque',
      dataIndex: 'blockHeight',
      key: 'blockHeight',
      render: (height) => height.toLocaleString(),
    },
  ];

  const transactionColumns = [
    {
      title: 'Hash',
      dataIndex: 'id',
      key: 'id',
      render: (hash) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {hash}
        </span>
      ),
    },
    {
      title: 'Red',
      dataIndex: 'network',
      key: 'network',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Cantidad',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          confirmed: { color: 'green', icon: <CheckCircleOutlined /> },
          pending: { color: 'orange', icon: <ClockCircleOutlined /> },
          failed: { color: 'red', icon: <ExclamationCircleOutlined /> },
        };
        return (
          <Tag color={config[status]?.color} icon={config[status]?.icon}>
            {status === 'confirmed' ? 'Confirmado' : 
             status === 'pending' ? 'Pendiente' : 'Fallido'}
          </Tag>
        );
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>
        <DatabaseOutlined style={{ marginRight: '8px' }} />
        Dashboard Blockchain
      </h1>
      
      {/* Estadísticas generales */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Redes Conectadas"
              value={2}
              suffix="/ 3"
              valueStyle={{ color: '#3f8600' }}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Billeteras Activas"
              value={5}
              valueStyle={{ color: '#1890ff' }}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Transacciones Hoy"
              value={23}
              valueStyle={{ color: '#722ed1' }}
              prefix={<LinkOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Contratos Deployados"
              value={8}
              valueStyle={{ color: '#eb2f96' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Estado de las redes */}
      <Card 
        title="Estado de las Redes Blockchain" 
        style={{ marginBottom: '24px' }}
        extra={
          <Space>
            <Button type="primary" size="small">
              Conectar Nueva Red
            </Button>
            <Button size="small">
              Configurar
            </Button>
          </Space>
        }
      >
        <Table 
          dataSource={mockNetworks} 
          columns={networkColumns} 
          pagination={false}
          size="small"
        />
      </Card>

      {/* Transacciones recientes */}
      <Card 
        title="Transacciones Recientes"
        extra={
          <Space>
            <Button type="primary" size="small">
              Nueva Transacción
            </Button>
            <Button size="small">
              Ver Todas
            </Button>
          </Space>
        }
      >
        <Table 
          dataSource={mockTransactions} 
          columns={transactionColumns} 
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default BlockchainDashboard;