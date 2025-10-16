// src/modules/marketing/pages/AICampaignAnalytics.jsx
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
  LineChartOutlined,
  PieChartOutlined,
  TrophyOutlined,
  RobotOutlined,
  BulbOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import useAICampaigns from '../hooks/useAICampaigns.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * Página de analytics para campañas AI
 */
const AICampaignAnalytics = () => {
  // Estados locales
  const [timeRange, setTimeRange] = useState('month');
  const [dateRange, setDateRange] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState(['all']);
  const [loading, setLoading] = useState(false);

  // Hook de AI Campaigns
  const {
    useCampaignBriefs,
    useCampaignObjectives,
    useCampaignStrategies,
    useCampaignDocumentations,
    useCampaignMediaIdeas
  } = useAICampaigns();

  // Queries para datos de analytics
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
      avgBudget: filteredCampaigns.length > 0 ? 
        filteredCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0) / filteredCampaigns.length : 0,
      byMonth: processMonthlyData(filteredCampaigns),
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

  // Procesar datos mensuales
  const processMonthlyData = (campaigns) => {
    const monthlyData = {};
    campaigns.forEach(campaign => {
      const date = new Date(campaign.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          total: 0,
          aiGenerated: 0,
          budget: 0,
          excellent: 0
        };
      }
      
      monthlyData[monthKey].total++;
      if (campaign.aiGenerated) monthlyData[monthKey].aiGenerated++;
      monthlyData[monthKey].budget += campaign.budget || 0;
      if (campaign.qualityScore === 'EXCELLENT') monthlyData[monthKey].excellent++;
    });
    
    return monthlyData;
  };

  const analyticsData = processAnalyticsData();

  // Configuración de gráficos
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Datos para gráfico de línea temporal
  const lineChartData = {
    labels: Object.keys(analyticsData.byMonth).sort(),
    datasets: [
      {
        label: 'Total de Campañas',
        data: Object.keys(analyticsData.byMonth).sort().map(month => 
          analyticsData.byMonth[month].total
        ),
        borderColor: 'rgb(24, 144, 255)',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        fill: true,
      },
      {
        label: 'Generadas con IA',
        data: Object.keys(analyticsData.byMonth).sort().map(month => 
          analyticsData.byMonth[month].aiGenerated
        ),
        borderColor: 'rgb(82, 196, 26)',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        fill: true,
      }
    ],
  };

  // Datos para gráfico de calidad
  const qualityChartData = {
    labels: ['Excelente', 'Bueno', 'Regular', 'Pobre'],
    datasets: [
      {
        data: [
          analyticsData.byQuality.EXCELLENT,
          analyticsData.byQuality.GOOD,
          analyticsData.byQuality.FAIR,
          analyticsData.byQuality.POOR
        ],
        backgroundColor: [
          '#52c41a',
          '#1890ff',
          '#faad14',
          '#ff4d4f'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  // Datos para gráfico de presupuesto
  const budgetChartData = {
    labels: Object.keys(analyticsData.byMonth).sort(),
    datasets: [
      {
        label: 'Presupuesto Total ($)',
        data: Object.keys(analyticsData.byMonth).sort().map(month => 
          analyticsData.byMonth[month].budget
        ),
        backgroundColor: 'rgba(250, 173, 20, 0.6)',
        borderColor: 'rgb(250, 173, 20)',
        borderWidth: 1,
      }
    ],
  };

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
              <Tooltip title="Tendencia vs período anterior">
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

  // Renderizar métricas de calidad
  const renderQualityMetrics = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={12}>
        <Card title="Distribución de Calidad" extra={<PieChartOutlined />}>
          <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Pie data={qualityChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="Métricas de Calidad">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Row justify="space-between">
                <Text>Campañas Excelentes</Text>
                <Text strong>{analyticsData.byQuality.EXCELLENT}</Text>
              </Row>
              <Progress 
                percent={analyticsData.total > 0 ? Math.round((analyticsData.byQuality.EXCELLENT / analyticsData.total) * 100) : 0}
                strokeColor="#52c41a"
                size="small"
              />
            </div>
            
            <div>
              <Row justify="space-between">
                <Text>Campañas Buenas</Text>
                <Text strong>{analyticsData.byQuality.GOOD}</Text>
              </Row>
              <Progress 
                percent={analyticsData.total > 0 ? Math.round((analyticsData.byQuality.GOOD / analyticsData.total) * 100) : 0}
                strokeColor="#1890ff"
                size="small"
              />
            </div>
            
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
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Renderizar gráficos de tendencias
  const renderTrendCharts = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={16}>
        <Card title="Tendencia de Creación de Campañas" extra={<LineChartOutlined />}>
          <div style={{ height: 300 }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card title="Distribución de Presupuesto" extra={<BarChartOutlined />}>
          <div style={{ height: 300 }}>
            <Bar data={budgetChartData} options={chartOptions} />
          </div>
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

  // Renderizar tabla de resumen
  const renderSummaryTable = () => {
    const monthlyEntries = Object.entries(analyticsData.byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6);

    const columns = [
      {
        title: 'Mes',
        dataIndex: 'month',
        key: 'month',
        render: (month) => new Date(month + '-01').toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long' 
        })
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        sorter: (a, b) => a.total - b.total
      },
      {
        title: 'Con IA',
        dataIndex: 'aiGenerated',
        key: 'aiGenerated',
        render: (ai, record) => (
          <Space>
            <Text>{ai}</Text>
            <Text type="secondary">
              ({record.total > 0 ? Math.round((ai / record.total) * 100) : 0}%)
            </Text>
          </Space>
        )
      },
      {
        title: 'Excelentes',
        dataIndex: 'excellent',
        key: 'excellent',
        render: (excellent, record) => (
          <Space>
            <Text>{excellent}</Text>
            <Text type="secondary">
              ({record.total > 0 ? Math.round((excellent / record.total) * 100) : 0}%)
            </Text>
          </Space>
        )
      },
      {
        title: 'Presupuesto',
        dataIndex: 'budget',
        key: 'budget',
        render: (budget) => `$${budget.toLocaleString()}`,
        sorter: (a, b) => a.budget - b.budget
      }
    ];

    const dataSource = monthlyEntries.map(([month, data]) => ({
      key: month,
      month,
      ...data
    }));

    return (
      <Card title="Resumen Mensual" extra={<CalendarOutlined />}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
        />
      </Card>
    );
  };

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

          {/* Gráficos de tendencias */}
          {renderTrendCharts()}

          {/* Contenido inferior */}
          <Row gutter={16}>
            <Col span={16}>
              {renderSummaryTable()}
            </Col>
            <Col span={8}>
              {renderTopPerformers()}
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default AICampaignAnalytics;
