// pages/simpleIndex.jsx
import React from 'react';
import { Link } from 'react-router';
import { Card, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const SimpleMarketingDashboard = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Marketing Dashboard</Title>
        <Paragraph>
          Bienvenido al módulo de marketing. Este es un dashboard simplificado para debug.
        </Paragraph>
        <Link to="campaigns/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Nueva Campaña
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default SimpleMarketingDashboard;
