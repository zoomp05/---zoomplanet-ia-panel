import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { HistoryOutlined } from '@ant-design/icons';

/**
 * CreditsHistory - Placeholder
 * Módulo: credits
 * TODO: Implementar funcionalidad completa
 */
const CreditsHistory = () => {
  return (
    <PlaceholderPage
      moduleName="Credits"
      pageName="Historial Crediticio"
      icon={<HistoryOutlined style={{ fontSize: 64, color: '#722ed1' }} />}
    />
  );
};

export default CreditsHistory;
