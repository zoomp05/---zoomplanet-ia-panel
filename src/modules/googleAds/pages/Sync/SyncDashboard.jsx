/**
 * Dashboard de Sincronización
 */

import React from 'react';
import { Card, Typography, Alert, Row, Col, Button } from 'antd';
import { useNavigate } from 'react-router';
import { SyncOutlined, LinkOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const SyncDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Title level={3}>
        <SyncOutlined /> Sincronización con Marketing
      </Title>
      <Paragraph type="secondary">
        Gestiona la sincronización entre campañas de Google Ads y Marketing Campaigns
      </Paragraph>

      <Alert
        message="Relación Opcional"
        description="Las campañas de Google Ads pueden vincularse opcionalmente con Marketing Campaigns para un seguimiento unificado"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16}>
        <Col span={12}>
          <Card
            hoverable
            onClick={() => navigate('marketing-campaigns')}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <LinkOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>Vincular Campañas</Title>
            <Paragraph type="secondary">
              Conecta tus campañas de Google Ads con Marketing Campaigns
            </Paragraph>
            <Button type="primary">
              Gestionar Vínculos
            </Button>
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ textAlign: 'center' }}>
            <SyncOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>Sincronización Automática</Title>
            <Paragraph type="secondary">
              Las métricas se sincronizan automáticamente cada 15 minutos
            </Paragraph>
            <Button>
              Ver Configuración
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SyncDashboard;
