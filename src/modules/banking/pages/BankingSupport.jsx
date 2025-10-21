import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { CustomerServiceOutlined } from '@ant-design/icons';

/**
 * BankingSupport - Placeholder
 * Módulo: banking
 * TODO: Implementar funcionalidad completa
 */
const BankingSupport = () => {
  return (
    <PlaceholderPage
      moduleName="Banking"
      pageName="Soporte Bancario"
      icon={<CustomerServiceOutlined style={{ fontSize: 64, color: '#722ed1' }} />}
    />
  );
};

export default BankingSupport;
