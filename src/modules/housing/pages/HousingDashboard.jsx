import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { HomeOutlined } from '@ant-design/icons';

/**
 * HousingDashboard - Placeholder
 * Módulo: housing
 * TODO: Implementar funcionalidad completa
 */
const HousingDashboard = () => {
  return (
    <PlaceholderPage
      moduleName="Housing"
      pageName="Dashboard Vivienda"
      icon={<HomeOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
    />
  );
};

export default HousingDashboard;
