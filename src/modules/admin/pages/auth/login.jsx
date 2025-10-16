import React from 'react';
import { Form, Input, Button, Card, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Página de login temporal para el módulo admin
 */
const AdminLogin = () => {
  const onFinish = (values) => {
    console.log('Login attempt:', values);
    // TODO: Implementar lógica de autenticación real
    alert('Login funcional será implementado próximamente');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 400,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>🔐 Admin Login</Title>
            <Text type="secondary">Acceso al panel de administración</Text>
          </div>

          <Form
            name="admin-login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Por favor ingresa tu usuario' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Usuario"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Por favor ingresa tu contraseña' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Contraseña"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Página temporal - Sistema de auth en desarrollo
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AdminLogin;
