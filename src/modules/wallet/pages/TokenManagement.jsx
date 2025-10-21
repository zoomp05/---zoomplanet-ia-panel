import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { DollarCircleOutlined } from '@ant-design/icons';

/**
 * TokenManagement - Placeholder
 * Módulo: wallet
 * TODO: Implementar funcionalidad completa
 */
const TokenManagement = () => {
  return (
    <PlaceholderPage
      moduleName="Wallet"
      pageName="Gestión de Token"
      icon={<DollarCircleOutlined style={{ fontSize: 64, color: '#faad14' }} />}
    />
  );
};

export default TokenManagement;
