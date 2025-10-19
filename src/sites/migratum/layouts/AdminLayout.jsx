import React from 'react';
import { Layout, Menu, theme, Dropdown, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  HomeOutlined,
  WalletOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

import { useModuleNavigation } from '@hooks/useModuleNavigation';
import { useMenuNormalizer } from '@hooks/useMenuNormalizer';
import Logo from '@components/Logo/Logo';

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { routeContext, navigateContextual, isActive } = useModuleNavigation();
  const { normalizeMenuItems } = useMenuNormalizer();
  
  const {
    token: { colorBgContainer, borderRadiusLG, colorBorder },
  } = theme.useToken();

  const migratumMenuConfig = [
    {
      key: "dashboard",
      icon: React.createElement(DashboardOutlined),
      label: "Dashboard",
      url: "/dashboard",
      scope: "site"
    },
    {
      key: "kyc",
      icon: React.createElement(SafetyCertificateOutlined),
      label: "KYC y Verificación",
      scope: "site",
      children: [
        { key: "kyc-dashboard", label: "Dashboard KYC", url: "/kyc" },
        { key: "kyc-pending", label: "Pendientes", url: "/kyc/pending" },
        { key: "kyc-approved", label: "Aprobados", url: "/kyc/approved" },
        { key: "kyc-rejected", label: "Rechazados", url: "/kyc/rejected" }
      ]
    },
    {
      key: "wallet",
      icon: React.createElement(WalletOutlined),
      label: "Wallet y Token",
      scope: "site",
      children: [
        { key: "wallet-dashboard", label: "Dashboard", url: "/wallet" },
        { key: "wallet-management", label: "Gestión Wallets", url: "/wallet/management" },
        { key: "wallet-transactions", label: "Transacciones", url: "/wallet/transactions" },
        { key: "wallet-token", label: "Token MIG", url: "/wallet/token-management" }
      ]
    },
    {
      key: "credits",
      icon: React.createElement(CreditCardOutlined),
      label: "Créditos",
      scope: "site",
      children: [
        { key: "credits-pending", label: "Pendientes", url: "/credits/pending" },
        { key: "credits-active", label: "Activos", url: "/credits/approved" },
        { key: "credits-evaluation", label: "Evaluación", url: "/credits/evaluation" }
      ]
    },
    {
      key: "housing",
      icon: React.createElement(HomeOutlined),
      label: "Vivienda",
      scope: "site",
      children: [
        { key: "housing-properties", label: "Propiedades", url: "/housing/properties" },
        { key: "housing-applications", label: "Aplicaciones", url: "/housing/applications" }
      ]
    },
    {
      key: "admin-section",
      icon: React.createElement(SettingOutlined),
      label: "Administración",
      scope: "site",
      children: [
        { key: "admin-users", icon: React.createElement(TeamOutlined), label: "Usuarios", url: "/admin/users" },
        { key: "admin-roles", icon: React.createElement(SafetyCertificateOutlined), label: "Roles", url: "/admin/users/roles" },
        { key: "admin-settings", icon: React.createElement(SettingOutlined), label: "Configuración", url: "/admin/settings" }
      ]
    }
  ];

  const normalizedMenuItems = React.useMemo(() => {
    try {
      const normalized = normalizeMenuItems(migratumMenuConfig);
      
      const transformForAntd = (items) => {
        return items.map((item) => {
          if (!item || typeof item !== 'object') return null;
          
          const transformedItem = {
            key: item.key,
            label: item.label,
            icon: item.icon,
            onClick: item.url ? () => navigateContextual(item.url, item.scope || 'auto') : undefined,
          };
          
          if (item.children && Array.isArray(item.children)) {
            transformedItem.children = transformForAntd(item.children);
          }
          
          return transformedItem;
        }).filter(Boolean);
      };
      
      return transformForAntd(normalized);
    } catch (error) {
      console.error('Error al normalizar menú:', error);
      return [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: React.createElement(DashboardOutlined),
          onClick: () => navigate('/migratum/dashboard')
        }
      ];
    }
  }, [migratumMenuConfig, normalizeMenuItems, navigateContextual, navigate]);

  const userMenuItems = {
    items: [
      {
        key: 'profile',
        icon: React.createElement(UserOutlined),
        label: 'Mi Perfil',
        onClick: () => navigateContextual('/admin/account', 'site'),
      },
      {
        key: 'settings',
        icon: React.createElement(SettingOutlined),
        label: 'Configuración',
        onClick: () => navigateContextual('/admin/settings', 'site'),
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: React.createElement(LogoutOutlined),
        label: 'Cerrar Sesión',
        danger: true,
        onClick: () => navigate('/migratum/auth/login'),
      },
    ],
  };

  const selectedKeys = React.useMemo(() => {
    const path = location.pathname;
    
    if (path.includes('/kyc')) {
      if (path.includes('/pending')) return ['kyc-pending'];
      if (path.includes('/approved')) return ['kyc-approved'];
      if (path.includes('/rejected')) return ['kyc-rejected'];
      return ['kyc-dashboard'];
    }
    
    if (path.includes('/wallet')) {
      if (path.includes('/management')) return ['wallet-management'];
      if (path.includes('/transactions')) return ['wallet-transactions'];
      if (path.includes('/token-management')) return ['wallet-token'];
      return ['wallet-dashboard'];
    }
    
    if (path.includes('/credits')) {
      if (path.includes('/pending')) return ['credits-pending'];
      if (path.includes('/approved')) return ['credits-active'];
      if (path.includes('/evaluation')) return ['credits-evaluation'];
      return ['credits'];
    }
    
    if (path.includes('/housing')) {
      if (path.includes('/properties')) return ['housing-properties'];
      if (path.includes('/applications')) return ['housing-applications'];
      return ['housing'];
    }
    
    if (path.includes('/admin')) {
      if (path.includes('/users/roles')) return ['admin-roles'];
      if (path.includes('/users')) return ['admin-users'];
      if (path.includes('/settings')) return ['admin-settings'];
      return ['admin-section'];
    }
    
    return ['dashboard'];
  }, [location.pathname]);

  return React.createElement(Layout, { style: { minHeight: '100vh' } },
    React.createElement(Sider, { 
      collapsible: true,
      collapsed: collapsed,
      onCollapse: setCollapsed,
      style: {
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }
    },
      React.createElement('div', { 
        style: { 
          height: 64, 
          margin: 16, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold'
        }
      }, collapsed ? 'M' : 'MIGRATUM'),
      React.createElement(Menu, {
        theme: "dark",
        mode: "inline",
        selectedKeys: selectedKeys,
        items: normalizedMenuItems
      })
    ),
    
    React.createElement(Layout, { style: { marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' } },
      React.createElement(Header, {
        style: {
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
        }
      },
        React.createElement(Button, {
          type: "text",
          icon: React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined),
          onClick: () => setCollapsed(!collapsed),
          style: { fontSize: 16 }
        }),
        
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          React.createElement(Logo),
          React.createElement(Dropdown, { menu: userMenuItems, placement: "bottomRight", trigger: ['click'] },
            React.createElement(Button, { type: "text", icon: React.createElement(UserOutlined) }, "Admin")
          )
        )
      ),
      
      React.createElement(Content, { style: { margin: '24px 16px 0', overflow: 'initial' } },
        React.createElement('div', {
          style: {
            padding: 24,
            minHeight: 360,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }
        },
          React.createElement(Outlet)
        )
      ),
      
      React.createElement(Footer, { style: { textAlign: 'center' } },
        `Migratum Financial Services ©${new Date().getFullYear()}`
      )
    )
  );
};

export default AdminLayout;
