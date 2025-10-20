import React from 'react';
import { Menu, Dropdown, Button, Avatar } from 'antd';
import { useNavigate } from 'react-router';
import { 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  DownOutlined 
} from '@ant-design/icons';
import { useModuleNavigation } from '@hooks/useModuleNavigation';

/**
 * Componente de menú superior reutilizable
 * Incluye menú de usuario, notificaciones y acciones globales
 * 
 * @param {Object} props - Propiedades del componente  
 * @param {Object} props.userMenuConfig - Configuración del menú de usuario
 * @param {Object} props.user - Datos del usuario actual
 * @param {string} props.siteName - Nombre del sitio para mostrar
 * @param {Function} props.onLogout - Callback para cerrar sesión
 * @param {React.Component} props.logo - Componente de logo personalizado
 * @param {Array} props.actions - Acciones adicionales para mostrar en el header
 */
const TopMenu = ({ 
  userMenuConfig,
  user = { name: 'Admin', avatar: null },
  siteName = 'Site',
  onLogout,
  logo: LogoComponent,
  actions = []
}) => {
  const navigate = useNavigate();
  const { navigateContextual } = useModuleNavigation();

  // Configuración por defecto del menú de usuario
  const defaultUserMenuConfig = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Mi Perfil',
        onClick: () => navigateContextual('/admin/account', 'site'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Configuración',
        onClick: () => navigateContextual('/admin/settings', 'site'),
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
          if (onLogout) {
            onLogout();
          } else {
            // Logout por defecto - navegar a login
            navigate(`/${siteName.toLowerCase()}/auth/login`);
          }
        },
      },
    ],
  };

  const finalUserMenuConfig = userMenuConfig || defaultUserMenuConfig;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      width: '100%',
      height: '100%'
    }}>
      {/* Logo y nombre del sitio */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12 
      }}>
        {LogoComponent && <LogoComponent size="small" />}
        <span style={{ 
          fontSize: 16, 
          fontWeight: 600,
          color: 'rgba(0, 0, 0, 0.85)' 
        }}>
          {siteName}
        </span>
      </div>

      {/* Acciones personalizadas */}
      {actions.length > 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8 
        }}>
          {actions.map((action, index) => (
            <div key={index}>
              {action}
            </div>
          ))}
        </div>
      )}

      {/* Menú de usuario */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12 
      }}>
        <Dropdown 
          menu={finalUserMenuConfig} 
          placement="bottomRight" 
          trigger={['click']}
        >
          <Button 
            type="text" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              height: 'auto',
              padding: '4px 8px'
            }}
          >
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              src={user.avatar}
            />
            <span>{user.name}</span>
            <DownOutlined style={{ fontSize: 12 }} />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default TopMenu;