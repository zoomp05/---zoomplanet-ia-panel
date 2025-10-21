import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { TeamOutlined } from '@ant-design/icons';

/**
 * ReportsUsers - Placeholder
 * Módulo: reports
 * TODO: Implementar funcionalidad completa
 */
const ReportsUsers = () => {
  return (
    <PlaceholderPage
      moduleName="Reports"
      pageName="Reportes de Usuarios"
      icon={<TeamOutlined style={{ fontSize: 64, color: '#13c2c2' }} />}
    />
  );
};

export default ReportsUsers;
