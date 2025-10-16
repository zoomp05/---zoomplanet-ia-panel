import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  Modal,
  Result,
  Button,
  Space,
  Descriptions,
  Alert,
  Spin,
  Typography,
  Divider
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  GoogleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { TEST_GADS_CONNECTION } from '../graphql/queries';

const { Text, Title } = Typography;

/**
 * Modal para probar conexión de cuenta de Google Ads
 */
const ConnectionTestModal = ({ visible, accountId, accountName, onClose }) => {
  const [testResult, setTestResult] = useState(null);

  const [testConnection, { loading }] = useLazyQuery(TEST_GADS_CONNECTION, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setTestResult(data.testGAdsConnection);
    },
    onError: (error) => {
      setTestResult({
        success: false,
        message: error.message,
        errors: [error.message]
      });
    }
  });

  const handleTest = () => {
    setTestResult(null);
    testConnection({ variables: { accountId } });
  };

  const handleClose = () => {
    setTestResult(null);
    onClose();
  };

  // Auto-ejecutar test cuando se abre el modal
  React.useEffect(() => {
    if (visible && accountId) {
      handleTest();
    }
  }, [visible, accountId]);

  return (
    <Modal
      title={
        <Space>
          <GoogleOutlined style={{ color: '#4285f4' }} />
          <span>Probar Conexión - {accountName}</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="retry" icon={<ReloadOutlined />} onClick={handleTest} disabled={loading}>
          Reintentar
        </Button>,
        <Button key="close" type="primary" onClick={handleClose}>
          Cerrar
        </Button>
      ]}
      width={600}
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin
            size="large"
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          />
          <div style={{ marginTop: 16 }}>
            <Text>Probando conexión con Google Ads...</Text>
          </div>
        </div>
      )}

      {!loading && testResult && (
        <>
          <Result
            status={testResult.success ? 'success' : 'error'}
            icon={
              testResult.success ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              )
            }
            title={
              testResult.success
                ? 'Conexión exitosa'
                : 'Error de conexión'
            }
            subTitle={testResult.message}
          />

          {testResult.success && testResult.accountInfo && (
            <>
              <Divider />
              <Title level={5}>Información de la Cuenta</Title>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="ID de Cliente">
                  {testResult.accountInfo.customerId || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Nombre Descriptivo">
                  {testResult.accountInfo.descriptiveName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Moneda">
                  {testResult.accountInfo.currency || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Zona Horaria">
                  {testResult.accountInfo.timezone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Tipo de Cuenta">
                  {testResult.accountInfo.accountType === 'MCC'
                    ? 'Cuenta Manager (MCC)'
                    : 'Cuenta Cliente'}
                </Descriptions.Item>
                <Descriptions.Item label="Cuenta de Prueba">
                  {testResult.accountInfo.testAccount ? 'Sí' : 'No'}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {!testResult.success && testResult.errors && testResult.errors.length > 0 && (
            <>
              <Divider />
              <Alert
                message="Detalles del Error"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {testResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                }
                type="error"
                showIcon
              />
            </>
          )}

          {!testResult.success && (
            <>
              <Divider />
              <Alert
                message="Posibles Soluciones"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Verifica que las credenciales OAuth2 sean correctas</li>
                    <li>Asegúrate de que el refresh token no haya expirado</li>
                    <li>Confirma que el Customer ID tenga el formato correcto (XXX-XXX-XXXX)</li>
                    <li>Verifica que la cuenta tenga permisos de acceso a la API</li>
                    <li>Intenta refrescar el token desde el menú de acciones</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default ConnectionTestModal;
