// pages/index.jsx
import React, { useState } from 'react';
import { Link } from 'react-router';
import { Card, Row, Col, Statistic, Button, List, Avatar, Tag, Space, Typography, Spin, Alert, Divider } from 'antd';
import { 
  PlusOutlined, 
  BarChartOutlined, 
  EyeOutlined, 
  PlayCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  TrophyOutlined,
  AimOutlined,
  RocketOutlined,
  RobotOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useContextualRoute } from '@zoom/hooks';
import { useMarketingCampaigns } from '../hooks/useMarketingCampaigns';
import { CAMPAIGN_STATUS, CAMPAIGN_TYPES } from '../constants/marketingConstants';
import MarketingErrorBoundary from '../components/MarketingErrorBoundary';

const { Title, Paragraph } = Typography;

const MarketingDashboard = () => {
  // Rutas contextuales para el módulo
  const getModuleRoute = useContextualRoute("module");
  
  const [filter, setFilter] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  
  const { campaigns, totalCount, loading, error } = useMarketingCampaigns(filter, pagination);

  // Asegurar que campaigns es siempre un array
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  // Estadísticas rápidas con validación
  const stats = {
    total: typeof totalCount === 'number' ? totalCount : 0,
    active: safeCampaigns.filter(c => c && c.status === 'ACTIVE').length,
    completed: safeCampaigns.filter(c => c && c.status === 'COMPLETED').length,
    draft: safeCampaigns.filter(c => c && c.status === 'DRAFT').length,
  };

  // Función para obtener el color del tag según el estado
  const getStatusColor = (status) => {
    if (!status || typeof status !== 'string') return 'default';
    
    const statusConfig = CAMPAIGN_STATUS[status];
    if (!statusConfig) return 'default';
    
    const colorMap = {
      'green': 'success',
      'blue': 'processing',
      'yellow': 'warning',
      'red': 'error',
      'gray': 'default'
    };
    
    return colorMap[statusConfig.color] || 'default';
  };

  // Función para obtener el icono del tipo de campaña
  const getTypeIcon = (type) => {
    if (!type || typeof type !== 'string') return <BarChartOutlined />;
    
    const iconMap = {
      'AWARENESS': <EyeOutlined />,
      'CONSIDERATION': <AimOutlined />,
      'CONVERSION': <TrophyOutlined />,
      'RETENTION': <CheckCircleOutlined />,
      'ADVOCACY': <PlayCircleOutlined />,
      'LAUNCH': <RocketOutlined />,
      'SEASONAL': <BarChartOutlined />,
      'PROMOTIONAL': <EditOutlined />,
      'BRAND_BUILDING': <TrophyOutlined />,
      'LEAD_GENERATION': <AimOutlined />
    };
    
    return iconMap[type] || <BarChartOutlined />;
  };

  if (loading) {
    return (
      <MarketingErrorBoundary>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" />
        </div>
      </MarketingErrorBoundary>
    );
  }

  if (error) {
    return (
      <MarketingErrorBoundary>
        <Alert
          message="Error al cargar las campañas"
          description={error?.message || 'Error desconocido'}
          type="error"
          showIcon
          style={{ margin: '20px 0' }}
        />
      </MarketingErrorBoundary>
    );
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Marketing
          </Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
            Gestiona tus campañas de marketing y analiza su rendimiento
          </Paragraph>
        </div>
        <Link to={getModuleRoute("marketing/campaigns/create-ai")}>
          <Button type="primary" icon={<RobotOutlined />} size="large">
            Nueva Campaña con IA
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Campañas"
              value={stats.total}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Activas"
              value={stats.active}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completadas"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Borradores"
              value={stats.draft}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Enlaces rápidos */}
      <Card title="Accesos Rápidos" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Link to={getModuleRoute("marketing/campaigns")}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '140px' }}
                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <RobotOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                <Title level={4} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                  Campañas Asistidas por IA
                </Title>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                  Gestiona todas tus campañas con IA
                </Paragraph>
              </Card>
            </Link>
          </Col>
          <Col xs={24} md={6}>
            <Link to={getModuleRoute("marketing/campaigns/create-ai")}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '140px' }}
                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <PlusOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
                <Title level={4} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                  Nueva Campaña con IA
                </Title>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                  Crea campañas con asistencia de IA
                </Paragraph>
              </Card>
            </Link>
          </Col>
          <Col xs={24} md={6}>
            <Link to={getModuleRoute("analytics")}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '140px' }}
                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <BarChartOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '12px' }} />
                <Title level={4} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                  Analytics & Reportes
                </Title>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                  Analiza el rendimiento de campañas
                </Paragraph>
              </Card>
            </Link>
          </Col>
          <Col xs={24} md={6}>
            <Link to={getModuleRoute("leads")}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '140px' }}
                bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <AimOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: '12px' }} />
                <Title level={4} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                  CRM & Leads
                </Title>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                  Gestión de leads y conversiones
                </Paragraph>
              </Card>
            </Link>
          </Col>
        </Row>
      </Card>

      {/* Sección de IA */}
      <Card 
        title={
          <Space>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <span>Herramientas de Inteligencia Artificial</span>
          </Space>
        } 
        style={{ marginBottom: '24px' }}
        extra={
          <Link to={getModuleRoute("ai-campaigns")}>
            <Button type="primary" icon={<DashboardOutlined />}>
              Ver Dashboard IA
            </Button>
          </Link>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Link to={getModuleRoute("marketing/campaigns/create-ai")}>
              <Card 
                hoverable 
                size="small"
                style={{ textAlign: 'center', height: '120px' }}
                bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <BulbOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                <Title level={5} style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  Crear con IA
                </Title>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '11px' }}>
                  Genera campañas completas automáticamente
                </Paragraph>
              </Card>
            </Link>
          </Col>
          <Col xs={24} md={8}>
            <Link to={getModuleRoute("ai-analytics")}>
              <Card 
                hoverable 
                size="small"
                style={{ textAlign: 'center', height: '120px' }}
                bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <BarChartOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
                <Title level={5} style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                  Analytics IA
                </Title>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '11px' }}>
                  Métricas de generación con IA
                </Paragraph>
              </Card>
            </Link>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              size="small"
              style={{ textAlign: 'center', height: '120px', backgroundColor: '#f0f2f5' }}
              bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <ThunderboltOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
              <Title level={5} style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                Mejora Automática
              </Title>
              <Paragraph type="secondary" style={{ margin: 0, fontSize: '11px' }}>
                Próximamente
              </Paragraph>
            </Card>
          </Col>
        </Row>
        
        <Divider style={{ margin: '16px 0' }} />
        
        <div style={{ textAlign: 'center' }}>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
            🤖 Las herramientas de IA te ayudan a crear campañas más efectivas en menos tiempo
          </Paragraph>
        </div>
      </Card>

      {/* Campañas recientes */}
      {safeCampaigns.length > 0 && (
        <Card 
          title="Campañas Recientes"
          extra={
            <Link to="campaigns">
              <Button type="link">Ver todas</Button>
            </Link>
          }
        >
          <List
            itemLayout="horizontal"
            dataSource={safeCampaigns.slice(0, 5)}
            renderItem={(campaign) => {
              // Validar que campaign sea un objeto válido
              if (!campaign || typeof campaign !== 'object') {
                return null;
              }

              const campaignId = campaign.id || 'unknown';
              const campaignName = campaign.name || 'Sin nombre';
              const campaignStatus = campaign.status || 'DRAFT';
              const campaignType = campaign.type || 'AWARENESS';

              return (
                <List.Item
                  actions={[
                    <Link key="view" to={`campaigns/${campaignId}`}>
                      <Button type="link" size="small">Ver</Button>
                    </Link>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getTypeIcon(campaignType)} 
                        style={{ 
                          backgroundColor: getStatusColor(campaignStatus) === 'success' ? '#52c41a' :
                                             getStatusColor(campaignStatus) === 'processing' ? '#1890ff' :
                                             getStatusColor(campaignStatus) === 'warning' ? '#faad14' :
                                             getStatusColor(campaignStatus) === 'error' ? '#ff4d4f' : '#d9d9d9'
                        }}
                      />
                    }
                    title={
                      <Space>
                        <span>{campaignName}</span>
                        <Tag color={getStatusColor(campaignStatus)}>
                          {CAMPAIGN_STATUS[campaignStatus]?.label || campaignStatus}
                        </Tag>
                      </Space>
                    }
                    description={CAMPAIGN_TYPES[campaignType]?.label || campaignType}
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      )}
    </div>
  );
};

const WrappedMarketingDashboard = () => (
  <MarketingErrorBoundary>
    <MarketingDashboard />
  </MarketingErrorBoundary>
);

export default WrappedMarketingDashboard;
