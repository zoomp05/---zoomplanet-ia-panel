import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { FileProtectOutlined } from '@ant-design/icons';

/**
 * ImmigrationDocuments - Placeholder
 * Módulo: immigration
 * TODO: Implementar funcionalidad completa
 */
const ImmigrationDocuments = () => {
  return (
    <PlaceholderPage
      moduleName="Immigration"
      pageName="Documentos"
      icon={<FileProtectOutlined style={{ fontSize: 64, color: '#13c2c2' }} />}
    />
  );
};

export default ImmigrationDocuments;
