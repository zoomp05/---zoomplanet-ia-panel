import React from 'react';
import { Outlet } from 'react-router';
import { Layout, Button, Typography, Space } from 'antd';
import { HomeOutlined, LoginOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * Layout por defecto del módulo Auth
 * Layout simple con solo navegación básica para páginas de autenticación
 */
const AuthLayout = () => {
  const handleGoHome = () => {
    // Detectar sitio actual
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const siteName = pathParts[0] || 'zoomy';
    window.location.href = `/${siteName}`;
  };

  const handleGoAdmin = () => {
    // Detectar sitio actual
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const siteName = pathParts[0] || 'zoomy';
    window.location.href = `/${siteName}/admin`;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          🔐 Auth Module
        </Title>
        
        <Space>
          <Button 
            icon={<HomeOutlined />}
            onClick={handleGoHome}
          >
            Home
          </Button>
          <Button 
            type="primary"
            icon={<LoginOutlined />}
            onClick={handleGoAdmin}
          >
            Admin Panel
          </Button>
        </Space>
      </Header>

      <Content style={{ 
        padding: '48px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: '600px'
        }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
