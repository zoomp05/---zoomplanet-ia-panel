import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { GET_NEWSLETTER_CONFIGS } from '../apollo/newsletterConfig';
import NewsletterConfigList from '../components/newsletterConfig/newsletterConfigList';
import NewsletterConfigModal from '../components/newsletterConfig/newsletterConfigModal';

const NewsletterConfigsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const { loading, data, refetch } = useQuery(GET_NEWSLETTER_CONFIGS);

  const handleCreate = () => {
    setSelectedConfig(null);
    setIsModalVisible(true);
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setIsModalVisible(true);
  };

  const handleModalClose = (shouldRefetch) => {
    setIsModalVisible(false);
    setSelectedConfig(null);
    if (shouldRefetch) {
      refetch();
    }
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create Config
          </Button>
        </div>

        <NewsletterConfigList
          loading={loading}
          configs={data?.newsletterConfigs || []}
          onEdit={handleEdit}
          onRefresh={refetch}
        />

        <NewsletterConfigModal
          visible={isModalVisible}
          config={selectedConfig}
          onClose={handleModalClose}
        />
      </Space>
    </div>
  );
};

export default NewsletterConfigsPage;