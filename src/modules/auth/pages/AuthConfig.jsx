// src/modules/auth/pages/AuthConfig.jsx
import React, { useState } from 'react';
import * as ApolloClient from "@apollo/client";
import { Card, Button, Row, Col, Typography, Space, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AuthConfigList from '../components/authConfig/AuthConfigList';
import AuthConfigModal from '../components/authConfig/AuthConfigModal';
import { GET_AUTH_CONFIGS } from '../apollo/authConfig';

const { useQuery } = ApolloClient;
const { Title } = Typography;

const AuthConfig = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAuthConfig, setSelectedAuthConfig] = useState(null);
  const [accountId, setAccountId] = useState('');

  const { loading, refetch } = useQuery(GET_AUTH_CONFIGS);

  const handleCreate = () => {
    setSelectedAuthConfig(null);
    setAccountId('default'); // Puedes establecer un ID de cuenta predeterminado o dejarlo vacío
    setModalVisible(true);
  };

  const handleEdit = (authConfig) => {
    setSelectedAuthConfig(authConfig);
    setAccountId('');
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedAuthConfig(null);
    setAccountId('');
    refetch();
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4}>Configuración de Autenticación</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                loading={loading}
              >
                Nueva Configuración
              </Button>
            </div>
            <Divider />
            <AuthConfigList onEdit={handleEdit} />
          </Card>
        </Col>
      </Row>

      <AuthConfigModal
        visible={modalVisible}
        authConfig={selectedAuthConfig}
        accountId={accountId}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default AuthConfig;
