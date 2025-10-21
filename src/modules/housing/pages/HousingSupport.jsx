import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { CustomerServiceOutlined } from '@ant-design/icons';

/**
 * HousingSupport - Placeholder
 * Módulo: housing
 * TODO: Implementar funcionalidad completa
 */
const HousingSupport = () => {
  return (
    <PlaceholderPage
      moduleName="Housing"
      pageName="Soporte"
      icon={<CustomerServiceOutlined style={{ fontSize: 64, color: '#722ed1' }} />}
    />
  );
};

export default HousingSupport;
