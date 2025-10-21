import React from 'react';
import { useLocation } from 'react-router';
import { PlaceholderPage } from '@zoom/components';
import ContextualActions from '@zoom/components/ContextualActions';
import { getContextualActions, handleContextualAction } from '../config/contextualActions';
import { 
  DashboardOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
  CreditCardOutlined,
  HomeOutlined,
  SolutionOutlined,
  BankOutlined,
  FileTextOutlined
} from '@ant-design/icons';

/**
 * Página genérica para módulos en desarrollo
 * Muestra PlaceholderPage con acciones contextuales
 */
const GenericModulePage = ({ 
  moduleName = 'Módulo', 
  pageName = 'Página',
  icon,
  description 
}) => {
  const location = useLocation();
  
  // Obtener acciones contextuales para esta ruta
  const actions = getContextualActions(location.pathname);
  
  const handleAction = (action) => {
    handleContextualAction(action, { 
      pathname: location.pathname,
      moduleName
    });
  };

  // Seleccionar icono basado en el nombre del módulo si no se proporciona
  const getDefaultIcon = () => {
    if (icon) return icon;
    
    const path = location.pathname.toLowerCase();
    
    if (path.includes('kyc')) {
      return <SafetyCertificateOutlined style={{ fontSize: 64, color: '#1890ff' }} />;
    }
    if (path.includes('wallet')) {
      return <WalletOutlined style={{ fontSize: 64, color: '#52c41a' }} />;
    }
    if (path.includes('credit')) {
      return <CreditCardOutlined style={{ fontSize: 64, color: '#722ed1' }} />;
    }
    if (path.includes('housing')) {
      return <HomeOutlined style={{ fontSize: 64, color: '#eb2f96' }} />;
    }
    if (path.includes('immigration')) {
      return <SolutionOutlined style={{ fontSize: 64, color: '#fa8c16' }} />;
    }
    if (path.includes('banking')) {
      return <BankOutlined style={{ fontSize: 64, color: '#13c2c2' }} />;
    }
    if (path.includes('report')) {
      return <FileTextOutlined style={{ fontSize: 64, color: '#faad14' }} />;
    }
    
    return <DashboardOutlined style={{ fontSize: 64, color: '#1890ff' }} />;
  };

  return (
    <div>
      {/* Barra de acciones contextuales */}
      <ContextualActions
        actions={actions}
        title={`${moduleName} - ${pageName}`}
        onAction={handleAction}
        showBreadcrumb={true}
      />
      
      {/* Contenido placeholder */}
      <PlaceholderPage
        moduleName={moduleName}
        pageName={pageName}
        icon={getDefaultIcon()}
        description={description}
      />
    </div>
  );
};

export default GenericModulePage;
