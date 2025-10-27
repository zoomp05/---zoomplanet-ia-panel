import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Progress } from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';

/**
 * Dashboard de Facturación
 * Resumen de ingresos, facturas pendientes, métodos de pago
 */
const BillingDashboard = () => {
  const navigate = useNavigate();

  const stats = {
    monthlyRevenue: 2149.76,
    pendingInvoices: 3,
    pendingAmount: 269.97,
    paidThisMonth: 1879.79,
    totalCustomers: 24,
    avgRevenuePerCustomer: 89.58
  };

  const recentInvoices = [
    { key: '1', number: 'INV-2025-089', customer: 'John Doe', amount: 89.99, status: 'paid', dueDate: '2025-10-21' },
    { key: '2', number: 'INV-2025-088', customer: 'Jane Smith', amount: 59.99, status: 'pending', dueDate: '2025-10-25' },
    { key: '3', number: 'INV-2025-087', customer: 'Shop Online Ltd.', amount: 199.99, status: 'paid', dueDate: '2025-10-20' },
    { key: '4', number: 'INV-2025-086', customer: 'Digital Agency', amount: 89.99, status: 'overdue', dueDate: '2025-10-15' },
  ];

  const columns = [
    {
      title: 'Factura',
      dataIndex: 'number',
      key: 'number',
      render: (num) => <Button type="link" onClick={() => navigate(`/admin/hosting/billing/invoices/${num}`)}>{num}</Button>
    },
    {
      title: 'Cliente',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)} CAD`
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { paid: 'success', pending: 'warning', overdue: 'error' };
        const icons = { paid: <CheckCircleOutlined />, pending: <ClockCircleOutlined />, overdue: <WarningOutlined /> };
        return <Tag color={colors[status]} icon={icons[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Vencimiento',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1><DollarOutlined /> Dashboard de Facturación</h1>
        <Space>
          <Button onClick={() => navigate('/admin/hosting/billing/invoices')}>Ver Todas las Facturas</Button>
          <Button type="primary" icon={<FileTextOutlined />}>Generar Reporte</Button>
        </Space>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingresos del Mes"
              value={stats.monthlyRevenue}
              prefix="$"
              suffix="CAD"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Facturas Pendientes"
              value={stats.pendingInvoices}
              suffix={`($${stats.pendingAmount} CAD)`}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pagado Este Mes"
              value={stats.paidThisMonth}
              prefix="$"
              suffix="CAD"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingreso Promedio/Cliente"
              value={stats.avgRevenuePerCustomer}
              prefix="$"
              suffix="CAD"
            />
          </Card>
        </Col>
      </Row>

      {/* Gráficas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={16}>
          <Card title={<span><LineChartOutlined /> Ingresos Mensuales</span>}>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              📊 Gráfica de ingresos (últimos 12 meses)
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Distribución de Planes">
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              🥧 Gráfica de pie - Distribución de planes
            </div>
          </Card>
        </Col>
      </Row>

      {/* Facturas recientes */}
      <Card title="Facturas Recientes" extra={<Button type="link" onClick={() => navigate('/admin/hosting/billing/invoices')}>Ver todas</Button>}>
        <Table
          columns={columns}
          dataSource={recentInvoices}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default BillingDashboard;
