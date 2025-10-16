import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  Typography,
  Card,
  Tabs,
  Space,
  Divider
} from 'antd';
import {
  GoogleOutlined,
  TeamOutlined,
  ApiOutlined,
  SettingOutlined
} from '@ant-design/icons';
import AccountsManagement from './AccountsManagement';
import ApiConfiguration from './ApiConfiguration';
import { useModuleNavigation } from '@zoom/hooks';

const { Title, Text } = Typography;

/**
 * Página Principal de Configuración de Google Ads
 * 
 * Hub central para todas las configuraciones del módulo:
 * - Gestión de Cuentas
 * - Configuración de API
 * - Configuraciones generales
 * 
 * IMPORTANTE: Este componente maneja 3 rutas diferentes:
 * - /googleAds/settings (Configuración General)
 * - /googleAds/settings/accounts (Gestión de Cuentas)
 * - /googleAds/settings/api (Configuración API)
 * 
 * Todas las rutas renderizan este mismo componente y se diferencia
 * solo por el tab activo basado en la URL.
 */
const GoogleAdsSettings = () => {
  const location = useLocation();
  const { navigateContextual, getContextualLink } = useModuleNavigation();

  const tabRoutes = {
    accounts: getContextualLink('settings/accounts', 'submodule'),
    api: getContextualLink('settings/api', 'submodule'),
    general: getContextualLink('settings', 'submodule')
  };

  const resolveActiveTab = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith(tabRoutes.api)) {
      return 'api';
    }
    if (currentPath.startsWith(tabRoutes.accounts)) {
      return 'accounts';
    }
    if (currentPath.startsWith(tabRoutes.general)) {
      return 'general';
    }
    return 'accounts';
  };

  const [activeTab, setActiveTab] = useState(resolveActiveTab());

  // Sincronizar tab activo con cambios en la URL
  useEffect(() => {
    const newTab = resolveActiveTab();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname, activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);

    const tabPaths = {
      accounts: 'settings/accounts',
      api: 'settings/api',
      general: 'settings'
    };

    const target = tabPaths[key] || tabPaths.accounts;
    navigateContextual(target, 'submodule');
  };

  const items = [
    {
      key: 'accounts',
      label: (
        <Space>
          <TeamOutlined />
          <span>Gestión de Cuentas</span>
        </Space>
      ),
      children: <AccountsManagement />
    },
    {
      key: 'api',
      label: (
        <Space>
          <ApiOutlined />
          <span>Configuración API</span>
        </Space>
      ),
      children: <ApiConfiguration />
    },
    {
      key: 'general',
      label: (
        <Space>
          <SettingOutlined />
          <span>Configuración General</span>
        </Space>
      ),
      children: (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <SettingOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>Configuración General</Title>
          <Text type="secondary">
            Próximamente: Configuraciones globales del módulo Google Ads
          </Text>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space align="center" size={12}>
          <GoogleOutlined style={{ fontSize: 32, color: '#4285f4' }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Configuración de Google Ads
            </Title>
            <Text type="secondary">
              Administra tus cuentas, configuraciones y preferencias del módulo
            </Text>
          </div>
        </Space>
      </div>

      <Divider style={{ margin: '24px 0' }} />

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={items}
          size="large"
        />
      </Card>
    </div>
  );
};

export default GoogleAdsSettings;
