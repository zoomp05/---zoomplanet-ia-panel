import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { FileTextOutlined } from '@ant-design/icons';

/**
 * HousingApplications - Placeholder
 * Módulo: housing
 * TODO: Implementar funcionalidad completa
 */
const HousingApplications = () => {
  return (
    <PlaceholderPage
      moduleName="Housing"
      pageName="Aplicaciones"
      icon={<FileTextOutlined style={{ fontSize: 64, color: '#faad14' }} />}
    />
  );
};

export default HousingApplications;
