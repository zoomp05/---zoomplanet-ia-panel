/**
 * Crear Campaña Google Ads
 */

import React from 'react';
import { Card, Typography, Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router';

const { Title } = Typography;

const CreateCampaign = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Title level={3}>Crear Nueva Campaña Google Ads</Title>
      <Card>
        <Alert
          message="En desarrollo"
          description="Aquí podrás crear campañas de Google Ads y vincularlas opcionalmente con Marketing Campaigns"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Space>
          <Button onClick={() => navigate(-1)}>
            Volver
          </Button>
          <Button type="primary">
            Crear Campaña
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default CreateCampaign;
