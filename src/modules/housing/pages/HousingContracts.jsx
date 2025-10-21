import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { FileDoneOutlined } from '@ant-design/icons';

/**
 * HousingContracts - Placeholder
 * Módulo: housing
 * TODO: Implementar funcionalidad completa
 */
const HousingContracts = () => {
  return (
    <PlaceholderPage
      moduleName="Housing"
      pageName="Contratos"
      icon={<FileDoneOutlined style={{ fontSize: 64, color: '#52c41a' }} />}
    />
  );
};

export default HousingContracts;
