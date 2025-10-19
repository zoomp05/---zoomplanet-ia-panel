import React, { useState } from 'react';
import { Modal, Form, Select, Button, message, Spin, Alert, Input, Space, Divider } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { LINK_SUB_ACCOUNT_TO_MCC, CREATE_SUB_ACCOUNT } from '../graphql/mutations';
import { GET_GADS_ACCOUNTS } from '../graphql/queries';

/**
 * Modal para vincular subcuentas a una cuenta MCC
 */
const LinkSubAccountsModal = ({ visible, onClose, managerAccount, onSuccess }) => {
  const [form] = Form.useForm();
  const [linkMode, setLinkMode] = useState('existing'); // 'existing', 'create' o 'batch'
  const [loading, setLoading] = useState(false);
  const [batchInput, setBatchInput] = useState(''); // Para crear múltiples subcuentas

  // Obtener todas las cuentas para poder vincular
  const { data: accountsData } = useQuery(GET_GADS_ACCOUNTS, {
    variables: { filters: {}, limit: 100, offset: 0 },
    skip: !visible
  });

  const accounts = accountsData?.gAdsAccounts?.edges?.map(e => e.node) || [];
  
  // Cuentas disponibles para vincular (excluyendo la actual y las ya vinculadas)
  const availableAccounts = accounts.filter(
    acc => 
      acc._id !== managerAccount?._id && 
      !acc.managerAccount && 
      !managerAccount?.subAccounts?.find(sub => sub._id === acc._id)
  );

  const [linkSubAccount] = useMutation(LINK_SUB_ACCOUNT_TO_MCC, {
    onCompleted: (data) => {
      if (data.linkSubAccountToMCC.success) {
        message.success(data.linkSubAccountToMCC.message);
        form.resetFields();
        onSuccess?.();
        onClose?.();
      } else {
        message.error(data.linkSubAccountToMCC.message || 'Error al vincular');
      }
    },
    onError: (error) => {
      message.error('Error: ' + error.message);
    }
  });

  const [createSubAccount] = useMutation(CREATE_SUB_ACCOUNT, {
    onCompleted: (data) => {
      if (data.createSubAccount.success) {
        message.success(data.createSubAccount.message);
        form.resetFields();
        onSuccess?.();
        onClose?.();
      } else {
        message.error(data.createSubAccount.message || 'Error al crear subcuenta');
      }
    },
    onError: (error) => {
      message.error('Error: ' + error.message);
    }
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (linkMode === 'existing') {
        await linkSubAccount({
          variables: {
            subAccountId: values.subAccountId,
            managerAccountId: managerAccount._id
          }
        });
      } else {
        await createSubAccount({
          variables: {
            input: {
              customerId: values.customerId,
              name: values.name,
              managerAccountId: managerAccount._id,
              currency: values.currency || 'USD',
              timezone: values.timezone
            }
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBatchCreate = async () => {
    setLoading(true);
    try {
      // Parsear input: cada línea debe ser "customer_id:nombre" o solo "customer_id"
      const lines = batchInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      let created = 0;
      let errors = 0;

      for (const line of lines) {
        try {
          const [customerId, name] = line.split(':').map(s => s.trim());
          
          if (!customerId) {
            errors++;
            continue;
          }

          await createSubAccount({
            variables: {
              input: {
                customerId,
                name: name || customerId,
                managerAccountId: managerAccount._id,
                currency: 'USD',
                timezone: managerAccount.settings?.timezone || 'America/Mexico_City'
              }
            }
          });
          
          created++;
        } catch (err) {
          console.error('Error en línea:', line, err);
          errors++;
        }
      }

      message.success(`${created} subcuentas creadas exitosamente${errors > 0 ? `, ${errors} con error` : ''}`);
      setBatchInput('');
      onClose();
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Vincular Subcuentas a ${managerAccount?.name}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Spin spinning={loading}>
        <div style={{ marginBottom: 16 }}>
          <Button.Group>
            <Button 
              type={linkMode === 'existing' ? 'primary' : 'default'}
              onClick={() => {
                setLinkMode('existing');
                form.resetFields();
              }}
            >
              Vincular Existente
            </Button>
            <Button 
              type={linkMode === 'create' ? 'primary' : 'default'}
              onClick={() => {
                setLinkMode('create');
                form.resetFields();
              }}
            >
              Crear Una
            </Button>
            <Button 
              type={linkMode === 'batch' ? 'primary' : 'default'}
              onClick={() => {
                setLinkMode('batch');
                form.resetFields();
              }}
            >
              Crear Múltiples
            </Button>
          </Button.Group>
        </div>

        {linkMode === 'existing' && availableAccounts.length === 0 && (
          <Alert 
            message="No hay cuentas disponibles para vincular" 
            description="Todas las cuentas ya están vinculadas a un MCC o son cuentas principales. Crea nuevas subcuentas."
            type="info" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
        )}

        {linkMode === 'existing' ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="subAccountId"
              label="Seleccionar Subcuenta"
              rules={[{ required: true, message: 'Por favor selecciona una subcuenta' }]}
            >
              <Select
                placeholder="Selecciona una subcuenta"
                options={availableAccounts.map(acc => ({
                  label: `${acc.name} (${acc.customerId})`,
                  value: acc._id
                }))}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Vincular
              </Button>
            </Form.Item>
          </Form>
        ) : linkMode === 'create' ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="customerId"
              label="Customer ID"
              rules={[{ required: true, message: 'Por favor ingresa el Customer ID' }]}
            >
              <Input 
                placeholder="ej: 608-199-7519"
                type="text"
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="Nombre de Subcuenta"
              rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
            >
              <Input 
                placeholder="ej: Mi Subcuenta"
                type="text"
              />
            </Form.Item>

            <Form.Item
              name="currency"
              label="Moneda"
            >
              <Select
                placeholder="USD"
                options={[
                  { label: 'USD', value: 'USD' },
                  { label: 'MXN', value: 'MXN' },
                  { label: 'EUR', value: 'EUR' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="timezone"
              label="Zona Horaria"
            >
              <Select
                placeholder="America/Mexico_City"
                options={[
                  { label: 'America/Mexico_City', value: 'America/Mexico_City' },
                  { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
                  { label: 'America/New_York', value: 'America/New_York' },
                ]}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Crear y Vincular
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div>
            <Alert 
              message="Crear múltiples subcuentas" 
              description="Ingresa cada subcuenta en una línea. Formato: customer_id:nombre (el nombre es opcional)"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form layout="vertical">
              <Form.Item label="Subcuentas (una por línea)">
                <Input.TextArea 
                  rows={8}
                  placeholder={`608-199-7519:Subcuenta 1\n158-984-5417:Subcuenta 2\n123-456-7890`}
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  disabled={loading}
                />
              </Form.Item>

              <Space style={{ marginTop: 16 }}>
                <Button 
                  type="primary" 
                  onClick={handleBatchCreate}
                  loading={loading}
                  disabled={!batchInput.trim()}
                >
                  Crear {batchInput.split('\n').filter(l => l.trim()).length} Subcuentas
                </Button>
                <Button onClick={() => setBatchInput('')}>
                  Limpiar
                </Button>
              </Space>
            </Form>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default LinkSubAccountsModal;
