// src/modules/auth/components/authConfig/AuthConfigModal.jsx
import React, { useEffect, useState } from 'react';
import * as ApolloClient from "@apollo/client";
import { Modal, Form, Input, Switch, Select, Tabs, InputNumber, Button, Space, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { CREATE_AUTH_CONFIG, UPDATE_AUTH_CONFIG, GET_AUTH_CONFIG } from '../../apollo/authConfig';
import { toast } from 'react-hot-toast';

const { useQuery, useMutation } = ApolloClient;
const { Option } = Select;
const { TabPane } = Tabs;

const AuthConfigModal = ({ visible, authConfig, accountId, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!authConfig;
  const [activeTab, setActiveTab] = useState('1');

  // Si estamos editando, cargamos los datos completos de la configuración
  const { loading: configLoading, data: configData } = useQuery(GET_AUTH_CONFIG, {
    variables: { accountId: isEditing ? authConfig.account : accountId },
    skip: !visible || (!isEditing && !accountId),
  });

  const [createAuthConfig, { loading: createLoading }] = useMutation(CREATE_AUTH_CONFIG);
  const [updateAuthConfig, { loading: updateLoading }] = useMutation(UPDATE_AUTH_CONFIG);

  useEffect(() => {
    if (visible) {
      if (isEditing && configData?.authConfig.__typename === 'AuthConfig') {
        const config = configData.authConfig;
        form.setFieldsValue({
          account: config.account,
          google: {
            client_id: config.google.client_id,
            client_secret: config.google.client_secret ? '••••••••' : '',
            redirect_uri: config.google.redirect_uri,
            scopes: config.google.scopes,
            enabled: config.google.enabled,
          },
          facebook: {
            app_id: config.facebook.app_id,
            app_secret: config.facebook.app_secret ? '••••••••' : '',
            redirect_uri: config.facebook.redirect_uri,
            scopes: config.facebook.scopes,
            enabled: config.facebook.enabled,
          },
          jwt: {
            secret: config.jwt.secret ? '••••••••' : '',
            expiration: config.jwt.expiration,
            refresh_token_expiration: config.jwt.refresh_token_expiration,
          },
          password_policy: {
            min_length: config.password_policy.min_length,
            require_uppercase: config.password_policy.require_uppercase,
            require_lowercase: config.password_policy.require_lowercase,
            require_numbers: config.password_policy.require_numbers,
            require_symbols: config.password_policy.require_symbols,
            password_history_limit: config.password_policy.password_history_limit,
            max_login_attempts: config.password_policy.max_login_attempts,
            lockout_duration: config.password_policy.lockout_duration,
          },
          two_factor_auth: {
            enabled: config.two_factor_auth.enabled,
            method: config.two_factor_auth.method,
            issuer: config.two_factor_auth.issuer,
          },
          session: {
            timeout: config.session.timeout,
            extend_on_activity: config.session.extend_on_activity,
            single_session: config.session.single_session,
          },
          cors: {
            allowed_origins: config.cors.allowed_origins,
            allow_credentials: config.cors.allow_credentials,
          },
        });
      } else if (!isEditing && accountId) {
        form.setFieldsValue({
          account: accountId,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, configData, isEditing, form, accountId, authConfig]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Limpiamos los valores secretos si no han sido modificados (siguen teniendo asteriscos)
      if (values.google?.client_secret === '••••••••') {
        delete values.google.client_secret;
      }
      
      if (values.facebook?.app_secret === '••••••••') {
        delete values.facebook.app_secret;
      }
      
      if (values.jwt?.secret === '••••••••') {
        delete values.jwt.secret;
      }

      if (isEditing) {
        const { data } = await updateAuthConfig({
          variables: {
            id: authConfig.id,
            input: values,
          },
        });
        
        if (data?.updateAuthConfig.__typename === 'AuthConfigValidationError') {
          throw new Error(data.updateAuthConfig.message);
        }
        
        if (data?.updateAuthConfig.__typename === 'AuthConfigNotFoundError') {
          throw new Error(data.updateAuthConfig.message);
        }
        
        toast.success('Configuración actualizada con éxito');
      } else {
        const { data } = await createAuthConfig({
          variables: {
            input: values,
          },
        });
        
        if (data?.createAuthConfig.__typename === 'AuthConfigValidationError') {
          throw new Error(data.createAuthConfig.message);
        }
        
        toast.success('Configuración creada con éxito');
      }
      
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Configuración de Autenticación' : 'Crear Configuración de Autenticación'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      width={800}
      confirmLoading={createLoading || updateLoading || configLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="account"
          label="ID de Cuenta"
          rules={[{ required: true, message: 'Por favor ingrese el ID de la cuenta' }]}
        >
          <Input disabled={isEditing} />
        </Form.Item>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Google" key="1">
            <Form.Item
              name={['google', 'enabled']}
              label="Habilitar Autenticación con Google"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['google', 'client_id']}
              label="Client ID"
              rules={[{ required: form.getFieldValue(['google', 'enabled']), message: 'Por favor ingrese el Client ID' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name={['google', 'client_secret']}
              label="Client Secret"
              rules={[{ required: form.getFieldValue(['google', 'enabled']), message: 'Por favor ingrese el Client Secret' }]}
            >
              <Input.Password />
            </Form.Item>
            
            <Form.Item
              name={['google', 'redirect_uri']}
              label="URI de Redirección"
              rules={[{ required: form.getFieldValue(['google', 'enabled']), message: 'Por favor ingrese la URI de redirección' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.List name={['google', 'scopes']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[{ required: true, message: 'Por favor ingrese el scope' }]}
                      >
                        <Input placeholder="Scope (ej: email, profile)" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Agregar Scope
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </TabPane>
          
          <TabPane tab="Facebook" key="2">
            <Form.Item
              name={['facebook', 'enabled']}
              label="Habilitar Autenticación con Facebook"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['facebook', 'app_id']}
              label="App ID"
              rules={[{ required: form.getFieldValue(['facebook', 'enabled']), message: 'Por favor ingrese el App ID' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name={['facebook', 'app_secret']}
              label="App Secret"
              rules={[{ required: form.getFieldValue(['facebook', 'enabled']), message: 'Por favor ingrese el App Secret' }]}
            >
              <Input.Password />
            </Form.Item>
            
            <Form.Item
              name={['facebook', 'redirect_uri']}
              label="URI de Redirección"
              rules={[{ required: form.getFieldValue(['facebook', 'enabled']), message: 'Por favor ingrese la URI de redirección' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.List name={['facebook', 'scopes']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[{ required: true, message: 'Por favor ingrese el scope' }]}
                      >
                        <Input placeholder="Scope (ej: email, public_profile)" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Agregar Scope
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </TabPane>
          
          <TabPane tab="JWT" key="3">
            <Form.Item
              name={['jwt', 'secret']}
              label="Secret"
              rules={[{ required: true, message: 'Por favor ingrese el secret para JWT' }]}
            >
              <Input.Password />
            </Form.Item>
            
            <Form.Item
              name={['jwt', 'expiration']}
              label="Expiración (segundos)"
              rules={[{ required: true, message: 'Por favor ingrese el tiempo de expiración' }]}
            >
              <InputNumber min={60} step={60} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name={['jwt', 'refresh_token_expiration']}
              label="Expiración del Refresh Token (segundos)"
              rules={[{ required: true, message: 'Por favor ingrese el tiempo de expiración del refresh token' }]}
            >
              <InputNumber min={60} step={60} style={{ width: '100%' }} />
            </Form.Item>
          </TabPane>
          
          <TabPane tab="Política de Contraseñas" key="4">
            <Form.Item
              name={['password_policy', 'min_length']}
              label="Longitud Mínima"
              rules={[{ required: true, message: 'Por favor ingrese la longitud mínima' }]}
            >
              <InputNumber min={6} max={32} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name={['password_policy', 'require_uppercase']}
              label="Requerir Mayúsculas"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['password_policy', 'require_lowercase']}
              label="Requerir Minúsculas"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['password_policy', 'require_numbers']}
              label="Requerir Números"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['password_policy', 'require_symbols']}
              label="Requerir Símbolos"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['password_policy', 'password_history_limit']}
              label="Límite de Historial de Contraseñas"
              rules={[{ required: true, message: 'Por favor ingrese el límite de historial' }]}
            >
              <InputNumber min={0} max={20} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name={['password_policy', 'max_login_attempts']}
              label="Máximo de Intentos de Login"
              rules={[{ required: true, message: 'Por favor ingrese el máximo de intentos' }]}
            >
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name={['password_policy', 'lockout_duration']}
              label="Duración de Bloqueo (minutos)"
              rules={[{ required: true, message: 'Por favor ingrese la duración del bloqueo' }]}
            >
              <InputNumber min={1} max={1440} style={{ width: '100%' }} />
            </Form.Item>
          </TabPane>
          
          <TabPane tab="2FA" key="5">
            <Form.Item
              name={['two_factor_auth', 'enabled']}
              label="Habilitar Autenticación de Dos Factores"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['two_factor_auth', 'method']}
              label="Método"
              rules={[{ required: form.getFieldValue(['two_factor_auth', 'enabled']), message: 'Por favor seleccione un método' }]}
            >
              <Select>
                <Option value="SMS">SMS</Option>
                <Option value="EMAIL">Email</Option>
                <Option value="APP">Aplicación</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name={['two_factor_auth', 'issuer']}
              label="Emisor (para aplicaciones)"
              rules={[{ required: form.getFieldValue(['two_factor_auth', 'enabled']) && form.getFieldValue(['two_factor_auth', 'method']) === 'APP', message: 'Por favor ingrese el emisor' }]}
            >
              <Input />
            </Form.Item>
          </TabPane>
          
          <TabPane tab="Sesión" key="6">
            <Form.Item
              name={['session', 'timeout']}
              label="Tiempo de Expiración (horas)"
              rules={[{ required: true, message: 'Por favor ingrese el tiempo de expiración' }]}
            >
              <InputNumber min={1} max={720} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name={['session', 'extend_on_activity']}
              label="Extender en Actividad"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['session', 'single_session']}
              label="Sesión Única (cerrar otras sesiones al iniciar)"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </TabPane>
          
          <TabPane tab="CORS" key="7">
            <Form.Item
              name={['cors', 'allow_credentials']}
              label="Permitir Credenciales"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.List name={['cors', 'allowed_origins']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[{ required: true, message: 'Por favor ingrese el origen permitido' }]}
                      >
                        <Input placeholder="Origen (ej: https://ejemplo.com)" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Agregar Origen
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default AuthConfigModal;
