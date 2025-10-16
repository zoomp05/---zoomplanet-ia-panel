// src/modules/googleAds/components/AccountForm.jsx
import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Button,
  Alert,
  Divider,
  Typography,
  Collapse,
  message
} from 'antd';
import {
  GoogleOutlined,
  KeyOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { useFormChanges } from '../../../hooks/useFormChanges.jsx';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

/**
 * Formulario para crear/editar cuenta de Google Ads
 */
const AccountForm = ({ visible, account, onSave, onCancel, loading }) => {
  const [form] = Form.useForm();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  
  const isEditing = !!account;
  const STORAGE_KEY = 'googleAds_accountForm_draft';

  // Hook simplificado para detectar cambios
  const { formChanged, markAsChanged, confirmClose, resetChanges } = useFormChanges(isEditing);

  // Cargar valores desde localStorage al abrir el modal
  React.useEffect(() => {
    if (visible && account) {
      // Si está editando, cargar valores de la cuenta existente y resetear estado
      form.setFieldsValue({
        name: account.name,
        customerId: account.customerId,
        credentials: {
          clientId: account.credentials?.clientId || '',
          clientSecret: account.credentials?.clientSecret || '',
          developerToken: account.credentials?.developerToken || '',
          refreshToken: account.credentials?.refreshToken || ''
        },
        settings: account.settings || {}
      });
      resetChanges(); // Resetear al abrir
    } else if (visible && !account) {
      // Si está creando, intentar cargar desde localStorage
      try {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        if (savedDraft) {
          const draftValues = JSON.parse(savedDraft);
          console.log('📦 Recuperando borrador de cuenta desde localStorage:', draftValues);
          form.setFieldsValue(draftValues);
        } else {
          form.resetFields();
        }
      } catch (error) {
        console.error('Error al cargar borrador desde localStorage:', error);
        form.resetFields();
      }
    } else if (!visible) {
      // No limpiar aquí, solo cuando la mutación sea exitosa
    }
  }, [visible, account, form, resetChanges]);

  // Marcar como modificado cuando cambien los campos
  const handleFormChange = () => {
    if (isEditing) {
      // Si está editando, marcar como modificado
      markAsChanged();
    } else {
      // Si está creando, guardar en localStorage
      try {
        const currentValues = form.getFieldsValue();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentValues));
        console.log('💾 Guardando borrador en localStorage');
      } catch (error) {
        console.error('Error al guardar borrador en localStorage:', error);
      }
    }
  };

  // Limpiar localStorage después de guardar exitosamente
  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Borrador limpiado de localStorage');
    } catch (error) {
      console.error('Error al limpiar borrador de localStorage:', error);
    }
  };

  // Generar URL de autorización OAuth
  const generateAuthUrl = () => {
    const clientId = form.getFieldValue(['credentials', 'clientId']);
    const clientSecret = form.getFieldValue(['credentials', 'clientSecret']);
    
    if (!clientId) {
      message.warning('Por favor, ingresa el Client ID primero');
      return;
    }

    if (!clientSecret) {
      message.warning('Por favor, ingresa el Client Secret primero');
      return;
    }

    // Usar el endpoint de la API para generar URL
    fetch(`http://localhost:4000/api/googleAds/oauth/authorize?clientId=${encodeURIComponent(clientId)}&clientSecret=${encodeURIComponent(clientSecret)}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.authUrl) {
          setAuthUrl(data.authUrl);
          
          // Copiar al clipboard
          navigator.clipboard.writeText(data.authUrl).then(() => {
            message.success('✅ URL copiada al portapapeles y abierta en nueva ventana');
          }).catch(() => {
            message.info('URL generada. Ábrela manualmente desde el campo de abajo.');
          });
          
          // Abrir en nueva ventana
          window.open(data.authUrl, '_blank', 'width=600,height=700');
        } else {
          message.error('Error al generar URL de autorización');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        message.error('Error al generar URL de autorización');
      });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Llamar a onSave y esperar el resultado
      const result = await onSave(values);
      
      // Si la mutación fue exitosa, limpiar localStorage y resetear cambios
      // Asumimos que onSave retorna algo truthy en caso de éxito
      if (result !== false) {
        clearDraft();
        resetChanges(); // Resetear estado de cambios
        form.resetFields();
      }
    } catch (error) {
      console.error('Error en validación:', error);
    }
  };

  const handleCancel = async () => {
    // Si está editando y hay cambios, confirmar antes de cerrar
    if (isEditing) {
      const canClose = await confirmClose(() => {
        console.log('⏸️ Modal cerrado después de confirmar');
        onCancel();
      });
      
      // Si el usuario cancela la confirmación, no hacer nada
      if (!canClose) {
        console.log('❌ Usuario canceló el cierre del modal');
        return;
      }
    } else {
      // Si está creando, NO limpiar localStorage (preservar borrador)
      console.log('⏸️ Modal cerrado, borrador preservado en localStorage');
      onCancel();
    }
  };

  return (
    <Modal
      title={
        <Space>
          <GoogleOutlined />
          <span>{isEditing ? 'Editar Cuenta' : 'Nueva Cuenta de Google Ads'}</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      maskClosable={false} // Evitar cierre al hacer click fuera si hay cambios
      keyboard={false} // Evitar cierre con ESC si hay cambios (manejado por confirmClose)
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {isEditing ? 'Actualizar' : 'Crear Cuenta'}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        initialValues={{
          settings: {
            currency: 'USD',
            timezone: 'America/Mexico_City',
            autoTaggingEnabled: true
          }
        }}
      >
        {/* Información Básica */}
        <Title level={5}>
          <InfoCircleOutlined /> Información Básica
        </Title>
        
        <Form.Item
          name="name"
          label="Nombre de la Cuenta"
          rules={[
            { required: true, message: 'El nombre es requerido' },
            { min: 3, message: 'Mínimo 3 caracteres' }
          ]}
        >
          <Input
            placeholder="Ej: Cuenta Principal Google Ads"
            prefix={<GoogleOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="customerId"
          label="Customer ID"
          rules={[
            { required: true, message: 'El Customer ID es requerido' },
            { 
              pattern: /^\d{3}-\d{3}-\d{4}$/, 
              message: 'Formato: XXX-XXX-XXXX' 
            }
          ]}
          tooltip="Formato: XXX-XXX-XXXX (ej: 123-456-7890)"
        >
          <Input
            placeholder="123-456-7890"
          />
        </Form.Item>

        <Alert
          message="¿Dónde encontrar el Customer ID?"
          description="En tu cuenta de Google Ads, ve a Configuración > Información de la cuenta. El Customer ID aparece en la parte superior."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Divider />

        {/* Credenciales OAuth2 */}
        <Title level={5}>
          <KeyOutlined /> Credenciales OAuth2
        </Title>

        <Paragraph type="secondary">
          {isEditing 
            ? 'Actualiza las credenciales si es necesario. Deja en blanco para mantener las actuales.'
            : <>
                Estas credenciales se obtienen desde{' '}
                <a 
                  href="https://console.cloud.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Google Cloud Console
                </a>
              </>
          }
        </Paragraph>

        <Form.Item
          name={['credentials', 'clientId']}
          label="Client ID"
          rules={[{ required: !isEditing, message: 'El Client ID es requerido' }]}
        >
          <Input.Password 
            placeholder={isEditing ? "Dejar vacío para mantener actual" : "Tu Client ID de OAuth2"}
          />
        </Form.Item>

        <Form.Item
          name={['credentials', 'clientSecret']}
          label="Client Secret"
          rules={[{ required: !isEditing, message: 'El Client Secret es requerido' }]}
        >
          <Input.Password 
            placeholder={isEditing ? "Dejar vacío para mantener actual" : "Tu Client Secret"}
          />
        </Form.Item>

        <Form.Item
          name={['credentials', 'developerToken']}
          label="Developer Token"
          rules={[{ required: !isEditing, message: 'El Developer Token es requerido' }]}
        >
          <Input.Password 
            placeholder={isEditing ? "Dejar vacío para mantener actual" : "Tu Developer Token de Google Ads"}
          />
        </Form.Item>

        <Form.Item
          name={['credentials', 'refreshToken']}
          label="Refresh Token"
          rules={[{ required: !isEditing, message: 'El Refresh Token es requerido' }]}
        >
          <TextArea 
            rows={3}
            placeholder={isEditing ? "Dejar vacío para mantener actual" : "Tu Refresh Token de OAuth2"}
          />
        </Form.Item>

        {/* Botón para generar URL de autorización OAuth */}
        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button 
              type="dashed" 
              icon={<LinkOutlined />}
              onClick={generateAuthUrl}
              block
            >
              Generar URL de Autorización OAuth2
            </Button>
            
            {authUrl && (
              <>
                <Alert
                  message="URL de Autorización Generada"
                  description="La URL se ha copiado al portapapeles y se ha abierto en una nueva ventana. Autoriza la aplicación y serás redirigido a una página con los tokens. Copia el Refresh Token de esa página."
                  type="success"
                  showIcon
                  closable
                />
                <TextArea
                  value={authUrl}
                  readOnly
                  rows={3}
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
              </>
            )}
          </Space>
        </Form.Item>

        {!isEditing && (
          <Collapse ghost>
            <Panel 
              header="¿Cómo obtener las credenciales?" 
              key="help"
            >
              <Paragraph>
                <strong>1. Client ID y Client Secret:</strong>
                <ul>
                  <li>Ve a <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                  <li>Crea un proyecto o selecciona uno existente</li>
                  <li>Habilita la API de Google Ads</li>
                  <li>Ve a Credenciales → Crear credenciales → ID de cliente OAuth 2.0</li>
                  <li>Configura las URIs de redirección autorizadas</li>
                </ul>
              </Paragraph>
              <Paragraph>
                <strong>2. Developer Token:</strong>
                <ul>
                  <li>En tu cuenta de Google Ads, ve a Herramientas y configuración</li>
                  <li>En Centro de API, solicita acceso</li>
                  <li>Una vez aprobado, copia el token</li>
                </ul>
              </Paragraph>
              <Paragraph>
                <strong>3. Refresh Token (Método Fácil):</strong>
                <ul>
                  <li><strong>Paso 1:</strong> Llena los campos "Client ID" y "Client Secret" arriba</li>
                  <li><strong>Paso 2:</strong> Click en el botón "Generar URL de Autorización OAuth2"</li>
                  <li><strong>Paso 3:</strong> Se abrirá una ventana de Google - Autoriza la aplicación</li>
                  <li><strong>Paso 4:</strong> Serás redirigido a una página con los tokens</li>
                  <li><strong>Paso 5:</strong> Copia el "Refresh Token" de esa página</li>
                  <li><strong>Paso 6:</strong> Pégalo en el campo "Refresh Token" de este formulario</li>
                </ul>
              </Paragraph>
              <Alert
                message="Configuración en Google Cloud Console"
                description={
                  <>
                    <strong>Opción A (Aplicación Web):</strong> Añadir en "URIs de redirección autorizadas":
                    <code style={{ display: 'block', marginTop: 8, padding: 8, background: '#f5f5f5' }}>
                      http://localhost:4000/api/googleAds/oauth/callback
                    </code>
                    <strong style={{ marginTop: 8, display: 'block' }}>Opción B (Aplicación de Escritorio):</strong> 
                    Crear un nuevo Client ID de tipo "Aplicación de escritorio" (funciona sin configurar URIs).
                  </>
                }
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Panel>
          </Collapse>
        )}

        <Divider />

        {/* Configuración */}
        <Title level={5}>
          <SettingOutlined /> Configuración
        </Title>

        <Form.Item
          name={['settings', 'currency']}
          label="Moneda"
          rules={[{ required: true, message: 'La moneda es requerida' }]}
        >
          <Select placeholder="Selecciona la moneda">
            <Option value="USD">USD - Dólar Estadounidense</Option>
            <Option value="MXN">MXN - Peso Mexicano</Option>
            <Option value="EUR">EUR - Euro</Option>
            <Option value="GBP">GBP - Libra Esterlina</Option>
            <Option value="CAD">CAD - Dólar Canadiense</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name={['settings', 'timezone']}
          label="Zona Horaria"
          rules={[{ required: true, message: 'La zona horaria es requerida' }]}
        >
          <Select placeholder="Selecciona la zona horaria">
            <Option value="America/Mexico_City">México (Ciudad de México)</Option>
            <Option value="America/New_York">USA (Eastern Time)</Option>
            <Option value="America/Los_Angeles">USA (Pacific Time)</Option>
            <Option value="America/Chicago">USA (Central Time)</Option>
            <Option value="Europe/Madrid">España (Madrid)</Option>
            <Option value="UTC">UTC</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name={['settings', 'autoTaggingEnabled']}
          label="Auto-tagging"
          valuePropName="checked"
          tooltip="Habilita el etiquetado automático de URLs para seguimiento"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccountForm;
