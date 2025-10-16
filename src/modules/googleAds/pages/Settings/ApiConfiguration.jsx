import React from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Descriptions,
  Alert,
  Space,
  Tag,
  Divider,
  Collapse
} from 'antd';
import {
  ApiOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Text, Paragraph, Link } = Typography;

/**
 * Página de Configuración de API de Google Ads
 * 
 * Muestra información sobre la configuración de la API,
 * requisitos, límites y guías de uso
 */
const ApiConfiguration = () => {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Información General */}
        <Alert
          message="Configuración de API de Google Ads"
          description="Esta sección contiene información sobre los requisitos y configuración necesaria para conectar con la API de Google Ads."
          type="info"
          showIcon
          icon={<ApiOutlined />}
        />

        {/* Requisitos Previos */}
        <Card title={<Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> Requisitos Previos</Space>}>
          <Paragraph>
            Para utilizar la API de Google Ads, necesitas:
          </Paragraph>
          <ul>
            <li>
              <Text strong>Cuenta de Google Ads activa</Text> - Una cuenta de Google Ads con facturación configurada
            </li>
            <li>
              <Text strong>Acceso a la API</Text> - Solicitar acceso a través de{' '}
              <Link href="https://ads.google.com/home/tools/manager-accounts/" target="_blank">
                Google Ads Manager Accounts
              </Link>
            </li>
            <li>
              <Text strong>Credenciales OAuth2</Text> - Client ID, Client Secret, y Developer Token
            </li>
            <li>
              <Text strong>Customer ID</Text> - ID de cliente en formato XXX-XXX-XXXX
            </li>
          </ul>
        </Card>

        {/* Información de OAuth2 */}
        <Card title={<Space><InfoCircleOutlined style={{ color: '#1890ff' }} /> Credenciales OAuth2</Space>}>
          <Collapse
            items={[
              {
                key: '1',
                label: '¿Cómo obtener Client ID y Client Secret?',
                children: (
                  <div>
                    <Paragraph>
                      1. Ve a la{' '}
                      <Link href="https://console.cloud.google.com/" target="_blank">
                        Google Cloud Console
                      </Link>
                    </Paragraph>
                    <Paragraph>
                      2. Crea un nuevo proyecto o selecciona uno existente
                    </Paragraph>
                    <Paragraph>
                      3. Habilita la <Text strong>Google Ads API</Text>
                    </Paragraph>
                    <Paragraph>
                      4. Ve a <Text strong>Credenciales</Text> → <Text strong>Crear credenciales</Text> → <Text strong>ID de cliente OAuth 2.0</Text>
                    </Paragraph>
                    <Paragraph>
                      5. Configura la pantalla de consentimiento OAuth
                    </Paragraph>
                    <Paragraph>
                      6. Crea las credenciales de tipo "Aplicación web"
                    </Paragraph>
                    <Paragraph>
                      7. Copia el <Text code>Client ID</Text> y <Text code>Client Secret</Text>
                    </Paragraph>
                  </div>
                )
              },
              {
                key: '2',
                label: '¿Cómo obtener Developer Token?',
                children: (
                  <div>
                    <Paragraph>
                      1. Inicia sesión en tu{' '}
                      <Link href="https://ads.google.com/" target="_blank">
                        cuenta de Google Ads
                      </Link>
                    </Paragraph>
                    <Paragraph>
                      2. Haz clic en el icono de herramientas y selecciona <Text strong>Configuración</Text> → <Text strong>Centro de API</Text>
                    </Paragraph>
                    <Paragraph>
                      3. Si es tu primera vez, solicita acceso a la API
                    </Paragraph>
                    <Paragraph>
                      4. Una vez aprobado, encontrarás tu <Text strong>Developer Token</Text>
                    </Paragraph>
                    <Paragraph>
                      <Alert
                        message="Nota importante"
                        description="El Developer Token puede tardar hasta 24 horas en ser aprobado por Google."
                        type="warning"
                        showIcon
                      />
                    </Paragraph>
                  </div>
                )
              },
              {
                key: '3',
                label: '¿Cómo obtener Refresh Token?',
                children: (
                  <div>
                    <Paragraph>
                      El Refresh Token se obtiene a través del flujo de autenticación OAuth2:
                    </Paragraph>
                    <Paragraph>
                      1. Usa la URL de autorización con tu Client ID
                    </Paragraph>
                    <Paragraph>
                      <Text code style={{ fontSize: 11 }}>
                        https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/adwords&response_type=code
                      </Text>
                    </Paragraph>
                    <Paragraph>
                      2. Autoriza el acceso y copia el código de autorización
                    </Paragraph>
                    <Paragraph>
                      3. Intercambia el código por un refresh token usando una petición POST
                    </Paragraph>
                    <Paragraph>
                      4. Guarda el <Text code>refresh_token</Text> de forma segura
                    </Paragraph>
                  </div>
                )
              },
              {
                key: '4',
                label: '¿Dónde encuentro mi Customer ID?',
                children: (
                  <div>
                    <Paragraph>
                      1. Inicia sesión en tu{' '}
                      <Link href="https://ads.google.com/" target="_blank">
                        cuenta de Google Ads
                      </Link>
                    </Paragraph>
                    <Paragraph>
                      2. En la esquina superior derecha, verás un número de 10 dígitos
                    </Paragraph>
                    <Paragraph>
                      3. Este es tu <Text strong>Customer ID</Text> (formato: XXX-XXX-XXXX)
                    </Paragraph>
                    <Paragraph>
                      <Alert
                        message="Ejemplo"
                        description="Si ves '1234567890', tu Customer ID es '123-456-7890'"
                        type="info"
                        showIcon
                      />
                    </Paragraph>
                  </div>
                )
              }
            ]}
          />
        </Card>

        {/* Límites de la API */}
        <Card title={<Space><ExclamationCircleOutlined style={{ color: '#faad14' }} /> Límites y Cuotas de la API</Space>}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Operaciones básicas">
                  <Space direction="vertical" size={0}>
                    <Text>15,000 operaciones por día (cuenta de prueba)</Text>
                    <Text>10,000,000 operaciones por día (cuenta estándar)</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Consultas de informes">
                  Sin límite específico, sujeto a límites de cuota
                </Descriptions.Item>
                <Descriptions.Item label="Solicitudes por segundo">
                  Limitado por cuota, se recomienda implementar rate limiting
                </Descriptions.Item>
                <Descriptions.Item label="Tamaño de respuesta">
                  Máximo 10,000 filas por página en consultas GAQL
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Divider />

          <Alert
            message="Mejores prácticas"
            description={
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>Implementa manejo de reintentos con backoff exponencial</li>
                <li>Usa paginación para consultas grandes</li>
                <li>Cachea resultados cuando sea posible</li>
                <li>Monitorea tu uso de cuota regularmente</li>
              </ul>
            }
            type="success"
            showIcon
          />
        </Card>

        {/* Enlaces Útiles */}
        <Card title={<Space><LinkOutlined style={{ color: '#1890ff' }} /> Enlaces Útiles</Space>}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>Documentación Oficial:</Text>
              <ul>
                <li>
                  <Link href="https://developers.google.com/google-ads/api/docs/start" target="_blank">
                    Guía de inicio rápido
                  </Link>
                </li>
                <li>
                  <Link href="https://developers.google.com/google-ads/api/docs/oauth/overview" target="_blank">
                    Configuración OAuth2
                  </Link>
                </li>
                <li>
                  <Link href="https://developers.google.com/google-ads/api/docs/query/overview" target="_blank">
                    Google Ads Query Language (GAQL)
                  </Link>
                </li>
                <li>
                  <Link href="https://developers.google.com/google-ads/api/reference/rpc/overview" target="_blank">
                    Referencia de la API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Text strong>Herramientas:</Text>
              <ul>
                <li>
                  <Link href="https://console.cloud.google.com/" target="_blank">
                    Google Cloud Console
                  </Link>
                </li>
                <li>
                  <Link href="https://ads.google.com/home/tools/manager-accounts/" target="_blank">
                    Google Ads Manager Accounts
                  </Link>
                </li>
                <li>
                  <Link href="https://developers.google.com/google-ads/api/fields/latest/overview" target="_blank">
                    API Field Selector
                  </Link>
                </li>
              </ul>
            </div>
          </Space>
        </Card>

        {/* Estado de la Configuración */}
        <Card title="Estado de la Configuración">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>Configuración Backend:</Text>
              <div style={{ marginTop: 8 }}>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Modelos configurados
                </Tag>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Resolvers implementados
                </Tag>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Servicios creados
                </Tag>
              </div>
            </div>

            <div>
              <Text strong>Configuración Frontend:</Text>
              <div style={{ marginTop: 8 }}>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  GraphQL queries
                </Tag>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Componentes de gestión
                </Tag>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Formularios configurados
                </Tag>
              </div>
            </div>

            <Alert
              message="Sistema listo para usar"
              description="Todas las configuraciones necesarias están implementadas. Puedes comenzar a agregar cuentas de Google Ads desde la pestaña 'Gestión de Cuentas'."
              type="success"
              showIcon
            />
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default ApiConfiguration;
