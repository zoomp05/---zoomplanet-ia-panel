import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { GlobalOutlined } from '@ant-design/icons';

/**
 * ImmigrationDashboard - Placeholder
 * Módulo: immigration
 * TODO: Implementar funcionalidad completa
 */
const ImmigrationDashboard = () => {
  return (
    <PlaceholderPage
      moduleName="Immigration"
      pageName="Dashboard Migración"
      icon={<GlobalOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
    />
  );
};

export default ImmigrationDashboard;
