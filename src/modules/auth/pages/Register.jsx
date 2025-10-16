import React, { useState } from 'react';
import * as ApolloClient from "@apollo/client";
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { REGISTER } from '../apollo/auth';
import { useSite } from '@src/zoom/context/SiteContext';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import { useContextualRoute } from "@hooks/useContextualRoute";
import Password from '@components/Password';
import VerificationCodeModal from '../components/VerificationCodeModal';

const { useMutation } = ApolloClient;
const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { siteName } = useSite();
  const [register] = useMutation(REGISTER);
  const getModuleRoute = useContextualRoute("module");
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      // Construir la URL de confirmación usando el sistema de rutas contextuales
      const verifyEmailRoute = getModuleRoute("verify-email");
      const confirmationUrl = window.location.origin + verifyEmailRoute;

      console.log('🔗 Debugging register confirmation URL:');
      console.log('  - window.location.origin:', window.location.origin);
      console.log('  - getModuleRoute("verify-email"):', verifyEmailRoute);
      console.log('  - confirmationUrl final:', confirmationUrl);

      const { data, errors } = await register({
        variables: {
          input: {
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            confirmationUrl: confirmationUrl
          }
        }
      });

      // Si GraphQL devuelve errores, los manejamos aquí.
      if (errors && errors.length > 0) {
        const msg = errors[0].message || "Error desconocido";
        setError(msg);
        toast.error(msg);
        return; // Detenemos la ejecución
      }

      if (data?.register?.user) {
        setUserEmail(values.email);
        setShowVerificationModal(true);
        toast.success('¡Registro exitoso! Revisa tu email para obtener el código de verificación.');
      } else {
        throw new Error('La respuesta del servidor no contiene el usuario registrado.');
      }
    } catch (err) {
      console.error('Register error:', err);
      // Captura el mensaje de error GraphQL
      const msg = err?.graphQLErrors?.[0]?.message || "Error desconocido";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Manejar verificación exitosa
  const handleVerificationSuccess = (user) => {
    setShowVerificationModal(false);
    toast.success('¡Email verificado! Redirigiendo al inicio de sesión...');
    setTimeout(() => {
      navigate(getModuleRoute("auth/login"));
    }, 1500);
  };

  // Manejar cancelación del modal
  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
    toast.info('Puedes verificar tu email más tarde desde tu perfil.');
  };

  return (
    <>
      <VerificationCodeModal
        visible={showVerificationModal}
        email={userEmail}
        onSuccess={handleVerificationSuccess}
        onCancel={handleVerificationCancel}
      />

      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={3}>Crear Nueva Cuenta</Title>
            <Text type="secondary">Únete a {siteName}</Text>
          </div>

        {error && (
          <Alert
            message={error}
            type="error"
            style={{ marginBottom: '16px' }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="firstName"
            rules={[
              { required: true, message: 'Ingresa tu nombre' },
              { min: 2, message: 'Mínimo 2 caracteres' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nombre"
              autoComplete="given-name"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[
              { required: true, message: 'Ingresa tu apellido' },
              { min: 2, message: 'Mínimo 2 caracteres' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Apellido"
              autoComplete="family-name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Ingresa tu email' },
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={Password.getRules({
              minLength: 8,
              requireNumber: true,
              requireUppercase: true,
              requireSpecialChar: true,
              fieldName: 'contraseña'
            })}
          >
            <Password
              placeholder="Contraseña"
              showStrength={true}
              minLength={8}
              requireNumber={true}
              requireUppercase={true}
              requireSpecialChar={true}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirma tu contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Password
              placeholder="Confirmar contraseña"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Registrarse
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Text type="secondary">
            ¿Ya tienes cuenta?{' '}
            <Link to={getModuleRoute("auth/login")} style={{ color: '#1890ff' }}>
              Inicia sesión aquí
            </Link>
          </Text>
        </div>
      </Card>
    </div>
    </>
  );
};

export default Register;
