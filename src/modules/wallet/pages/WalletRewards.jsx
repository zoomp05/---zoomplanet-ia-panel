import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { TrophyOutlined } from '@ant-design/icons';

/**
 * WalletRewards - Placeholder
 * Módulo: wallet
 * TODO: Implementar funcionalidad completa
 */
const WalletRewards = () => {
  return (
    <PlaceholderPage
      moduleName="Wallet"
      pageName="Recompensas"
      icon={<TrophyOutlined style={{ fontSize: 64, color: '#faad14' }} />}
    />
  );
};

export default WalletRewards;
