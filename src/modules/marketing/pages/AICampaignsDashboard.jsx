// src/modules/marketing/pages/AICampaignsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Progress,
  Tag,
  Input,
  Select,
  DatePicker,
  Tooltip,
  Avatar,
  Statistic,
  Badge,
  Drawer,
  Tabs,
  List,
  Empty,
  Dropdown,
  Menu,
  Modal,
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  RobotOutlined,
  BulbOutlined,
  TargetOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  StarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import useAICampaigns from '../hooks/useAICampaigns.js';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

/**
 * Dashboard principal de campañas AI
 */
const AICampaignsDashboard = () => {
  const navigate = useNavigate();

  // Estados locales
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    qualityScore: null,
    aiGenerated: null,
    dateRange: null,
    isActive: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  });
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Hook de AI Campaigns
  const {
    useCampaignBriefs,
    deleteCampaignBrief,
    getCampaignWorkflowStatus
  } = useAICampaigns();

  // Query para obtener campañas
  const { data: campaignsData, loading, refetch } = useCampaignBriefs({
    filter: {
      ...filters,
      search: searchText || undefined
    },
    pagination,
    sort: { field: 'createdAt', direction: 'DESC' }
  });

  const campaigns = campaignsData?.campaignBriefs?.nodes || [];
  const totalCount = campaignsData?.campaignBriefs?.totalCount || 0;

  // Efecto para recargar datos cuando cambien los filtros
  useEffect(() => {
    refetch();
  }, [filters, searchText, pagination, refetch]);

  // Manejar búsqueda
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, page: 1 });
  };

  // Manejar cambio de filtros
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  // Manejar eliminación de campaña
  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Eliminar campaña?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteCampaignBrief(id);
          refetch();
        } catch (error) {
          console.error('Error deleting campaign:', error);
        }
      }
    });
  };

  // Renderizar estado de calidad
  const renderQualityScore = (score) => {
    const configs = {
      EXCELLENT: { color: 'success', text: 'Excelente' },
      GOOD: { color: 'processing', text: 'Bueno' },
      FAIR: { color: 'warning', text: 'Regular' },
      POOR: { color: 'error', text: 'Pobre' }
    };
    
    const config = configs[score] || { color: 'default', text: 'N/A' };
    
    return (
      <Badge status={config.color} text={config.text} />
    );
  };

  // Renderizar progreso del workflow
  const renderWorkflowProgress = (briefId) => {
    const [status, setStatus] = useState(null);

    useEffect(() => {
      getCampaignWorkflowStatus(briefId).then(setStatus);
    }, [briefId]);

    if (!status) {
      return <Progress percent={0} size="small" />;
    }

    const completedSteps = [
      status.briefComplete,
      status.objectivesComplete,
      status.strategyComplete,
      status.documentationComplete,
      status.mediaIdeasComplete
    ].filter(Boolean).length;

    const progress = (completedSteps / 5) * 100;

    return (
      <Tooltip title={`${completedSteps}/5 componentes completados`}>
        <Progress 
          percent={Math.round(progress)} 
          size="small" 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      </Tooltip>
    );
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Campaña',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description?.substring(0, 60)}...
          </Text>
          <Space size="small">
            {record.aiGenerated && (
              <Tag color="blue" icon={<RobotOutlined />} style={{ fontSize: 10 }}>
                IA
              </Tag>
            )}
            <Tag color="purple">{record.version?.full}</Tag>
          </Space>
        </Space>
      ),
      sorter: true,
      width: 300
    },
    {
      title: 'Progreso del Workflow',
      key: 'progress',
      render: (_, record) => renderWorkflowProgress(record.id),
      width: 200
    },
    {
      title: 'Calidad',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      render: renderQualityScore,
      filters: [
        { text: 'Excelente', value: 'EXCELLENT' },
        { text: 'Bueno', value: 'GOOD' },
        { text: 'Regular', value: 'FAIR' },
        { text: 'Pobre', value: 'POOR' }
      ],
      width: 120
    },
    {
      title: 'Presupuesto',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget) => (
        <Text strong>
          <DollarOutlined /> {budget?.toLocaleString() || 'N/A'}
        </Text>
      ),
      sorter: true,
      width: 120
    },
    {
      title: 'Creador',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (user) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text style={{ fontSize: 12 }}>{user?.name || 'N/A'}</Text>
        </Space>
      ),
      width: 120
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Text style={{ fontSize: 12 }}>
          <CalendarOutlined /> {new Date(date).toLocaleDateString()}
        </Text>
      ),
      sorter: true,
      width: 100
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver workflow">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/marketing/ai-workflow/${record.id}`)}
            />
          </Tooltip>
          
          <Tooltip title="Ver detalles">
            <Button
              size="small"
              icon={<BulbOutlined />}
              onClick={() => {
                setSelectedCampaign(record);
                setShowDetails(true);
              }}
            />
          </Tooltip>

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item 
                  key="edit" 
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/marketing/campaigns/edit/${record.id}`)}
                >
                  Editar
                </Menu.Item>
                <Menu.Item 
                  key="duplicate" 
                  icon={<BulbOutlined />}
                >
                  Duplicar
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  key="delete" 
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDelete(record.id)}
                >
                  Eliminar
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
      width: 150
    }
  ];

  // Configuración de selección de filas
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  // Renderizar estadísticas del dashboard
  const renderStatistics = () => {
    const aiGenerated = campaigns.filter(c => c.aiGenerated).length;
    const excellentQuality = campaigns.filter(c => c.qualityScore === 'EXCELLENT').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total de Campañas"
              value={totalCount}
              prefix={<BulbOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Generadas con IA"
              value={aiGenerated}
              suffix={`/ ${campaigns.length}`}
              prefix={<RobotOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Calidad Excelente"
              value={excellentQuality}
              suffix={`/ ${campaigns.length}`}
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Presupuesto Total"
              value={totalBudget}
              prefix="$"
              formatter={(value) => value.toLocaleString()}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Renderizar filtros
  const renderFilters = () => (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col flex="auto">
          <Search
            placeholder="Buscar campañas..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: '100%' }}
          />
        </Col>
        <Col>
          <Select
            placeholder="Calidad"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('qualityScore', value)}
          >
            <Option value="EXCELLENT">Excelente</Option>
            <Option value="GOOD">Bueno</Option>
            <Option value="FAIR">Regular</Option>
            <Option value="POOR">Pobre</Option>
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="Tipo"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('aiGenerated', value)}
          >
            <Option value={true}>Con IA</Option>
            <Option value={false}>Manual</Option>
          </Select>
        </Col>
        <Col>
          <RangePicker
            onChange={(dates) => handleFilterChange('dateRange', dates)}
            style={{ width: 200 }}
          />
        </Col>
      </Row>
    </Card>
  );

  // Renderizar drawer de detalles
  const renderDetailsDrawer = () => (
    <Drawer
      title="Detalles de la Campaña"
      placement="right"
      width={600}
      open={showDetails}
      onClose={() => setShowDetails(false)}
      extra={
        <Space>
          <Button 
            type="primary"
            onClick={() => navigate(`/marketing/ai-workflow/${selectedCampaign?.id}`)}
          >
            Ver Workflow
          </Button>
        </Space>
      }
    >
      {selectedCampaign && (
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Resumen" key="overview">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={4}>{selectedCampaign.name}</Title>
                <Paragraph>{selectedCampaign.description}</Paragraph>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" title="Información General">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary">Presupuesto:</Text>
                        <br />
                        <Text strong>${selectedCampaign.budget?.toLocaleString()}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Duración:</Text>
                        <br />
                        <Text>{selectedCampaign.timeline}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Calidad:</Text>
                        <br />
                        {renderQualityScore(selectedCampaign.qualityScore)}
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Metadatos">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary">Versión:</Text>
                        <br />
                        <Tag color="purple">{selectedCampaign.version?.full}</Tag>
                      </div>
                      <div>
                        <Text type="secondary">Generado con IA:</Text>
                        <br />
                        {selectedCampaign.aiGenerated ? (
                          <Tag color="blue" icon={<RobotOutlined />}>Sí</Tag>
                        ) : (
                          <Tag>Manual</Tag>
                        )}
                      </div>
                      <div>
                        <Text type="secondary">Creado:</Text>
                        <br />
                        <Text>{new Date(selectedCampaign.createdAt).toLocaleString()}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>

              {selectedCampaign.keyMessages && (
                <div>
                  <Text strong>Mensajes Clave:</Text>
                  <div style={{ marginTop: 8 }}>
                    {selectedCampaign.keyMessages.map((message, index) => (
                      <Tag key={index} color="blue">{message}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {selectedCampaign.successMetrics && (
                <div>
                  <Text strong>Métricas de Éxito:</Text>
                  <List
                    size="small"
                    dataSource={selectedCampaign.successMetrics}
                    renderItem={(metric) => (
                      <List.Item>
                        <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        {metric}
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Space>
          </TabPane>

          <TabPane tab="Audiencia" key="audience">
            <Card>
              <Title level={5}>Audiencia Objetivo</Title>
              <Paragraph>{selectedCampaign.targetAudience}</Paragraph>
            </Card>
          </TabPane>

          <TabPane tab="IA Info" key="ai-info">
            {selectedCampaign.aiGenerationInfo ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Card size="small" title="Información de Generación">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary">Modelo:</Text>
                      <br />
                      <Text>{selectedCampaign.aiGenerationInfo.model}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Tiempo de Procesamiento:</Text>
                      <br />
                      <Text>{selectedCampaign.aiGenerationInfo.processingTime}ms</Text>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                      <Text type="secondary">Costo:</Text>
                      <br />
                      <Text>${selectedCampaign.aiGenerationInfo.cost?.toFixed(4)}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Fecha de Generación:</Text>
                      <br />
                      <Text>{new Date(selectedCampaign.aiGenerationInfo.generatedAt).toLocaleString()}</Text>
                    </Col>
                  </Row>
                </Card>
              </Space>
            ) : (
              <Empty description="Esta campaña no fue generada con IA" />
            )}
          </TabPane>
        </Tabs>
      )}
    </Drawer>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <RobotOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            Campañas IA
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/marketing/campaigns/create-ai')}
              size="large"
            >
              Nueva Campaña IA
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Estadísticas */}
      {renderStatistics()}

      {/* Filtros */}
      {renderFilters()}

      {/* Acciones masivas */}
      {selectedRowKeys.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Text>
              {selectedRowKeys.length} campañas seleccionadas
            </Text>
            <Button size="small" icon={<ThunderboltOutlined />}>
              Mejorar con IA
            </Button>
            <Button size="small" icon={<DeleteOutlined />} danger>
              Eliminar
            </Button>
          </Space>
        </Card>
      )}

      {/* Tabla de campañas */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={campaigns}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} campañas`,
            onChange: (page, pageSize) => 
              setPagination({ page, limit: pageSize })
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Drawer de detalles */}
      {renderDetailsDrawer()}
    </div>
  );
};

export default AICampaignsDashboard;
