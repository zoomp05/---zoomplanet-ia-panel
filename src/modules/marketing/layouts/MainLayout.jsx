import React from 'react';
import { Outlet } from 'react-router';
import { Layout, Menu, Avatar, Dropdown, Space, Badge } from 'antd';
import { 
  DashboardOutlined, 
  CampaignOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

/**
 * Layout principal del módulo Marketing
 */
const MarketingMainLayout = () => {
  const menuItems = [
    {
      key: '',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'campaigns',
      icon: <CampaignOutlined />,
      label: 'Campañas IA',
      children: [
        { key: 'campaigns', label: 'Ver Campañas' },
        { key: 'campaigns/create', label: 'Nueva Campaña' },
        { key: 'campaigns/create-ai', label: 'Asistente IA' },
      ]
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      children: [
        { key: 'analytics', label: 'Reportes' },
        { key: 'ai-analytics', label: 'Analytics IA' },
      ]
    },
    {
      key: 'leads',
      icon: <TeamOutlined />,
      label: 'CRM & Leads',
    },
    {
      key: 'configuration',
      icon: <SettingOutlined />,
      label: 'Configuración',
    }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={250}
        style={{
          background: '#001529',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #1f1f1f'
        }}>
          <h3 style={{ color: '#fff', margin: 0 }}>
            📈 Marketing IA
          </h3>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          style={{ borderRight: 0 }}
          onClick={({ key }) => {
            if (key) {
              const currentPath = window.location.pathname;
              const pathParts = currentPath.split('/').filter(Boolean);
              const siteIndex = pathParts.findIndex(part => part);
              const siteName = pathParts[siteIndex];
              
              let newPath;
              if (key === '') {
                newPath = `/${siteName}/marketing`;
              } else {
                newPath = `/${siteName}/marketing/${key}`;
              }
              
              window.history.pushState({}, '', newPath);
              window.location.reload(); // Temporal hasta implementar navegación SPA
            }
          }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#1890ff' }}>
              Marketing & Campañas IA
            </h2>
          </div>
          
          <Space size="middle">
            <Badge count={3}>
              <BellOutlined style={{ fontSize: 18 }} />
            </Badge>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size={32} icon={<UserOutlined />} />
                <span>Usuario Marketing</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MarketingMainLayout;
