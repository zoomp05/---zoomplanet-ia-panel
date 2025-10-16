/**
 * Editar Campaña Google Ads
 */

import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { useParams } from 'react-router';

const { Title } = Typography;

const EditCampaign = () => {
  const { campaignId } = useParams();

  return (
    <div>
      <Title level={3}>Editar Campaña: {campaignId}</Title>
      <Alert
        message="En desarrollo"
        description="Esta página permitirá editar la configuración de la campaña"
        type="info"
        showIcon
      />
    </div>
  );
};

export default EditCampaign;
