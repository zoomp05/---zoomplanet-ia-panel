import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { FormOutlined } from '@ant-design/icons';

/**
 * BankingApplications - Placeholder
 * Módulo: banking
 * TODO: Implementar funcionalidad completa
 */
const BankingApplications = () => {
  return (
    <PlaceholderPage
      moduleName="Banking"
      pageName="Aplicaciones"
      icon={<FormOutlined style={{ fontSize: 64, color: '#faad14' }} />}
    />
  );
};

export default BankingApplications;
