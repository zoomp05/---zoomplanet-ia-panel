import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { FileSearchOutlined } from '@ant-design/icons';

/**
 * CreditsEvaluation - Placeholder
 * Módulo: credits
 * TODO: Implementar funcionalidad completa
 */
const CreditsEvaluation = () => {
  return (
    <PlaceholderPage
      moduleName="Credits"
      pageName="Evaluación Crediticia"
      icon={<FileSearchOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
    />
  );
};

export default CreditsEvaluation;
