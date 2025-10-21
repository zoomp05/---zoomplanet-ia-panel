import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { MessageOutlined } from '@ant-design/icons';

/**
 * ImmigrationConsultation - Placeholder
 * Módulo: immigration
 * TODO: Implementar funcionalidad completa
 */
const ImmigrationConsultation = () => {
  return (
    <PlaceholderPage
      moduleName="Immigration"
      pageName="Consultas"
      icon={<MessageOutlined style={{ fontSize: 64, color: '#722ed1' }} />}
    />
  );
};

export default ImmigrationConsultation;
