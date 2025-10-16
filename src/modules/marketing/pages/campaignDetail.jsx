// pages/campaignDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router';
import { 
  Card, 
  Button, 
  Breadcrumb, 
  Alert, 
  Spin, 
  Tag, 
  Descriptions, 
  Row, 
  Col, 
  Statistic,
  Divider,
  Typography,
  Space
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  TrophyOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useMarketingCampaign } from '../hooks/useMarketingCampaigns';

const { Title, Paragraph, Text } = Typography;

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return 'No especificado';
  return new Date(dateString).toLocaleDateString('es-MX');
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success';
    case 'paused': return 'warning';
    case 'completed': return 'processing';
    case 'draft': return 'default';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const getStatusLabel = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'Activa';
    case 'paused': return 'Pausada';
    case 'completed': return 'Completada';
    case 'draft': return 'Borrador';
    case 'cancelled': return 'Cancelada';
    default: return status || 'Sin estado';
  }
};

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'default';
  }
};

const getPriorityLabel = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'Alta';
    case 'medium': return 'Media';
    case 'low': return 'Baja';
    default: return priority || 'Sin prioridad';
  }
};

const CampaignDetailPage = () => {
  const { id } = useParams();
  const { campaign, loading, error } = useMarketingCampaign(id);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <Alert
        message="Error al cargar la campaña"
        description={error?.message || 'Campaña no encontrada'}
        type="error"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item>
          <Link to="/marketing/campaigns">
            <ArrowLeftOutlined style={{ marginRight: '4px' }} />
            Campañas
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{campaign.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="top">
          <Col span={18}>
            <Space direction="vertical" size="small">
              <Title level={2} style={{ margin: 0 }}>
                <TrophyOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                {campaign.name}
              </Title>
              <Space wrap>
                <Tag color={getStatusColor(campaign.status)}>
                  {getStatusLabel(campaign.status)}
                </Tag>
                {campaign.priority && (
                  <Tag color={getPriorityColor(campaign.priority)}>
                    Prioridad: {getPriorityLabel(campaign.priority)}
                  </Tag>
                )}
              </Space>
            </Space>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Link to={`/marketing/campaigns/${campaign.id}/edit`}>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
              >
                Editar
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Información principal */}
        <Col xs={24} lg={16}>
          <Card title="Información de la Campaña" style={{ marginBottom: '24px' }}>
            {campaign.description && (
              <>
                <Paragraph>
                  <Text strong>Descripción:</Text>
                </Paragraph>
                <Paragraph>{campaign.description}</Paragraph>
                <Divider />
              </>
            )}

            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label="Tipo de Campaña">
                {campaign.type || 'No especificado'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Canal">
                {campaign.channel || 'No especificado'}
              </Descriptions.Item>

              {campaign.dateRange?.start && (
                <Descriptions.Item label="Fecha de Inicio" icon={<CalendarOutlined />}>
                  {formatDate(campaign.dateRange.start)}
                </Descriptions.Item>
              )}

              {campaign.dateRange?.end && (
                <Descriptions.Item label="Fecha de Fin" icon={<CalendarOutlined />}>
                  {formatDate(campaign.dateRange.end)}
                </Descriptions.Item>
              )}

              {campaign.createdBy && (
                <Descriptions.Item label="Creado por" icon={<UserOutlined />}>
                  {campaign.createdBy}
                </Descriptions.Item>
              )}

              {campaign.createdAt && (
                <Descriptions.Item label="Fecha de Creación">
                  {formatDate(campaign.createdAt)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Audiencia objetivo */}
          {campaign.targetAudience && (
            <Card title="Audiencia Objetivo">
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                {campaign.targetAudience.demographics?.ageRange && (
                  <Descriptions.Item label="Rango de Edad">
                    {campaign.targetAudience.demographics.ageRange.min} - {campaign.targetAudience.demographics.ageRange.max} años
                  </Descriptions.Item>
                )}
                
                {campaign.targetAudience.demographics?.gender && (
                  <Descriptions.Item label="Género">
                    {campaign.targetAudience.demographics.gender}
                  </Descriptions.Item>
                )}

                {campaign.targetAudience.location && (
                  <Descriptions.Item label="Ubicación">
                    {campaign.targetAudience.location}
                  </Descriptions.Item>
                )}

                {campaign.targetAudience.interests?.length > 0 && (
                  <Descriptions.Item label="Intereses" span={2}>
                    <Space wrap>
                      {campaign.targetAudience.interests.map((interest, index) => (
                        <Tag key={index} color="blue">{interest}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* Sidebar con presupuesto y métricas */}
        <Col xs={24} lg={8}>
          {/* Presupuesto */}
          {campaign.budget && (
            <Card 
              title={
                <Space>
                  <DollarOutlined />
                  Presupuesto
                </Space>
              }
              style={{ marginBottom: '24px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {campaign.budget.allocated && (
                  <Statistic
                    title="Asignado"
                    value={campaign.budget.allocated}
                    formatter={(value) => formatCurrency(value, campaign.budget.currency)}
                  />
                )}
                
                {campaign.budget.spent && (
                  <Statistic
                    title="Gastado"
                    value={campaign.budget.spent}
                    formatter={(value) => formatCurrency(value, campaign.budget.currency)}
                  />
                )}

                {campaign.budget.allocated && campaign.budget.spent && (
                  <Statistic
                    title="Restante"
                    value={campaign.budget.allocated - campaign.budget.spent}
                    formatter={(value) => formatCurrency(value, campaign.budget.currency)}
                    valueStyle={{ color: '#3f8600' }}
                  />
                )}
              </Space>
            </Card>
          )}

          {/* Métricas de rendimiento */}
          {campaign.metrics && (
            <Card 
              title={
                <Space>
                  <BarChartOutlined />
                  Métricas de Rendimiento
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {campaign.metrics.impressions && (
                  <Statistic
                    title="Impresiones"
                    value={campaign.metrics.impressions}
                    formatter={(value) => value.toLocaleString('es-MX')}
                  />
                )}
                
                {campaign.metrics.clicks && (
                  <Statistic
                    title="Clics"
                    value={campaign.metrics.clicks}
                    formatter={(value) => value.toLocaleString('es-MX')}
                  />
                )}

                {campaign.metrics.conversions && (
                  <Statistic
                    title="Conversiones"
                    value={campaign.metrics.conversions}
                    formatter={(value) => value.toLocaleString('es-MX')}
                  />
                )}

                {campaign.metrics.ctr && (
                  <Statistic
                    title="CTR"
                    value={campaign.metrics.ctr * 100}
                    precision={2}
                    suffix="%"
                  />
                )}

                {campaign.metrics.conversionRate && (
                  <Statistic
                    title="Tasa de Conversión"
                    value={campaign.metrics.conversionRate * 100}
                    precision={2}
                    suffix="%"
                  />
                )}
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CampaignDetailPage;
