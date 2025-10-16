// pages/campaigns.jsx
import React, { useState } from 'react';
import { Link } from 'react-router';
import { 
  Card, 
  Input, 
  Select, 
  Row, 
  Col, 
  Button, 
  Space, 
  Tag, 
  Pagination,
  Typography,
  Spin,
  Alert,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  TrophyOutlined,
  AimOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useContextualRoute } from '@zoom/hooks';
import { useMarketingCampaigns } from '../hooks/useMarketingCampaigns';
import { CAMPAIGN_STATUS, CAMPAIGN_TYPES } from '../constants/marketingConstants';

const { Title, Text } = Typography;
const { Option } = Select;

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

const getTypeIcon = (type) => {
  const iconMap = {
    'AWARENESS': <EyeOutlined />,
    'CONSIDERATION': <AimOutlined />,
    'CONVERSION': <TrophyOutlined />,
    'RETENTION': <CheckCircleOutlined />,
    'ADVOCACY': <PlayCircleOutlined />
  };
  return iconMap[type] || <TrophyOutlined />;
};

const formatCurrency = (amount, currency = 'USD') => {
  if (!amount) return 'No especificado';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const CampaignsPage = () => {
  // Rutas contextuales para el módulo
  const getModuleRoute = useContextualRoute("module");
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [filter, setFilter] = useState({});
  const [pagination, setPagination] = useState({ page: currentPage, limit: pageSize });

  const { campaigns, totalCount, loading, error } = useMarketingCampaigns(filter, pagination);

  // Filtrar campañas localmente (simulación)
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchTerm || 
      campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    const matchesType = !typeFilter || campaign.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setPagination({ page, limit: pageSize });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error al cargar las campañas"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Campañas Asistidas por IA
          </Title>
          <Text type="secondary">
            Gestiona todas tus campañas creadas con asistencia de inteligencia artificial
          </Text>
        </div>
        <Link to={getModuleRoute("campaigns/create-ai")}>
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Nueva Campaña con IA
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Buscar campañas..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: '100%' }}
              size="large"
              onChange={handleStatusFilter}
            >
              <Option value="ACTIVE">Activa</Option>
              <Option value="PAUSED">Pausada</Option>
              <Option value="COMPLETED">Completada</Option>
              <Option value="DRAFT">Borrador</Option>
              <Option value="CANCELLED">Cancelada</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Tipo"
              allowClear
              style={{ width: '100%' }}
              size="large"
              onChange={handleTypeFilter}
            >
              <Option value="AWARENESS">Conciencia</Option>
              <Option value="CONSIDERATION">Consideración</Option>
              <Option value="CONVERSION">Conversión</Option>
              <Option value="RETENTION">Retención</Option>
              <Option value="ADVOCACY">Promoción</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              <Text type="secondary">
                {filteredCampaigns.length} de {totalCount} campañas
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Grid de campañas */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <Empty
            description="No se encontraron campañas"
            style={{ padding: '60px 0' }}
          >
            <Link to={getModuleRoute("campaigns/create-ai")}>
              <Button type="primary" icon={<PlusOutlined />}>
                Crear primera campaña con IA
              </Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {filteredCampaigns.map((campaign) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={campaign.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Link key="view" to={getModuleRoute(`campaigns/${campaign.id}`)}>
                      <EyeOutlined /> Ver
                    </Link>,
                    <Link key="edit" to={getModuleRoute(`campaigns/${campaign.id}/edit`)}>
                      <EditOutlined /> Editar
                    </Link>
                  ]}
                >
                  <div style={{ height: '180px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <Space>
                        {getTypeIcon(campaign.type)}
                        <Title level={5} style={{ margin: 0 }}>
                          {campaign.name}
                        </Title>
                      </Space>
                    </div>
                    
                    <div style={{ marginBottom: '12px', flex: 1 }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {campaign.description ? 
                          (campaign.description.length > 80 ? 
                            `${campaign.description.substring(0, 80)}...` : 
                            campaign.description
                          ) : 
                          'Sin descripción'
                        }
                      </Text>
                    </div>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Tag color={getStatusColor(campaign.status)}>
                            {getStatusLabel(campaign.status)}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {campaign.type}
                          </Text>
                        </div>
                        
                        {campaign.budget?.allocated && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>Presupuesto:</Text>
                            <Text strong style={{ fontSize: '11px' }}>
                              {formatCurrency(campaign.budget.allocated, campaign.budget.currency)}
                            </Text>
                          </div>
                        )}
                        
                        {campaign.createdAt && (
                          <Text type="secondary" style={{ fontSize: '10px' }}>
                            Creada: {new Date(campaign.createdAt).toLocaleDateString('es-MX')}
                          </Text>
                        )}
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Paginación */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Pagination
              current={currentPage}
              total={totalCount}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} de ${total} campañas`
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignsPage;
