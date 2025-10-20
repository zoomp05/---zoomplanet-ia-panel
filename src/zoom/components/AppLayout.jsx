import React from 'react';
import { Layout, Button, theme } from 'antd';
import { Outlet } from 'react-router';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined 
} from '@ant-design/icons';

import SidebarMenu from './SidebarMenu';
import TopMenu from './TopMenu';

const { Header, Sider, Content, Footer } = Layout;

/**
 * Layout completo reutilizable con sidebar y header
 * Combina SidebarMenu y TopMenu en un layout responsivo
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.sidebarMenuConfig - Configuración del menú lateral
 * @param {Object} props.topMenuConfig - Configuración del menú superior
 * @param {string} props.siteName - Nombre del sitio
 * @param {React.Component} props.logo - Componente de logo
 * @param {Object} props.user - Datos del usuario actual
 * @param {Function} props.onLogout - Callback para logout
 * @param {string} props.footerText - Texto del footer (opcional)
 * @param {Object} props.sidebarProps - Props adicionales para el Sider
 * @param {Object} props.contentProps - Props adicionales para el Content
 */
const AppLayout = ({
  sidebarMenuConfig = [],
  topMenuConfig,
  siteName = 'App',
  logo: LogoComponent,
  user,
  onLogout,
  footerText,
  sidebarProps = {},
  contentProps = {},
  children
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG, colorBorder },
  } = theme.useToken();

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Configuración por defecto del sidebar
  const defaultSidebarProps = {
    collapsible: true,
    collapsed,
    onCollapse: setCollapsed,
    width: 200,
    collapsedWidth: 80,
    style: {
      overflow: 'auto',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
    },
    ...sidebarProps
  };

  // Calcular margen del layout principal
  const mainLayoutMargin = collapsed ? 
    (defaultSidebarProps.collapsedWidth || 80) : 
    (defaultSidebarProps.width || 200);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider {...defaultSidebarProps}>
        {/* Logo/Título del sitio en el sidebar */}
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
          {LogoComponent ? (
            collapsed ? (
              siteName.charAt(0).toUpperCase()
            ) : (
              <LogoComponent size="medium" />
            )
          ) : (
            collapsed ? siteName.charAt(0).toUpperCase() : siteName.toUpperCase()
          )}
        </div>
        
        {/* Menú lateral */}
        <SidebarMenu 
          menuConfig={sidebarMenuConfig}
          theme="dark"
          mode="inline"
        />
      </Sider>
      
      {/* Layout principal */}
      <Layout style={{ 
        marginLeft: mainLayoutMargin, 
        transition: 'all 0.2s' 
      }}>
        {/* Header */}
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            background: colorBgContainer,
            borderBottom: `1px solid ${colorBorder}`,
            padding: '0 24px',
            height: 64
          }}
        >
          {/* Botón de colapsar sidebar */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ fontSize: 16, marginRight: 16 }}
          />
          
          {/* Menú superior */}
          <TopMenu
            userMenuConfig={topMenuConfig}
            siteName={siteName}
            logo={LogoComponent}
            user={user}
            onLogout={onLogout}
          />
        </Header>
        
        {/* Contenido principal */}
        <Content style={{ 
          margin: '24px 16px 0', 
          overflow: 'initial',
          ...contentProps?.style 
        }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children || <Outlet />}
          </div>
        </Content>
        
        {/* Footer */}
        {footerText && (
          <Footer style={{ textAlign: 'center' }}>
            {footerText}
          </Footer>
        )}
      </Layout>
    </Layout>
  );
};

export default AppLayout;