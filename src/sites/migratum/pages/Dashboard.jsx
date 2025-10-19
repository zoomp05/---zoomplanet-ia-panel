import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined, 
  TeamOutlined,
  SettingOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

/**
 * Dashboard principal de Migratum
 * Panel de control administrativo
 */
const Dashboard = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard Administrativo</Title>
      <Title level={4} type="secondary">
        Bienvenido al panel de administración de Migratum
      </Title>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Usuarios Totales"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Proyectos Activos"
              value={0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cuentas"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Configuraciones"
              value={0}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Acciones Rápidas">
            <p>Panel de administración en construcción...</p>
            <p>Aquí se mostrarán las herramientas y módulos administrativos de Migratum.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
