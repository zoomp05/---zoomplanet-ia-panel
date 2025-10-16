import React from 'react';
import { Link } from 'react-router';
import { Card, Typography, Space, Button, Divider, Row, Col } from 'antd';
import { ArrowLeftOutlined, SettingOutlined, ApiOutlined, RobotOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useContextualRoute } from '@zoom/hooks';

const { Title, Paragraph } = Typography;

const ConfigurationPage = () => {
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
          <span>Configuración</span>
        </Space>
        
        <Title level={2} style={{ margin: 0 }}>
          Configuración de Marketing
        </Title>
        <Paragraph style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
          Configura los parámetros y ajustes del módulo de marketing
        </Paragraph>
      </div>

      <Divider />

      {/* Contenido Principal */}
      <Row gutter={[24, 24]}>
        {/* Sección principal */}
        <Col span={16}>
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ maxWidth: 400, margin: '0 auto' }}>
              <SettingOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 24 }} />
              
              <Title level={3} style={{ color: '#262626' }}>
                Configuración
              </Title>
              
              <Paragraph style={{ fontSize: 16, color: '#8c8c8c', marginBottom: 32 }}>
                Las opciones de configuración estarán disponibles próximamente 
                para personalizar el comportamiento del módulo de marketing.
              </Paragraph>

              <Button type="primary" size="large" disabled>
                Próximamente Disponible
              </Button>
            </div>
          </Card>
        </Col>

        {/* Panel lateral con categorías */}
        <Col span={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card size="small" title="Configuraciones Planificadas">
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                
                <div style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: 6 }}>
                  <Space>
                    <RobotOutlined style={{ color: '#1890ff' }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>Configuración de IA</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>Modelos, tokens, prompts</div>
                    </div>
                  </Space>
                </div>

                <div style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: 6 }}>
                  <Space>
                    <ApiOutlined style={{ color: '#52c41a' }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>Integraciones</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>APIs externas, webhooks</div>
                    </div>
                  </Space>
                </div>

                <div style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: 6 }}>
                  <Space>
                    <DatabaseOutlined style={{ color: '#faad14' }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>Datos y Templates</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>Plantillas, audiencias</div>
                    </div>
                  </Space>
                </div>

              </Space>
            </Card>

            <Card size="small" title="Estado del Sistema">
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12 }}>API de IA:</span>
                  <span style={{ fontSize: 12, color: '#52c41a' }}>●  Conectada</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12 }}>Base de Datos:</span>
                  <span style={{ fontSize: 12, color: '#52c41a' }}>●  Activa</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12 }}>Analytics:</span>
                  <span style={{ fontSize: 12, color: '#faad14' }}>●  En desarrollo</span>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ConfigurationPage;
