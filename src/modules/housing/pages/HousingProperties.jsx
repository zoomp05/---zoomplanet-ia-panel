import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { BankOutlined } from '@ant-design/icons';

/**
 * HousingProperties - Placeholder
 * Módulo: housing
 * TODO: Implementar funcionalidad completa
 */
const HousingProperties = () => {
  return (
    <PlaceholderPage
      moduleName="Housing"
      pageName="Propiedades"
      icon={<BankOutlined style={{ fontSize: 64, color: '#13c2c2' }} />}
    />
  );
};

export default HousingProperties;
