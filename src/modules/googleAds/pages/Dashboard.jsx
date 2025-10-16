/**
 * Dashboard Principal de Google Ads
 * 
 * Vista principal con métricas, resumen de campañas y accesos rápidos
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Button, 
  Space,
  Alert,
  Typography,
  Tabs
} from 'antd';
import {
  DollarOutlined,
  EyeOutlined,
  LineChartOutlined,
  RiseOutlined,
  PlusOutlined,
  SyncOutlined,
  GoogleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Componente Dashboard de Google Ads
 */
const GoogleAdsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Cargar datos del dashboard
   */
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Conectar con API real de Google Ads
      // Por ahora datos de prueba
      setMetrics({
        totalSpent: 5432.50,
        impressions: 125000,
        clicks: 3542,
        conversions: 234,
        ctr: 2.83,
        cpc: 1.53,
        conversionRate: 6.61
      });

      setCampaigns([
        {
          key: '1',
          id: 'gads-001',
          name: 'Campaña Black Friday 2025',
          status: 'active',
          budget: 500,
          spent: 342.50,
          impressions: 25000,
          clicks: 650,
          conversions: 42
        },
        {
          key: '2',
          id: 'gads-002',
          name: 'Remarketing - Carrito Abandonado',
          status: 'active',
          budget: 200,
          spent: 156.30,
          impressions: 12000,
          clicks: 320,
          conversions: 28
        }
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Columnas para tabla de campañas
   */
  const campaignColumns = [
    {
      title: 'Campaña',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`campaigns/${record.id}`)}>
          {text}
        </Button>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ 
          color: status === 'active' ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {status === 'active' ? 'Activa' : 'Pausada'}
        </span>
      )
    },
    {
      title: 'Presupuesto',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget) => `$${budget.toFixed(2)}`
    },
    {
      title: 'Gastado',
      dataIndex: 'spent',
      key: 'spent',
      render: (spent) => `$${spent.toFixed(2)}`
    },
    {
      title: 'Impresiones',
      dataIndex: 'impressions',
      key: 'impressions',
      render: (impressions) => impressions.toLocaleString()
    },
    {
      title: 'Clicks',
      dataIndex: 'clicks',
      key: 'clicks'
    },
    {
      title: 'Conversiones',
      dataIndex: 'conversions',
      key: 'conversions'
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => navigate(`campaigns/${record.id}`)}>
            Ver
          </Button>
          <Button size="small" onClick={() => navigate(`campaigns/${record.id}/edit`)}>
            Editar
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <GoogleOutlined style={{ marginRight: 8 }} />
            Dashboard Google Ads
          </Title>
          <Paragraph type="secondary">
            Gestiona tus campañas de Google Ads y analiza su rendimiento
          </Paragraph>
        </Col>
        <Col>
          <Space>
            <Button icon={<SyncOutlined />} onClick={loadDashboardData}>
              Sincronizar
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('campaigns/create')}>
              Nueva Campaña
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Alerta de conexión */}
      <Alert
        message="Módulo Google Ads"
        description="Este módulo está en fase inicial. Conecta tu cuenta de Google Ads en Configuración para comenzar."
        type="info"
        showIcon
        closable
        style={{ marginBottom: 24 }}
        action={
          <Button size="small" onClick={() => navigate('settings/api')}>
            Configurar API
          </Button>
        }
      />

      {/* Métricas principales */}
      {metrics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Inversión Total"
                value={metrics.totalSpent}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="USD"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Impresiones"
                value={metrics.impressions}
                prefix={<EyeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Clicks"
                value={metrics.clicks}
                prefix={<LineChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Conversiones"
                value={metrics.conversions}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="CTR"
                value={metrics.ctr}
                precision={2}
                suffix="%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="CPC Promedio"
                value={metrics.cpc}
                precision={2}
                prefix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Tasa de Conversión"
                value={metrics.conversionRate}
                precision={2}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Campañas activas */}
      <Card
        title="Campañas Activas"
        extra={
          <Button type="link" onClick={() => navigate('campaigns')}>
            Ver todas
          </Button>
        }
      >
        <Table
          columns={campaignColumns}
          dataSource={campaigns}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Accesos rápidos */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => navigate('keywords/research')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <Title level={4}>Investigación de Keywords</Title>
            <Paragraph type="secondary">
              Descubre nuevas palabras clave para tus campañas
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => navigate('reports/performance')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <Title level={4}>Reportes de Rendimiento</Title>
            <Paragraph type="secondary">
              Analiza el desempeño de tus campañas
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => navigate('sync/marketing-campaigns')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <Title level={4}>Sincronizar con Marketing</Title>
            <Paragraph type="secondary">
              Vincula campañas con el módulo de Marketing
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GoogleAdsDashboard;
