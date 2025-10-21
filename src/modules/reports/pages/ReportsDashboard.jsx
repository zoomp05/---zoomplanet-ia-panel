import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { BarChartOutlined } from '@ant-design/icons';

/**
 * ReportsDashboard - Placeholder
 * Módulo: reports
 * TODO: Implementar funcionalidad completa
 */
const ReportsDashboard = () => {
  return (
    <PlaceholderPage
      moduleName="Reports"
      pageName="Dashboard Reportes"
      icon={<BarChartOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
    />
  );
};

export default ReportsDashboard;
