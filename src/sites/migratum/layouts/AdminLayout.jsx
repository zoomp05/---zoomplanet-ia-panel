import React from 'react';
import { Layout, Menu, theme, Dropdown, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;

/**
 * Layout administrativo principal de Migratum
 * Incluye sidebar con navegación y header con menú de usuario
 */
const AdminLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG, colorBorder },
  } = theme.useToken();

  // Menú de navegación del sidebar
  const menuItems = [
    {
      key: '/migratum/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/migratum/dashboard'),
    },
    {
      key: '/migratum/account',
      icon: <UserOutlined />,
      label: 'Mi Cuenta',
      onClick: () => navigate('/migratum/account'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      children: [
        {
          key: '/migratum/settings/general',
          label: 'General',
          onClick: () => navigate('/migratum/settings/general'),
        },
      ],
    },
  ];

  // Menú de usuario (dropdown en header)
  const userMenuItems = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Mi Perfil',
        onClick: () => navigate('/migratum/account'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Configuración',
        onClick: () => navigate('/migratum/settings/general'),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Cerrar Sesión',
        danger: true,
        onClick: () => {
          // TODO: Implementar logout
          navigate('/migratum/auth/login');
        },
      },
    ],
  };

  // Obtener la ruta actual para resaltar en el menú
  const selectedKey = location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold'
        }}>
          {collapsed ? 'M' : 'MIGRATUM'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: colorBgContainer,
            borderBottom: `1px solid ${colorBorder}`,
            padding: '0 24px',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          
          <Dropdown menu={userMenuItems} placement="bottomRight" trigger={['click']}>
            <Button type="text" icon={<UserOutlined />}>
              Admin
            </Button>
          </Dropdown>
        </Header>
        
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        
        <Footer style={{ textAlign: 'center' }}>
          Migratum Admin Panel ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
