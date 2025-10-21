import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { CreditCardOutlined } from '@ant-design/icons';

const CreditsPending = () => {
  return (
    <PlaceholderPage
      moduleName="Créditos"
      pageName="Solicitudes Pendientes"
      icon={<CreditCardOutlined style={{ fontSize: 64, color: '#faad14' }} />}
    />
  );
};

export default CreditsPending;