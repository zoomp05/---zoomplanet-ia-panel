import React from 'react';
import { Typography, Alert } from 'antd';
const { Title } = Typography;

const AdGroupsList = () => (
  <div>
    <Title level={3}>Grupos de Anuncios</Title>
    <Alert message="Página en desarrollo" type="info" showIcon />
  </div>
);

export default AdGroupsList;
