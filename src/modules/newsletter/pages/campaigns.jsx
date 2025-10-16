import React from 'react';
import { Typography, Space } from 'antd';
import CampaignList from '../components/campaign/campaignList';

const { Title } = Typography;

const CampaignsPage = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Campañas de Newsletter</Title>
      <CampaignList />
    </Space>
  );
};

export default CampaignsPage;
