import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Card, 
  Tabs, 
  Descriptions, 
  Tag, 
  Button, 
  Space, 
  Progress, 
  Table,
  Modal,
  Select,
  Form,
  Input,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Badge,
  Divider
} from 'antd';
import {
  CloudServerOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

/**
 * Detalles completos de una cuenta de hosting
 * Muestra información del plan, uso de recursos, dominios, facturación y configuración
 */
const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // TODO: Reemplazar con query GraphQL real
  const account = {
    id: accountId,
    accountId: 'HOST-001',
    domain: 'example.com',
    client: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 8900',
    },
    plan: {
      id: 'plan-1',
      name: 'Business Plan',
      type: 'HOSTING_PLAN',
      sku: 'HOST-BUS-001',
      metadata: {
        hosting: {
          cpu: { cores: 4, type: 'shared' },
          ram: { amount: 8, unit: 'GB' },
          storage: { amount: 100, unit: 'GB', type: 'SSD' },
          bandwidth: { amount: 2000, unit: 'GB', unlimited: false },
          websites: 10,
          databases: 10,
          emailAccounts: 100,
          freeSSL: true,
          backup: { enabled: true, frequency: 'daily' }
        }
      },
      pricing: [
        { interval: 'MONTHLY', amount: 89.99, currency: 'CAD' },
        { interval: 'ANNUAL', amount: 899.99, currency: 'CAD' }
      ]
    },
    status: 'active',
    resourceUsage: {
      cpu: { current: 45, limit: 100 },
      ram: { current: 5.2, limit: 8 },
      storage: { current: 67, limit: 100 },
      bandwidth: { current: 856, limit: 2000 }
    },
    billing: {
      interval: 'MONTHLY',
      amount: 89.99,
      currency: 'CAD',
      nextBillingDate: '2025-11-21',
      lastPayment: {
        date: '2025-10-21',
        amount: 89.99,
        status: 'paid'
      }
    },
    server: {
      ip: '192.168.1.100',
      hostname: 'server-ca-01.example.com',
      controlPanel: 'cPanel',
      location: 'Toronto, Canada'
    },
    domains: [
      { name: 'example.com', type: 'primary', status: 'active' },
      { name: 'www.example.com', type: 'alias', status: 'active' },
      { name: 'blog.example.com', type: 'subdomain', status: 'active' }
    ],
    createdAt: '2024-01-15',
    updatedAt: '2025-10-21'
  };

  // Handlers
  const handleSuspend = () => {
    Modal.confirm({
      title: '¿Suspender cuenta?',
      content: `¿Estás seguro de suspender la cuenta ${account.accountId}?`,
      okText: 'Suspender',
      okType: 'danger',
      onOk: () => {
        message.success('Cuenta suspendida');
      }
    });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '¿Eliminar cuenta?',
      content: `¿Estás seguro de eliminar la cuenta ${account.accountId}? Esta acción no se puede deshacer.`,
      okText: 'Eliminar',
      okType: 'danger',
      onOk: () => {
        message.success('Cuenta eliminada');
        navigate('/admin/hosting/accounts');
      }
    });
  };

  const handleUpgradePlan = () => {
    navigate(`/admin/hosting/accounts/${accountId}/upgrade`);
  };

  // Renderizar estado
  const renderStatus = (status) => {
    const statusConfig = {
      active: { color: 'success', text: 'Activo', icon: <CheckCircleOutlined /> },
      suspended: { color: 'error', text: 'Suspendido', icon: <StopOutlined /> },
      pending: { color: 'warning', text: 'Pendiente', icon: <WarningOutlined /> },
    };
    const config = statusConfig[status];
    return <Badge status={config.color} text={config.text} />;
  };

  // Columnas para tabla de dominios
  const domainColumns = [
    {
      title: 'Dominio',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <strong>{name}</strong>
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = { primary: 'blue', alias: 'cyan', subdomain: 'green' };
        return <Tag color={colors[type]}>{type}</Tag>;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status)
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small">DNS</Button>
          <Button type="link" size="small">SSL</Button>
        </Space>
      )
    }
  ];

  // Columnas para facturas
  const invoiceColumns = [
    {
      title: 'Factura',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount} CAD`
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'success' : 'warning'}>
          {status === 'paid' ? 'Pagado' : 'Pendiente'}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small">Ver</Button>
          <Button type="link" size="small">Descargar</Button>
        </Space>
      )
    }
  ];

  const invoices = [
    { key: '1', number: 'INV-001', date: '2025-10-21', amount: 89.99, status: 'paid' },
    { key: '2', number: 'INV-002', date: '2025-09-21', amount: 89.99, status: 'paid' },
    { key: '3', number: 'INV-003', date: '2025-08-21', amount: 89.99, status: 'paid' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>
            <CloudServerOutlined /> {account.accountId} - {account.domain}
          </h1>
          <Space>
            {renderStatus(account.status)}
            <span style={{ color: '#8c8c8c' }}>Plan: {account.plan.name}</span>
          </Space>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />}>Actualizar</Button>
          <Button icon={<EditOutlined />}>Editar</Button>
          <Button 
            danger 
            icon={<StopOutlined />}
            onClick={handleSuspend}
          >
            Suspender
          </Button>
          <Button 
            type="primary"
            icon={<ArrowUpOutlined />}
            onClick={handleUpgradePlan}
          >
            Upgrade Plan
          </Button>
        </Space>
      </div>

      {/* Alertas */}
      {account.resourceUsage.cpu.current > 80 && (
        <Alert
          message="Alto uso de CPU"
          description={`El uso de CPU está al ${account.resourceUsage.cpu.current}%. Considera hacer upgrade del plan.`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* TAB 1: OVERVIEW */}
          <TabPane tab="Overview" key="overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Información General" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="ID Cuenta">{account.accountId}</Descriptions.Item>
                    <Descriptions.Item label="Dominio Principal">
                      <a href={`https://${account.domain}`} target="_blank" rel="noopener noreferrer">
                        {account.domain}
                      </a>
                    </Descriptions.Item>
                    <Descriptions.Item label="Estado">{renderStatus(account.status)}</Descriptions.Item>
                    <Descriptions.Item label="Plan">{account.plan.name}</Descriptions.Item>
                    <Descriptions.Item label="SKU">{account.plan.sku}</Descriptions.Item>
                    <Descriptions.Item label="Creado">{account.createdAt}</Descriptions.Item>
                    <Descriptions.Item label="Última Actualización">{account.updatedAt}</Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="Información del Cliente" size="small" style={{ marginTop: '16px' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Nombre">{account.client.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{account.client.email}</Descriptions.Item>
                    <Descriptions.Item label="Teléfono">{account.client.phone}</Descriptions.Item>
                  </Descriptions>
                  <Button type="link" size="small" style={{ padding: 0, marginTop: '8px' }}>
                    Ver perfil completo →
                  </Button>
                </Card>

                <Card title="Servidor" size="small" style={{ marginTop: '16px' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="IP">{account.server.ip}</Descriptions.Item>
                    <Descriptions.Item label="Hostname">{account.server.hostname}</Descriptions.Item>
                    <Descriptions.Item label="Panel de Control">{account.server.controlPanel}</Descriptions.Item>
                    <Descriptions.Item label="Ubicación">{account.server.location}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Uso de Recursos" size="small">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span><ThunderboltOutlined /> CPU</span>
                        <span>{account.resourceUsage.cpu.current}%</span>
                      </div>
                      <Progress 
                        percent={account.resourceUsage.cpu.current} 
                        status={account.resourceUsage.cpu.current > 80 ? 'exception' : 'normal'}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span><DatabaseOutlined /> RAM</span>
                        <span>{account.resourceUsage.ram.current} GB / {account.resourceUsage.ram.limit} GB</span>
                      </div>
                      <Progress 
                        percent={Math.round((account.resourceUsage.ram.current / account.resourceUsage.ram.limit) * 100)} 
                        status={account.resourceUsage.ram.current / account.resourceUsage.ram.limit > 0.8 ? 'exception' : 'normal'}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span><DatabaseOutlined /> Storage</span>
                        <span>{account.resourceUsage.storage.current} GB / {account.resourceUsage.storage.limit} GB</span>
                      </div>
                      <Progress 
                        percent={Math.round((account.resourceUsage.storage.current / account.resourceUsage.storage.limit) * 100)} 
                        status={account.resourceUsage.storage.current / account.resourceUsage.storage.limit > 0.8 ? 'exception' : 'normal'}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span><GlobalOutlined /> Bandwidth (mes actual)</span>
                        <span>{account.resourceUsage.bandwidth.current} GB / {account.resourceUsage.bandwidth.limit} GB</span>
                      </div>
                      <Progress 
                        percent={Math.round((account.resourceUsage.bandwidth.current / account.resourceUsage.bandwidth.limit) * 100)} 
                      />
                    </div>
                  </Space>
                </Card>

                <Card title="Próxima Facturación" size="small" style={{ marginTop: '16px' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Intervalo">
                      <Tag color="blue">{account.billing.interval}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Monto">
                      <strong style={{ fontSize: '18px', color: '#1890ff' }}>
                        ${account.billing.amount} {account.billing.currency}
                      </strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha">{account.billing.nextBillingDate}</Descriptions.Item>
                    <Descriptions.Item label="Último Pago">
                      {account.billing.lastPayment.date} - ${account.billing.lastPayment.amount}
                      <Tag color="success" style={{ marginLeft: '8px' }}>Pagado</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* TAB 2: RESOURCES */}
          <TabPane tab={<span><LineChartOutlined /> Recursos</span>} key="resources">
            <Alert
              message="Gráficas de uso en tiempo real"
              description="Aquí se mostrarían gráficas históricas de uso de CPU, RAM, Storage y Bandwidth"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Uso de CPU (últimos 7 días)" size="small">
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                    📊 Gráfica de CPU
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Uso de RAM (últimos 7 días)" size="small">
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                    📊 Gráfica de RAM
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Uso de Storage" size="small">
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                    📊 Gráfica de Storage
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Bandwidth (mes actual)" size="small">
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                    📊 Gráfica de Bandwidth
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* TAB 3: DOMAINS */}
          <TabPane tab={<span><GlobalOutlined /> Dominios</span>} key="domains">
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <h3>Dominios Asociados</h3>
              <Button type="primary" icon={<GlobalOutlined />}>Agregar Dominio</Button>
            </div>
            <Table
              columns={domainColumns}
              dataSource={account.domains}
              pagination={false}
              size="small"
            />
          </TabPane>

          {/* TAB 4: BILLING */}
          <TabPane tab={<span><DollarOutlined /> Facturación</span>} key="billing">
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Próximo Pago"
                    value={account.billing.amount}
                    prefix="$"
                    suffix={account.billing.currency}
                  />
                  <div style={{ marginTop: '8px', color: '#8c8c8c' }}>
                    {account.billing.nextBillingDate}
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Facturado (este año)"
                    value={1079.88}
                    prefix="$"
                    suffix="CAD"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Facturas Pendientes"
                    value={0}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Historial de Facturas" size="small">
              <Table
                columns={invoiceColumns}
                dataSource={invoices}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </TabPane>

          {/* TAB 5: SETTINGS */}
          <TabPane tab={<span><SettingOutlined /> Configuración</span>} key="settings">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card title="Cambiar Plan" size="small">
                <p>Plan actual: <strong>{account.plan.name}</strong></p>
                <Space>
                  <Button type="primary" onClick={handleUpgradePlan}>Upgrade Plan</Button>
                  <Button>Downgrade Plan</Button>
                </Space>
              </Card>

              <Card title="Acciones de la Cuenta" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    block 
                    icon={<StopOutlined />}
                    onClick={handleSuspend}
                  >
                    Suspender Cuenta
                  </Button>
                  <Button 
                    block 
                    icon={<PlayCircleOutlined />}
                  >
                    Reactivar Cuenta
                  </Button>
                  <Divider />
                  <Button 
                    block 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                  >
                    Eliminar Cuenta Permanentemente
                  </Button>
                </Space>
              </Card>

              <Card title="Configuración Avanzada" size="small">
                <Form layout="vertical">
                  <Form.Item label="Hostname personalizado">
                    <Input placeholder={account.server.hostname} />
                  </Form.Item>
                  <Form.Item label="Panel de Control">
                    <Select defaultValue={account.server.controlPanel}>
                      <Option value="cPanel">cPanel</Option>
                      <Option value="Plesk">Plesk</Option>
                      <Option value="DirectAdmin">DirectAdmin</Option>
                    </Select>
                  </Form.Item>
                  <Button type="primary">Guardar Cambios</Button>
                </Form>
              </Card>
            </Space>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AccountDetails;
