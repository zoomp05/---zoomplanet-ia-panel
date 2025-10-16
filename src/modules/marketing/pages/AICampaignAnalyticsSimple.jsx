// src/modules/marketing/pages/AICampaignAnalyticsSimple.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Select,
  DatePicker,
  Statistic,
  Progress,
  Table,
  List,
  Tag,
  Avatar,
  Divider,
  Tooltip,
  Alert,
  Empty,
  Spin
} from 'antd';
import {
  BarChartOutlined,
  TrophyOutlined,
  RobotOutlined,
  BulbOutlined,
  DollarOutlined,
  StarOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  RiseOutlined
} from '@ant-design/icons';
import useAICampaigns from '../hooks/useAICampaigns.js';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * Página de analytics simplificada para campañas AI (sin Chart.js)
 */
const AICampaignAnalyticsSimple = () => {
  // Estados locales
  const [timeRange, setTimeRange] = useState('month');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hook de AI Campaigns
  const {
    useCampaignBriefs
  } = useAICampaigns();

  // Query para datos de analytics
  const { data: campaignsData, loading: campaignsLoading } = useCampaignBriefs({
    pagination: { page: 1, limit: 1000 }, // Obtener todas para analytics
    sort: { field: 'createdAt', direction: 'DESC' }
  });

  const campaigns = campaignsData?.campaignBriefs?.nodes || [];

  // Procesar datos para métricas
  const processAnalyticsData = () => {
    const now = new Date();
    const startDate = dateRange ? dateRange[0].toDate() : 
      new Date(now.getFullYear(), now.getMonth() - (timeRange === 'week' ? 0 : timeRange === 'month' ? 1 : 6), 1);

    const filteredCampaigns = campaigns.filter(campaign => {
      const campaignDate = new Date(campaign.createdAt);
      return campaignDate >= startDate && campaignDate <= now;
    });

    return {
      total: filteredCampaigns.length,
      aiGenerated: filteredCampaigns.filter(c => c.aiGenerated).length,
      byQuality: {
        EXCELLENT: filteredCampaigns.filter(c => c.qualityScore === 'EXCELLENT').length,
        GOOD: filteredCampaigns.filter(c => c.qualityScore === 'GOOD').length,
        FAIR: filteredCampaigns.filter(c => c.qualityScore === 'FAIR').length,
        POOR: filteredCampaigns.filter(c => c.qualityScore === 'POOR').length
      },
      totalBudget: filteredCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
      topPerformers: filteredCampaigns
        .filter(c => c.qualityScore === 'EXCELLENT')
        .sort((a, b) => (b.budget || 0) - (a.budget || 0))
        .slice(0, 5),
      aiCosts: filteredCampaigns
        .filter(c => c.aiGenerated && c.aiGenerationInfo?.cost)
        .reduce((sum, c) => sum + c.aiGenerationInfo.cost, 0),
      filtered: filteredCampaigns
    };
  };

  const analyticsData = processAnalyticsData();

  // Renderizar estadísticas principales
  const renderMainStats = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Total de Campañas"
            value={analyticsData.total}
            prefix={<BulbOutlined style={{ color: '#1890ff' }} />}
            suffix={
              <Tooltip title="Tendencia positiva">
                <RiseOutlined style={{ color: '#52c41a', fontSize: 12 }} />
              </Tooltip>
            }
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Generadas con IA"
            value={analyticsData.aiGenerated}
            suffix={`/ ${analyticsData.total}`}
            prefix={<RobotOutlined style={{ color: '#52c41a' }} />}
          />
          <Progress 
            percent={analyticsData.total > 0 ? Math.round((analyticsData.aiGenerated / analyticsData.total) * 100) : 0}
            size="small"
            showInfo={false}
            strokeColor="#52c41a"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Presupuesto Total"
            value={analyticsData.totalBudget}
            prefix={<DollarOutlined style={{ color: '#faad14' }} />}
            formatter={(value) => `$${value.toLocaleString()}`}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Costo de IA"
            value={analyticsData.aiCosts}
            prefix={<ThunderboltOutlined style={{ color: '#722ed1' }} />}
            formatter={(value) => `$${value.toFixed(2)}`}
          />
        </Card>
      </Col>
    </Row>
  );

  // Renderizar controles de filtros
  const renderFilters = () => (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col>
          <Space>
            <Text strong>Período:</Text>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Option value="week">Esta semana</Option>
              <Option value="month">Este mes</Option>
              <Option value="quarter">Este trimestre</Option>
              <Option value="year">Este año</Option>
            </Select>
          </Space>
        </Col>
        <Col>
          <Space>
            <Text strong>Fechas personalizadas:</Text>
            <RangePicker
              onChange={setDateRange}
              style={{ width: 250 }}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
              Actualizar
            </Button>
            <Button icon={<DownloadOutlined />}>
              Exportar
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  // Renderizar métricas de calidad con progress bars
  const renderQualityMetrics = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={12}>
        <Card title="Distribución de Calidad">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Row justify="space-between">
                <Text>Excelente</Text>
                <Text strong style={{ color: '#52c41a' }}>{analyticsData.byQuality.EXCELLENT}</Text>
              </Row>
              <Progress 
                percent={analyticsData.total > 0 ? Math.round((analyticsData.byQuality.EXCELLENT / analyticsData.total) * 100) : 0}
                strokeColor="#52c41a"
                size="small"
              />
            </div>
            
            <div>
              <Row justify="space-between">
                <Text>Bueno</Text>
                <Text strong style={{ color: '#1890ff' }}>{analyticsData.byQuality.GOOD}</Text>
              </Row>
              <Progress 
                percent={analyticsData.total > 0 ? Math.round((analyticsData.byQuality.GOOD / analyticsData.total) * 100) : 0}
                strokeColor="#1890ff"
                size="small"
              />
            </div>
            
            <div>
              <Row justify="space-between">
                <Text>Regular</Text>
                <Text strong style={{ color: '#faad14' }}>{analyticsData.byQuality.FAIR}</Text>
              </Row>
              <Progress 
                percent={analyticsData.total > 0 ? Math.round((analyticsData.byQuality.FAIR / analyticsData.total) * 100) : 0}
                strokeColor="#faad14"
                size="small"
              />
            </div>

            <div>
              <Row justify="space-between">
                <Text>Pobre</Text>
                <Text strong style={{ color: '#ff4d4f' }}>{analyticsData.byQuality.POOR}</Text>
              </Row>
              <Progress 
                percent={analyticsData.total > 0 ? Math.round((analyticsData.byQuality.POOR / analyticsData.total) * 100) : 0}
                strokeColor="#ff4d4f"
                size="small"
              />
            </div>
          </Space>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="Métricas de Rendimiento">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Row justify="space-between">
                <Text>Tasa de Éxito (Excelente + Bueno)</Text>
                <Text strong>
                  {analyticsData.total > 0 ? 
                    Math.round(((analyticsData.byQuality.EXCELLENT + analyticsData.byQuality.GOOD) / analyticsData.total) * 100) : 0
                  }%
                </Text>
              </Row>
              <Progress 
                percent={analyticsData.total > 0 ? 
                  Math.round(((analyticsData.byQuality.EXCELLENT + analyticsData.byQuality.GOOD) / analyticsData.total) * 100) : 0
                }
                strokeColor="#52c41a"
                size="small"
              />
            </div>

            <div>
              <Row justify="space-between">
                <Text>Adopción de IA</Text>
                <Text strong>
                  {analyticsData.total > 0 ? 
                    Math.round((analyticsData.aiGenerated / analyticsData.total) * 100) : 0
                  }%
                </Text>
              </Row>
              <Progress 
                percent={analyticsData.total > 0 ? Math.round((analyticsData.aiGenerated / analyticsData.total) * 100) : 0}
                strokeColor="#722ed1"
                size="small"
              />
            </div>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Promedio Presupuesto"
                  value={analyticsData.total > 0 ? analyticsData.totalBudget / analyticsData.total : 0}
                  formatter={(value) => `$${Math.round(value).toLocaleString()}`}
                  prefix={<DollarOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Costo IA/Campaña"
                  value={analyticsData.aiGenerated > 0 ? analyticsData.aiCosts / analyticsData.aiGenerated : 0}
                  formatter={(value) => `$${value.toFixed(3)}`}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
            </Row>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Renderizar top performers
  const renderTopPerformers = () => (
    <Card title="Campañas Destacadas" extra={<TrophyOutlined />}>
      {analyticsData.topPerformers.length > 0 ? (
        <List
          dataSource={analyticsData.topPerformers}
          renderItem={(campaign, index) => (
            <List.Item
              extra={
                <Space>
                  <Tag color="gold">#{index + 1}</Tag>
                  <Text strong>${campaign.budget?.toLocaleString()}</Text>
                </Space>
              }
            >
              <List.Item.Meta
                avatar={<Avatar icon={campaign.aiGenerated ? <RobotOutlined /> : <BulbOutlined />} />}
                title={campaign.name}
                description={
                  <Space>
                    <Tag color="green">Excelente</Tag>
                    {campaign.aiGenerated && <Tag color="blue">IA</Tag>}
                    <Text type="secondary">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No hay campañas destacadas en este período" />
      )}
    </Card>
  );

  if (campaignsLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            Analytics de Campañas IA
          </Title>
          <Text type="secondary">
            Vista simplificada - Gráficos avanzados próximamente
          </Text>
        </Col>
      </Row>

      {/* Filtros */}
      {renderFilters()}

      {/* Estadísticas principales */}
      {renderMainStats()}

      {/* Alertas y resúmenes */}
      {analyticsData.total === 0 ? (
        <Alert
          message="Sin datos"
          description="No hay campañas en el período seleccionado."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      ) : (
        <>
          {/* Métricas de calidad */}
          {renderQualityMetrics()}

          {/* Top performers */}
          {renderTopPerformers()}
        </>
      )}
    </div>
  );
};

export default AICampaignAnalyticsSimple;
