import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Progress } from 'antd';
import { 
  LinkOutlined, 
  SwapOutlined, 
  HistoryOutlined, 
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

/**
 * Dashboard principal de Migración para Migratum
 * Muestra un resumen de los trabajos de migración, historial y configuraciones
 */
const MigrationDashboard = () => {
  // Datos de ejemplo (en producción vendrían de la API)
  const mockMigrationJobs = [
    { 
      id: 'MIG-001', 
      name: 'Migración ERC20 → BEP20', 
      source: 'Ethereum',
      target: 'BSC',
      status: 'running', 
      progress: 75,
      totalTokens: 1000,
      migratedTokens: 750,
      startTime: '2025-01-19 13:00:00',
      estimatedCompletion: '2025-01-19 15:30:00'
    },
    { 
      id: 'MIG-002', 
      name: 'NFT Migration to Polygon', 
      source: 'Ethereum',
      target: 'Polygon',
      status: 'pending', 
      progress: 0,
      totalTokens: 500,
      migratedTokens: 0,
      startTime: null,
      estimatedCompletion: null
    },
    { 
      id: 'MIG-003', 
      name: 'Legacy Contract Migration', 
      source: 'BSC',
      target: 'Ethereum',
      status: 'completed', 
      progress: 100,
      totalTokens: 200,
      migratedTokens: 200,
      startTime: '2025-01-19 10:00:00',
      estimatedCompletion: '2025-01-19 12:00:00'
    },
    { 
      id: 'MIG-004', 
      name: 'Token Swap Migration', 
      source: 'Polygon',
      target: 'Arbitrum',
      status: 'failed', 
      progress: 25,
      totalTokens: 800,
      migratedTokens: 200,
      startTime: '2025-01-19 11:00:00',
      estimatedCompletion: null
    },
  ];

  const migrationColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Origen → Destino',
      key: 'networks',
      width: 150,
      render: (_, record) => (
        <span>
          {record.source} → {record.target}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config = {
          running: { color: 'blue', icon: <LoadingOutlined />, text: 'Ejecutando' },
          pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pendiente' },
          completed: { color: 'green', icon: <CheckCircleOutlined />, text: 'Completado' },
          failed: { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Fallido' },
        };
        return (
          <Tag color={config[status]?.color} icon={config[status]?.icon}>
            {config[status]?.text}
          </Tag>
        );
      },
    },
    {
      title: 'Progreso',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress, record) => (
        <div>
          <Progress 
            percent={progress} 
            size="small" 
            status={record.status === 'failed' ? 'exception' : 'normal'}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.migratedTokens}/{record.totalTokens} tokens
          </div>
        </div>
      ),
    },
    {
      title: 'Inicio',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (time) => time || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" type="link">
            Ver
          </Button>
          {record.status === 'running' && (
            <Button size="small" type="link" danger>
              Pausar
            </Button>
          )}
          {record.status === 'failed' && (
            <Button size="small" type="link">
              Reintentar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>
        <SwapOutlined style={{ marginRight: '8px' }} />
        Dashboard de Migración
      </h1>
      
      {/* Estadísticas generales */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Trabajos Activos"
              value={1}
              valueStyle={{ color: '#1890ff' }}
              prefix={<LoadingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completados Hoy"
              value={1}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tokens Migrados"
              value={950}
              valueStyle={{ color: '#722ed1' }}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tasa de Éxito"
              value={87.5}
              suffix="%"
              valueStyle={{ color: '#eb2f96' }}
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Trabajos de migración */}
      <Card 
        title="Trabajos de Migración" 
        extra={
          <Space>
            <Button type="primary">
              Nuevo Trabajo
            </Button>
            <Button>
              Configurar
            </Button>
          </Space>
        }
      >
        <Table 
          dataSource={mockMigrationJobs} 
          columns={migrationColumns} 
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Resumen de redes soportadas */}
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card 
            title="Redes Soportadas" 
            size="small"
            extra={<Button size="small">Gestionar</Button>}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Tag color="blue">Ethereum</Tag>
              <Tag color="purple">Polygon</Tag>
              <Tag color="yellow">BSC</Tag>
              <Tag color="green">Arbitrum</Tag>
              <Tag color="red">Avalanche</Tag>
              <Tag color="orange">Optimism</Tag>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="Tipos de Migración" 
            size="small"
            extra={<Button size="small">Configurar</Button>}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Tag>ERC20 → BEP20</Tag>
              <Tag>NFT Migration</Tag>
              <Tag>Contract Migration</Tag>
              <Tag>Token Swap</Tag>
              <Tag>Liquidity Migration</Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MigrationDashboard;