import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router';
import { useModuleNavigation } from '@hooks/useModuleNavigation';

/**
 * Componente de menú lateral reutilizable
 * Procesa la configuración de menú de cualquier sitio y la renderiza usando Ant Design
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.menuConfig - Configuración del menú del sitio
 * @param {string} props.theme - Tema del menú ('light' | 'dark')
 * @param {string} props.mode - Modo del menú ('inline' | 'horizontal' | 'vertical')
 * @param {Array} props.selectedKeys - Keys seleccionadas manualmente (opcional)
 * @param {Function} props.onMenuClick - Callback cuando se hace click en un item (opcional)
 */
const SidebarMenu = ({ 
  menuConfig = [], 
  theme = 'dark', 
  mode = 'inline',
  selectedKeys: propSelectedKeys,
  onMenuClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hook de navegación contextual de zoom
  const { navigateContextual, buildContextualUrl } = useModuleNavigation();

  // Procesamiento de items del menú
  const processedMenuItems = React.useMemo(() => {
    try {
      // Transformar al formato que espera Ant Design
      // NO normalizamos aquí porque navigateContextual ya lo hace
      const transformForAntd = (items) => {
        return items.map((item) => {
          if (!item || typeof item !== 'object') return null;
          
          const transformedItem = {
            key: item.key,
            label: item.label,
            icon: item.icon,
            type: item.type, // Soportar grupos
          };

          // Manejar click en el item
          if (item.url) {
            transformedItem.onClick = () => {
              if (onMenuClick) {
                onMenuClick(item);
              }
              // Usar navigateContextual directamente con la URL del config
              navigateContextual(item.url, item.scope || 'site');
            };
          }
          
          // Procesar children recursivamente
          if (item.children && Array.isArray(item.children)) {
            transformedItem.children = transformForAntd(item.children);
          }
          
          return transformedItem;
        }).filter(Boolean);
      };
      
      return transformForAntd(menuConfig);
    } catch (error) {
      console.error('Error al procesar configuración de menú:', error);
      return [];
    }
  }, [menuConfig, navigateContextual, onMenuClick]);

  // Auto-detectar keys seleccionadas basadas en la ruta actual
  const autoSelectedKeys = React.useMemo(() => {
    if (propSelectedKeys) return propSelectedKeys;
    
    const path = location.pathname;
    const selectedKeys = [];
    
    // Función recursiva para encontrar el item activo
    const findActiveKeys = (items, parentKeys = []) => {
      items.forEach(item => {
        // Construir la URL completa del item para comparar con la ruta actual
        if (item.url) {
          const fullUrl = buildContextualUrl(item.url, item.scope || 'site');
          if (path === fullUrl || path.startsWith(fullUrl + '/')) {
            selectedKeys.push(item.key);
            // También agregar las keys de los padres para expandir submenús
            selectedKeys.push(...parentKeys);
          }
        }
        
        if (item.children) {
          findActiveKeys(item.children, [...parentKeys, item.key]);
        }
      });
    };
    
    findActiveKeys(menuConfig);
    
    // Si no se encontró ninguna coincidencia específica, usar el primer item como fallback
    if (selectedKeys.length === 0 && menuConfig.length > 0) {
      selectedKeys.push(menuConfig[0].key);
    }
    
    return selectedKeys;
  }, [location.pathname, menuConfig, propSelectedKeys, buildContextualUrl]);

  // Keys para expandir submenús
  const defaultOpenKeys = React.useMemo(() => {
    const openKeys = [];
    const path = location.pathname;
    
    // Función recursiva para encontrar padres que deben estar expandidos
    const findOpenKeys = (items) => {
      items.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => {
            if (child.url) {
              const fullUrl = buildContextualUrl(child.url, child.scope || 'site');
              return path === fullUrl || path.startsWith(fullUrl + '/');
            }
            return false;
          });
          if (hasActiveChild) {
            openKeys.push(item.key);
          }
          findOpenKeys(item.children);
        }
      });
    };
    
    findOpenKeys(menuConfig);
    return openKeys;
  }, [location.pathname, menuConfig, buildContextualUrl]);

  return (
    <Menu
      theme={theme}
      mode={mode}
      selectedKeys={autoSelectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      items={processedMenuItems}
      style={{ 
        border: 'none',
        background: 'transparent' 
      }}
    />
  );
};

export default SidebarMenu;