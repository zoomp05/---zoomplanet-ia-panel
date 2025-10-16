import React from 'react';
import { Button, Dropdown, Avatar, Space, Typography } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSite } from '../../../zoom/context/SiteContext.jsx';
import { useNavigate } from 'react-router';
import { useModuleNavigation } from '@hooks/useModuleNavigation';
import useAuthRedirect from '../../auth/hooks/useAuthRedirect';

const { Text } = Typography;

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { siteName } = useSite();
  const navigate = useNavigate();
  const { navigateContextual } = useModuleNavigation();
  const { getLoginRoute } = useAuthRedirect();

  const handleLogout = async () => {
    try {
      await logout();
      const loginRoute = getLoginRoute();
      navigate(loginRoute, { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigateContextual('profile', 'module')
    },
    {
      key: 'my-account',
      icon: <AppstoreOutlined />,
      label: 'Mi Cuenta',
      onClick: () => navigateContextual('account/me', 'module')
    },
    
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
      danger: true
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button type="text" style={{ padding: '4px 8px', height: 'auto' }}>
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            src={user.avatar} 
            size="small"
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>
              {user.name || user.email}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {siteName}
            </Text>
          </div>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default UserMenu;
