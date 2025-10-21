import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { CheckCircleOutlined } from '@ant-design/icons';

/**
 * CreditsApproved - Placeholder
 * Módulo: credits
 * TODO: Implementar funcionalidad completa
 */
const CreditsApproved = () => {
  return (
    <PlaceholderPage
      moduleName="Credits"
      pageName="Créditos Activos"
      icon={<CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />}
    />
  );
};

export default CreditsApproved;
