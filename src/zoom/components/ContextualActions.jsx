import React from 'react';
import { Button, Space, Breadcrumb, Typography } from 'antd';
import { useLocation } from 'react-router';
import { useModuleNavigation } from '@hooks/useModuleNavigation';
import { HomeOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Componente genérico para barra de acciones contextuales
 * Componente CORE - debe ser abstracto y recibir toda la configuración desde fuera
 * No debe contener lógica específica de ningún sitio o módulo
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.actions - Acciones a mostrar (REQUERIDO desde el componente que lo usa)
 * @param {boolean} props.showBreadcrumb - Mostrar breadcrumb automático
 * @param {Array} props.customBreadcrumb - Breadcrumb personalizado (sobrescribe el automático)
 * @param {string} props.title - Título de la página actual
 * @param {Function} props.onAction - Callback cuando se ejecuta una acción
 * @param {Object} props.style - Estilos personalizados del contenedor
 */
const ContextualActions = ({ 
  actions = [], 
  showBreadcrumb = true,
  customBreadcrumb,
  title,
  onAction,
  style = {}
}) => {
  const location = useLocation();
  const { routeContext, buildContextualUrl } = useModuleNavigation();

  // Generar breadcrumb automático basado en la ruta usando el contexto del módulo
  const generateBreadcrumb = () => {
    if (customBreadcrumb) return customBreadcrumb;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [];

    // Agregar Home usando el contexto del sitio
    breadcrumbItems.push({
      title: <HomeOutlined />,
      href: buildContextualUrl('/dashboard', 'site')
    });

    // Procesar segmentos de la ruta usando el contexto
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Saltar el primer segmento (sitio) ya que está en Home
      if (index === 0) return;
      
      // Convertir el segmento a un título legible
      const segmentTitle = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbItems.push({
        title: segmentTitle,
        href: index === pathSegments.length - 1 ? undefined : currentPath
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = showBreadcrumb ? generateBreadcrumb() : [];

  const handleActionClick = (action) => {
    if (onAction) {
      onAction(action);
    } else {
      console.log('Acción ejecutada:', action);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      width: '100%',
      padding: '0 0 16px 0',
      borderBottom: '1px solid #f0f0f0',
      marginBottom: 16,
      ...style
    }}>
      {/* Breadcrumb y título */}
      <div>
        {showBreadcrumb && breadcrumbItems.length > 0 && (
          <Breadcrumb 
            items={breadcrumbItems}
            style={{ marginBottom: 4 }}
          />
        )}
        {title && (
          <Text strong style={{ fontSize: 18 }}>
            {title}
          </Text>
        )}
      </div>

      {/* Acciones contextuales - SIEMPRE desde props */}
      <Space>
        {actions.map((action) => (
          <Button
            key={action.key}
            type={action.type || 'default'}
            icon={action.icon}
            onClick={() => handleActionClick(action)}
            size={action.size || 'default'}
            danger={action.danger}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
      </Space>
    </div>
  );
};

export default ContextualActions;