// pages/testCreateCampaign.jsx
import React from 'react';
import { Link } from 'react-router';
import { Card, Button, Typography, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const TestCreateCampaignPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Alert
          message="Página de Test"
          description="Esta es una página simplificada para probar la ruta de crear campaña sin errores."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
        
        <Title level={2}>Test - Crear Campaña</Title>
        
        <Paragraph>
          Si puedes ver esta página, significa que el problema del "can't convert item to string" 
          estaba en los componentes más complejos del formulario.
        </Paragraph>
        
        <Link to="/marketing/campaigns">
          <Button icon={<ArrowLeftOutlined />}>
            Volver a Campañas
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default TestCreateCampaignPage;
