import React from 'react';
import { Card, Typography, Space } from 'antd';
import { useSite } from '../../../contexts/SiteContext';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const { siteName, siteConfig } = useSite();

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: siteConfig?.theme?.backgroundColor || '#f0f2f5' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>Dashboard de {siteConfig?.displayName || siteName.toUpperCase()}</Title>
          <Paragraph>
            Bienvenido al sistema de gestión {siteConfig?.displayName || siteName}.
          </Paragraph>
          <Paragraph>
            {siteConfig?.description || 'Panel de administración del sistema.'}
          </Paragraph>
        </Card>

        <Card title="Características Disponibles">
          {siteConfig?.features && (
            <Space direction="vertical">
              {Object.entries(siteConfig.features).map(([feature, enabled]) => (
                <div key={feature}>
                  <strong>{feature}:</strong> {enabled ? '✅ Habilitado' : '❌ Deshabilitado'}
                </div>
              ))}
            </Space>
          )}
        </Card>

        <Card title="Configuración de API">
          {siteConfig?.api && (
            <Space direction="vertical">
              <div><strong>Base URL:</strong> {siteConfig.api.baseUrl}</div>
              <div><strong>GraphQL Endpoint:</strong> {siteConfig.api.graphqlEndpoint}</div>
            </Space>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default Dashboard;
