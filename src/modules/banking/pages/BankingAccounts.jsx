import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { CreditCardOutlined } from '@ant-design/icons';

/**
 * BankingAccounts - Placeholder
 * Módulo: banking
 * TODO: Implementar funcionalidad completa
 */
const BankingAccounts = () => {
  return (
    <PlaceholderPage
      moduleName="Banking"
      pageName="Cuentas Bancarias"
      icon={<CreditCardOutlined style={{ fontSize: 64, color: '#13c2c2' }} />}
    />
  );
};

export default BankingAccounts;
