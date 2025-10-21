import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { BankOutlined } from '@ant-design/icons';

/**
 * BankingDashboard - Placeholder
 * Módulo: banking
 * TODO: Implementar funcionalidad completa
 */
const BankingDashboard = () => {
  return (
    <PlaceholderPage
      moduleName="Banking"
      pageName="Dashboard Bancario"
      icon={<BankOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
    />
  );
};

export default BankingDashboard;
