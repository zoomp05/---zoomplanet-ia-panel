import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Progress, Alert } from 'antd';
import { 
  WalletOutlined, 
  DollarOutlined, 
  SwapOutlined, 
  TrendingUpOutlined,
  UserOutlined,
  ExchangeOutlined,
  CreditCardOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';

/**
 * Dashboard principal del módulo Wallet
 * Vista general de billeteras, transacciones y estado del token
 */
const WalletDashboard = () => {
  // Datos de ejemplo
  const mockWalletStats = {
    totalWallets: 632,
    activeWallets: 587,
    totalBalance: 2847320,
    tokenPrice: 1.25,
    dailyVolume: 45230,
    p2pTransactions: 89
  };

  const mockRecentTransactions = [
    {
      id: 'TXN-001',
      user: 'María González',
      type: 'P2P Transfer',
      amount: '150.00 MIG',
      fiatValue: '$187.50 CAD',
      status: 'completed',
      timestamp: '2025-01-19 14:30:25'
    },
    {
      id: 'TXN-002',
      user: 'Carlos Ruiz',
      type: 'Fiat Conversion',
      amount: '500.00 CAD',
      fiatValue: '400.00 MIG',
      status: 'pending',
      timestamp: '2025-01-19 14:28:10'
    },
    {
      id: 'TXN-003',
      user: 'Ana López',
      type: 'Credit Payment',
      amount: '75.50 MIG',
      fiatValue: '$94.38 CAD',
      status: 'completed',
      timestamp: '2025-01-19 14:25:45'
    }
  ];

  const transactionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Usuario',
      dataIndex: 'user',
      key: 'user',
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
      title: 'Valor Fiat',
      dataIndex: 'fiatValue',
      key: 'fiatValue',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status === 'completed' ? 'Completado' : 
           status === 'pending' ? 'Pendiente' : 'Fallido'}
        </Tag>
      ),
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
        <WalletOutlined style={{ marginRight: '8px' }} />
        Dashboard de Wallets y Token
      </h1>

      {/* Alerta de estado del sistema */}
      <Alert
        message="Sistema de Wallet Operativo"
        description="Todas las wallets están funcionando correctamente. Token MIG cotizando a $1.25 CAD (+2.3% últimas 24h)."
        type="success"
        showIcon
        style={{ marginBottom: '24px' }}
        action={
          <Button size="small" type="text">
            Ver Detalles
          </Button>
        }
      />
      
      {/* Estadísticas principales */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Wallets Activas"
              value={mockWalletStats.activeWallets}
              suffix={`/ ${mockWalletStats.totalWallets}`}
              valueStyle={{ color: '#3f8600' }}
              prefix={<WalletOutlined />}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              <Progress percent={Math.round((mockWalletStats.activeWallets / mockWalletStats.totalWallets) * 100)} size="small" />
              Tasa de actividad: 92.9%
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Token en Circulación"
              value={mockWalletStats.totalBalance}
              suffix="MIG"
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Valor: ${(mockWalletStats.totalBalance * mockWalletStats.tokenPrice).toLocaleString()} CAD
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Precio MIG Token"
              value={mockWalletStats.tokenPrice}
              prefix="$"
              suffix="CAD"
              valueStyle={{ color: '#722ed1' }}
              precision={2}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#52c41a' }}>
              +2.3% (24h) ↗
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Volumen Diario"
              value={mockWalletStats.dailyVolume}
              prefix="$"
              suffix="CAD"
              valueStyle={{ color: '#eb2f96' }}
              precision={0}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              {mockWalletStats.p2pTransactions} transacciones P2P
            </div>
          </Card>
        </Col>
      </Row>

      {/* Gráficos y métricas */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card 
            title="Distribución de Wallets"
            extra={<Button size="small">Ver Detalle</Button>}
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#666' }}>
                Gráfico de distribución de wallets por tipo de usuario
              </p>
              <Space direction="vertical">
                <div>Regular Users: 542 (85.8%)</div>
                <div>Premium Users: 67 (10.6%)</div>
                <div>Business Users: 23 (3.6%)</div>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="Actividad de Transacciones"
            extra={<Button size="small">Ver Historial</Button>}
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#666' }}>
                Gráfico de actividad de transacciones últimos 7 días
              </p>
              <Space direction="vertical">
                <div>P2P Transfers: 356 transacciones</div>
                <div>Fiat Conversions: 123 operaciones</div>
                <div>Credit Payments: 89 pagos</div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Transacciones recientes */}
      <Card 
        title="Transacciones Recientes"
        extra={
          <Space>
            <Button type="primary" size="small">
              Ver Todas
            </Button>
            <Button size="small">
              Exportar
            </Button>
          </Space>
        }
      >
        <Table 
          dataSource={mockRecentTransactions} 
          columns={transactionColumns} 
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* Acciones rápidas */}
      <Card 
        title="Gestión de Wallets" 
        style={{ marginTop: '24px' }}
      >
        <Space size="middle" wrap>
          <Button 
            type="primary" 
            icon={<UserOutlined />}
          >
            Crear Wallet Usuario
          </Button>
          <Button 
            icon={<ExchangeOutlined />}
          >
            Procesar P2P Pendientes
          </Button>
          <Button 
            icon={<CreditCardOutlined />}
          >
            Gestionar Conversiones
          </Button>
          <Button 
            icon={<SecurityScanOutlined />}
          >
            Auditar Transacciones
          </Button>
          <Button 
            icon={<TrendingUpOutlined />}
          >
            Actualizar Precio Token
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default WalletDashboard;