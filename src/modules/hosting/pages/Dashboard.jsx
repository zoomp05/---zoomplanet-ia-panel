import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Space } from 'antd';
import {
  CloudServerOutlined,
  GlobalOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

/**
 * Dashboard principal del módulo Hosting & Domains
 * Muestra resumen de cuentas, dominios, recursos y facturación
 */
const HostingDashboard = () => {
  // Datos de ejemplo para estadísticas
  const stats = {
    totalAccounts: 24,
    activeAccounts: 21,
    totalDomains: 45,
    pendingInvoices: 3,
    monthlyRevenue: 1250.00,
    resourceUsage: {
      cpu: 45,
      ram: 62,
      storage: 78,
      bandwidth: 34
    }
  };

  // Datos de ejemplo para cuentas recientes
  const recentAccounts = [
    {
      key: '1',
      accountId: 'HOST-001',
      domain: 'example.com',
      plan: 'Business',
      status: 'active',
      cpuUsage: 45,
      ramUsage: 62,
      storageUsage: 78,
    },
    {
      key: '2',
      accountId: 'HOST-002',
      domain: 'mywebsite.ca',
      plan: 'Professional',
      status: 'active',
      cpuUsage: 32,
      ramUsage: 48,
      storageUsage: 56,
    },
    {
      key: '3',
      accountId: 'HOST-003',
      domain: 'startup.io',
      plan: 'Starter',
      status: 'suspended',
      cpuUsage: 0,
      ramUsage: 0,
      storageUsage: 45,
    },
    {
      key: '4',
      accountId: 'HOST-004',
      domain: 'ecommerce.shop',
      plan: 'Enterprise',
      status: 'active',
      cpuUsage: 67,
      ramUsage: 73,
      storageUsage: 89,
    },
  ];

  // Columnas de la tabla
  const columns = [
    {
      title: 'Cuenta',
      dataIndex: 'accountId',
      key: 'accountId',
    },
    {
      title: 'Dominio',
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => <Tag color="blue">{plan}</Tag>,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'warning'}>
          {status === 'active' ? 'Activo' : 'Suspendido'}
        </Tag>
      ),
    },
    {
      title: 'CPU',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      render: (usage) => (
        <Progress 
          percent={usage} 
          size="small" 
          status={usage > 80 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: 'RAM',
      dataIndex: 'ramUsage',
      key: 'ramUsage',
      render: (usage) => (
        <Progress 
          percent={usage} 
          size="small" 
          status={usage > 80 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">Ver</Button>
          <Button type="link" size="small">Gestionar</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>
        <CloudServerOutlined /> Dashboard - Hosting & Dominios
      </h1>

      {/* Estadísticas principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cuentas de Hosting"
              value={stats.totalAccounts}
              prefix={<CloudServerOutlined />}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  ({stats.activeAccounts} activas)
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Dominios Registrados"
              value={stats.totalDomains}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingresos Mensuales"
              value={stats.monthlyRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              suffix="CAD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Facturas Pendientes"
              value={stats.pendingInvoices}
              prefix={<WarningOutlined />}
              valueStyle={{ color: stats.pendingInvoices > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Uso de recursos */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Uso de Recursos" extra={<Button type="link">Ver detalles</Button>}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <ThunderboltOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div style={{ marginTop: '8px' }}>CPU</div>
                  <Progress
                    type="circle"
                    percent={stats.resourceUsage.cpu}
                    width={80}
                    status={stats.resourceUsage.cpu > 80 ? 'exception' : 'normal'}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  <div style={{ marginTop: '8px' }}>RAM</div>
                  <Progress
                    type="circle"
                    percent={stats.resourceUsage.ram}
                    width={80}
                    status={stats.resourceUsage.ram > 80 ? 'exception' : 'normal'}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <DatabaseOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                  <div style={{ marginTop: '8px' }}>Almacenamiento</div>
                  <Progress
                    type="circle"
                    percent={stats.resourceUsage.storage}
                    width={80}
                    status={stats.resourceUsage.storage > 80 ? 'exception' : 'normal'}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <ArrowUpOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                  <div style={{ marginTop: '8px' }}>Ancho de Banda</div>
                  <Progress
                    type="circle"
                    percent={stats.resourceUsage.bandwidth}
                    width={80}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Resumen Rápido">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                  Cuentas Activas
                </span>
                <strong>{stats.activeAccounts} de {stats.totalAccounts}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <WarningOutlined style={{ color: '#faad14', marginRight: '8px' }} />
                  Cuentas con Uso Alto
                </span>
                <strong>3</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <GlobalOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                  Dominios por Renovar
                </span>
                <strong>7 (próximos 30 días)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <DollarOutlined style={{ color: '#3f8600', marginRight: '8px' }} />
                  Facturación Pendiente
                </span>
                <strong>${(stats.pendingInvoices * 89.99).toFixed(2)} CAD</strong>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Cuentas recientes */}
      <Card 
        title="Cuentas Recientes" 
        extra={<Button type="primary">Ver todas</Button>}
      >
        <Table
          columns={columns}
          dataSource={recentAccounts}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default HostingDashboard;
