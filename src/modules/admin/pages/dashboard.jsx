import React from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  BarChartOutlined,
  RocketOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useSite } from '@zoom/context/SiteContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { siteName, siteConfig } = useSite();

  const stats = [
    {
      title: 'Usuarios Activos',
      value: 150,
      icon: <UserOutlined style={{ color: '#1890ff' }} />
    },
    {
      title: 'Configuraciones',
      value: 12,
      icon: <SettingOutlined style={{ color: '#52c41a' }} />
    },
    {
      title: 'Módulos Activos',
      value: 5,
      icon: <RocketOutlined style={{ color: '#fa8c16' }} />
    },
    {
      title: 'Métricas',
      value: 89,
      suffix: '%',
      icon: <BarChartOutlined style={{ color: '#eb2f96' }} />
    }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1>Dashboard de Administración</h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Bienvenido al panel de administración de <strong>{siteName.toUpperCase()}</strong>
        </p>
        <p style={{ color: '#999' }}>
          Usuario: <strong>{user?.name || user?.email}</strong>
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.icon}
                valueStyle={{ fontSize: '24px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Card title="Acciones Rápidas" style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button type="primary" icon={<UserOutlined />}>
            Gestionar Usuarios
          </Button>
          <Button icon={<SettingOutlined />}>
            Configuración
          </Button>
          <Button icon={<BarChartOutlined />}>
            Ver Reportes
          </Button>
          <Button icon={<RocketOutlined />}>
            Configurar Módulos
          </Button>
        </Space>
      </Card>

      {/* Site Information */}
      <Card title="Información del Sitio">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <h4>Configuración del Sitio</h4>
            <p><strong>Nombre:</strong> {siteConfig?.displayName || siteName}</p>
            <p><strong>Descripción:</strong> {siteConfig?.description || 'Sin descripción'}</p>
            <p><strong>API Base:</strong> {siteConfig?.api?.baseUrl || 'No configurado'}</p>
          </Col>
          <Col xs={24} md={12}>
            <h4>Características Habilitadas</h4>
            {siteConfig?.features ? (
              Object.entries(siteConfig.features).map(([feature, enabled]) => (
                <p key={feature}>
                  <strong>{feature}:</strong> {enabled ? '✅ Habilitado' : '❌ Deshabilitado'}
                </p>
              ))
            ) : (
              <p>No hay características configuradas</p>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboard;