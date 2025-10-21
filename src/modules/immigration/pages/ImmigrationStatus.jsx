import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { CheckCircleOutlined } from '@ant-design/icons';

/**
 * ImmigrationStatus - Placeholder
 * Módulo: immigration
 * TODO: Implementar funcionalidad completa
 */
const ImmigrationStatus = () => {
  return (
    <PlaceholderPage
      moduleName="Immigration"
      pageName="Estado de Casos"
      icon={<CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />}
    />
  );
};

export default ImmigrationStatus;
