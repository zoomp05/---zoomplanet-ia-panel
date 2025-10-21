import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { LineChartOutlined } from '@ant-design/icons';

/**
 * ReportsActivity - Placeholder
 * Módulo: reports
 * TODO: Implementar funcionalidad completa
 */
const ReportsActivity = () => {
  return (
    <PlaceholderPage
      moduleName="Reports"
      pageName="Actividad del Sistema"
      icon={<LineChartOutlined style={{ fontSize: 64, color: '#722ed1' }} />}
    />
  );
};

export default ReportsActivity;
