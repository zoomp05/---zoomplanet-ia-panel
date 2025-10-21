import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { DollarOutlined } from '@ant-design/icons';

/**
 * ReportsFinancial - Placeholder
 * Módulo: reports
 * TODO: Implementar funcionalidad completa
 */
const ReportsFinancial = () => {
  return (
    <PlaceholderPage
      moduleName="Reports"
      pageName="Reportes Financieros"
      icon={<DollarOutlined style={{ fontSize: 64, color: '#52c41a' }} />}
    />
  );
};

export default ReportsFinancial;
