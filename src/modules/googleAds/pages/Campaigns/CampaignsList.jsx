/**
 * Listado de Campañas de Google Ads
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag,
  Input,
  Row,
  Col,
  Typography,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';

const { Title } = Typography;

const CampaignsList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    // TODO: Conectar con API
    setTimeout(() => {
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
          conversions: 42,
          linkedMarketingCampaign: 'camp-mk-001' // Vinculada con Marketing
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
          conversions: 28,
          linkedMarketingCampaign: null
        },
        {
          key: '3',
          id: 'gads-003',
          name: 'Brand Awareness Q4',
          status: 'paused',
          budget: 1000,
          spent: 523.75,
          impressions: 45000,
          clicks: 890,
          conversions: 67,
          linkedMarketingCampaign: 'camp-mk-003'
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      title: 'Campaña',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      render: (text, record) => (
        <div>
          <Button type="link" onClick={() => navigate(record.id)}>
            {text}
          </Button>
          {record.linkedMarketingCampaign && (
            <Tag color="purple" style={{ marginLeft: 8 }}>
              Vinculada con Marketing
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Activa' : 'Pausada'}
        </Tag>
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
      render: (spent, record) => (
        <div>
          <div>${spent.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#999' }}>
            {((spent / record.budget) * 100).toFixed(1)}% del presupuesto
          </div>
        </div>
      )
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
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(record.id)}
          >
            Ver
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`${record.id}/edit`)}
          >
            Editar
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3}>Campañas de Google Ads</Title>
        </Col>
        <Col>
          <Space>
            <Button icon={<SyncOutlined />} onClick={loadCampaigns}>
              Sincronizar
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('create')}>
              Nueva Campaña
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Campañas"
              value={campaigns.length}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Activas"
              value={campaigns.filter(c => c.status === 'active').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Vinculadas con Marketing"
              value={campaigns.filter(c => c.linkedMarketingCampaign).length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Presupuesto Total"
              value={campaigns.reduce((sum, c) => sum + c.budget, 0)}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Input
          placeholder="Buscar campañas..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, width: 300 }}
        />
        
        <Table
          columns={columns}
          dataSource={campaigns}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default CampaignsList;
