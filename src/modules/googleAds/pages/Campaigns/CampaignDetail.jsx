/**
 * Detalle de Campaña Google Ads
 */

import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { useParams } from 'react-router';

const { Title } = Typography;

const CampaignDetail = () => {
  const { campaignId } = useParams();

  return (
    <div>
      <Title level={3}>Detalle de Campaña: {campaignId}</Title>
      <Alert
        message="En desarrollo"
        description="Esta página mostrará los detalles completos de la campaña de Google Ads"
        type="info"
        showIcon
      />
    </div>
  );
};

export default CampaignDetail;
