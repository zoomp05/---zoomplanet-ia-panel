import React from 'react';
import { Link } from 'react-router';
import { Card, Typography, Space, Button, Divider } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useContextualRoute } from '@zoom/hooks';

const { Title, Paragraph } = Typography;

const LeadsPage = () => {
  const getModuleRoute = useContextualRoute("module");
  
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
          <span style={{ color: '#8c8c8c' }}>/</span>
          <Link to={getModuleRoute("")} style={{ color: '#8c8c8c' }}>Marketing</Link>
          <span style={{ color: '#8c8c8c' }}>/</span>
          <span>CRM & Leads</span>
        </Space>
        
        <Title level={2} style={{ margin: 0 }}>
          CRM & Gestión de Leads
        </Title>
        <Paragraph style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
          Gestiona y da seguimiento a tus leads y conversiones de campañas
        </Paragraph>
      </div>

      <Divider />

      {/* Contenido Principal */}
      <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <UserOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 24 }} />
          
          <Title level={3} style={{ color: '#262626' }}>
            CRM & Leads
          </Title>
          
          <Paragraph style={{ fontSize: 16, color: '#8c8c8c', marginBottom: 32 }}>
            Esta sección estará disponible próximamente para gestionar tus leads, 
            seguimiento de conversiones y análisis de rendimiento de campañas.
          </Paragraph>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <Title level={5} style={{ margin: 0, color: '#595959' }}>
                Funcionalidades Planificadas:
              </Title>
              <ul style={{ textAlign: 'left', margin: '12px 0 0 0', color: '#8c8c8c' }}>
                <li>Gestión de leads de campañas</li>
                <li>Seguimiento de conversiones</li>
                <li>Análisis de embudo de ventas</li>
                <li>Reportes de ROI por campaña</li>
                <li>Integración con CRM externos</li>
              </ul>
            </div>

            <Button type="primary" size="large" disabled>
              Próximamente Disponible
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LeadsPage;
