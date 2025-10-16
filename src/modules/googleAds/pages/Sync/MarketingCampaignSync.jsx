/**
 * Vinculación con Marketing Campaigns
 * 
 * Permite vincular campañas de Google Ads con Marketing Campaigns (opcional)
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Tag, 
  Space,
  Modal,
  Select,
  Alert,
  Row,
  Col
} from 'antd';
import { LinkOutlined, DisconnectOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const MarketingCampaignSync = () => {
  const [googleAdsCampaigns, setGoogleAdsCampaigns] = useState([]);
  const [marketingCampaigns, setMarketingCampaigns] = useState([]);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [selectedGoogleAd, setSelectedGoogleAd] = useState(null);
  const [selectedMarketing, setSelectedMarketing] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // TODO: Cargar desde API
    setGoogleAdsCampaigns([
      {
        key: '1',
        id: 'gads-001',
        name: 'Campaña Black Friday 2025',
        linkedTo: 'camp-mk-001',
        linkedName: 'Black Friday 2025 - Marketing'
      },
      {
        key: '2',
        id: 'gads-002',
        name: 'Remarketing - Carrito Abandonado',
        linkedTo: null,
        linkedName: null
      }
    ]);

    setMarketingCampaigns([
      { id: 'camp-mk-001', name: 'Black Friday 2025 - Marketing' },
      { id: 'camp-mk-002', name: 'Cyber Monday 2025' },
      { id: 'camp-mk-003', name: 'Q4 Brand Awareness' }
    ]);
  };

  const handleLink = () => {
    // TODO: Conectar con API
    console.log('Vincular:', selectedGoogleAd, 'con', selectedMarketing);
    setLinkModalVisible(false);
    loadData();
  };

  const handleUnlink = (googleAdsId) => {
    // TODO: Conectar con API
    console.log('Desvincular:', googleAdsId);
    loadData();
  };

  const columns = [
    {
      title: 'Campaña Google Ads',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Estado de Vinculación',
      key: 'linkStatus',
      render: (_, record) => (
        record.linkedTo ? (
          <Tag color="green" icon={<LinkOutlined />}>
            Vinculada
          </Tag>
        ) : (
          <Tag color="default">
            Sin vincular
          </Tag>
        )
      )
    },
    {
      title: 'Marketing Campaign',
      dataIndex: 'linkedName',
      key: 'linkedName',
      render: (text) => text || <span style={{ color: '#999' }}>-</span>
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.linkedTo ? (
            <Button
              size="small"
              danger
              icon={<DisconnectOutlined />}
              onClick={() => handleUnlink(record.id)}
            >
              Desvincular
            </Button>
          ) : (
            <Button
              size="small"
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => {
                setSelectedGoogleAd(record.id);
                setLinkModalVisible(true);
              }}
            >
              Vincular
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3}>
            <LinkOutlined /> Vinculación con Marketing Campaigns
          </Title>
          <Paragraph type="secondary">
            Conecta tus campañas de Google Ads con Marketing Campaigns para un seguimiento unificado
          </Paragraph>
        </Col>
        <Col>
          <Button icon={<SyncOutlined />} onClick={loadData}>
            Actualizar
          </Button>
        </Col>
      </Row>

      <Alert
        message="Vinculación Opcional"
        description={
          <div>
            <p>La vinculación con Marketing Campaigns es <strong>opcional</strong> y te permite:</p>
            <ul>
              <li>Sincronizar métricas automáticamente entre ambas plataformas</li>
              <li>Ver el rendimiento de Google Ads dentro de Marketing Campaigns</li>
              <li>Gestionar presupuestos de forma unificada</li>
              <li>Análisis comparativo entre canales</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={googleAdsCampaigns}
        />
      </Card>

      {/* Modal para vincular */}
      <Modal
        title="Vincular con Marketing Campaign"
        open={linkModalVisible}
        onOk={handleLink}
        onCancel={() => setLinkModalVisible(false)}
        okText="Vincular"
        cancelText="Cancelar"
      >
        <Paragraph>
          Selecciona una Marketing Campaign para vincular con esta campaña de Google Ads:
        </Paragraph>
        <Select
          style={{ width: '100%' }}
          placeholder="Seleccionar Marketing Campaign"
          value={selectedMarketing}
          onChange={setSelectedMarketing}
        >
          {marketingCampaigns.map(campaign => (
            <Option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default MarketingCampaignSync;
