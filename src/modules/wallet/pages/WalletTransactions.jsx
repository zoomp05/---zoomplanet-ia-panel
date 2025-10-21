import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { SwapOutlined } from '@ant-design/icons';

/**
 * WalletTransactions - Placeholder
 * Módulo: wallet
 * TODO: Implementar funcionalidad completa
 */
const WalletTransactions = () => {
  return (
    <PlaceholderPage
      moduleName="Wallet"
      pageName="Transacciones"
      icon={<SwapOutlined style={{ fontSize: 64, color: '#13c2c2' }} />}
    />
  );
};

export default WalletTransactions;
