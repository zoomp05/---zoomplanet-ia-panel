import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { FormOutlined } from '@ant-design/icons';

/**
 * ImmigrationApplications - Placeholder
 * Módulo: immigration
 * TODO: Implementar funcionalidad completa
 */
const ImmigrationApplications = () => {
  return (
    <PlaceholderPage
      moduleName="Immigration"
      pageName="Aplicaciones"
      icon={<FormOutlined style={{ fontSize: 64, color: '#faad14' }} />}
    />
  );
};

export default ImmigrationApplications;
