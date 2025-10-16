// src/modules/auth/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import * as ApolloClient from "@apollo/client";
import { Form, Input, Button, Card, Typography, Divider, Checkbox } from 'antd';
import { UserOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import { LOGIN } from '../apollo/auth';
// Importar vía alias normalizado (configurar en vite.config si aún no existe) para evitar doble carga
import { useAuth } from '../contexts/AuthContext.jsx';
import { useContextualRoute } from "@hooks/useContextualRoute";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import Password from '@components/Password';
import VerificationCodeModal from '../components/VerificationCodeModal';

const { useMutation } = ApolloClient;
const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const { login: authLogin, isAuthenticated, user } = useAuth();
  const getModuleRoute = useContextualRoute("module");
  const { getPostLoginRedirect } = useAuthRedirect();

  const [login] = useMutation(LOGIN);

  // Si ya está autenticado, redirigir al home resuelto según jerarquía
  useEffect(() => {
    console.log(`[Login Page] 🛡️ Verificando estado de autenticación. isAuthenticated: ${isAuthenticated}`);
    if (isAuthenticated) {
      // Evitar permanecer en página de login si ya hay sesión
      const redirectRoute = getPostLoginRedirect();
      console.log(`[Login Page] ➡️ Usuario ya autenticado. Redirigiendo a: ${redirectRoute}`);
      
      // Anti-loop: No redirigir si ya estamos en la ruta de destino o si es una ruta de login
      if (location.pathname === redirectRoute || redirectRoute.includes('/auth/login')) {
        console.warn(`[Login Page] ⚠️ Loop de redirección detectado. Destino: ${redirectRoute}. Deteniendo.`);
        return;
      }
      
      navigate(redirectRoute, { replace: true });
    }
  }, [isAuthenticated, user, navigate, getPostLoginRedirect, location.pathname]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { data } = await login({
        variables: {
          input: {
            email: values.email,
            password: values.password
          }
        }
      });

      console.log('Login response:', data);

      if (data?.login?.accessToken) {
        // Usar el contexto de autenticación para guardar los datos
        // Pasar la opción rememberMe para determinar el tiempo de persistencia
        authLogin({
          user: data.login.user,
          account: data.login.account, // si existe
          accessToken: data.login.accessToken,
          refreshToken: data.login.refreshToken,
          remember: values.remember
        });
        
        toast.success('Inicio de sesión exitoso');
        
        // Obtener la ruta de redirección correcta usando PolicyProcessor
        let redirectRoute = getPostLoginRedirect();
        console.log('🔄 Login redirect (fase 1):', redirectRoute);
        // Pequeño delay para permitir registro tardío de módulos si ocurre en paralelo
        if (!redirectRoute || /auth\/login$/.test(redirectRoute)) {
          await new Promise(r => setTimeout(r, 50));
          const retry = getPostLoginRedirect();
            if (retry && retry !== redirectRoute) {
              console.log('🔄 Login redirect (fase 2 retry) ->', retry);
              redirectRoute = retry;
            }
        }
        console.log('➡️ Navegando a post-login:', redirectRoute);
        navigate(redirectRoute, { replace: true });
      } else {
        // Si data es null o data.login es null, podría ser un caso de email no confirmado
        console.log('🔍 Login returned null data - checking for email confirmation case');
        
        // Para usuarios con email no confirmado, el backend puede devolver null
        // En este caso, asumimos que es un problema de confirmación de email
        if (data === null || data.login === null) {
          console.log('🔄 Null response detected - likely EMAIL_NOT_CONFIRMED case');
          toast.error('Debes confirmar tu email antes de iniciar sesión');
          
          // Usar getModuleRoute para generar la ruta correcta
          const redirectPath = getModuleRoute("auth/email-confirmation-required");
          console.log('Navigating to:', redirectPath);
          try {
            navigate(redirectPath, { 
              state: { email: values.email } 
            });
            console.log('Navigation executed successfully');
          } catch (navError) {
            console.error('Navigation error:', navError);
          }
          return;
        }
        
        toast.error('Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.log('Error details:', {
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        message: error.message
      });
      
      // Debug: Verificar estructura del error
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        console.log('First GraphQL Error:', error.graphQLErrors[0]);
        console.log('Error code:', error.graphQLErrors[0]?.extensions?.code);
        console.log('Error message:', error.graphQLErrors[0]?.message);
      }
      
      // Manejar caso específico de email no confirmado
      const firstError = error.graphQLErrors?.[0];
      const errorCode = firstError?.extensions?.code;
      const firstErrorMessage = firstError?.message || '';
      
      console.log('🔍 Debug - Checking error values:');
      console.log('  - errorCode:', errorCode);
      console.log('  - errorCode type:', typeof errorCode);
      console.log('  - firstErrorMessage:', firstErrorMessage);
      console.log('  - firstErrorMessage type:', typeof firstErrorMessage);
      console.log('  - includes "confirmar tu email":', firstErrorMessage.includes('confirmar tu email'));
      console.log('  - includes "EMAIL_NOT_CONFIRMED":', firstErrorMessage.includes('EMAIL_NOT_CONFIRMED'));
      console.log('  - errorCode === "EMAIL_NOT_CONFIRMED":', errorCode === 'EMAIL_NOT_CONFIRMED');
      
      if (errorCode === 'EMAIL_NOT_CONFIRMED' || firstErrorMessage.includes('confirmar tu email') || firstErrorMessage.includes('EMAIL_NOT_CONFIRMED')) {
        console.log('🔄 EMAIL_NOT_CONFIRMED detected - Showing verification modal');
        toast.error('Debes confirmar tu email antes de iniciar sesión');
        
        // Mostrar el modal de verificación
        const emailToVerify = firstError?.extensions?.email || values.email;
        setUnconfirmedEmail(emailToVerify);
        setShowVerificationModal(true);
        return;
      }
      
      // Otros errores de autenticación
      if (error.graphQLErrors?.[0]?.extensions?.code === 'INVALID_CREDENTIALS') {
        toast.error('Email o contraseña incorrectos');
        return;
      }
      
      if (error.graphQLErrors?.[0]?.extensions?.code === 'ACCOUNT_DISABLED') {
        toast.error('Tu cuenta está desactivada. Contacta al administrador');
        return;
      }
      
      // Error genérico - usar el mensaje del primer error GraphQL si existe
      const finalErrorMessage = error.graphQLErrors?.[0]?.message || error.message || 'Error al iniciar sesión';
      toast.error(finalErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manejar verificación exitosa desde el modal
  const handleVerificationSuccess = (user) => {
    setShowVerificationModal(false);
    toast.success('¡Email verificado! Ahora puedes iniciar sesión.');
    // Intentar login automático o simplemente mantener el formulario listo
  };

  // Manejar cancelación del modal
  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
  };

  const handleGoogleLogin = () => {
    // Implementar lógica para login con Google
    toast.info('Login con Google no implementado aún');
  };

  const handleFacebookLogin = () => {
    // Implementar lógica para login con Facebook
    toast.info('Login con Facebook no implementado aún');
  };

  return (
    <>
      <VerificationCodeModal
        visible={showVerificationModal}
        email={unconfirmedEmail}
        onSuccess={handleVerificationSuccess}
        onCancel={handleVerificationCancel}
      />
      
      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Iniciar Sesión</Title>
          <Text type="secondary">Ingresa tus credenciales para acceder</Text>
        </div>

          <Form
            form={form}
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Por favor ingresa tu email' },
                { type: 'email', message: 'Por favor ingresa un email válido' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
            >
              <Password 
                placeholder="Contraseña" 
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Recordarme</Checkbox>
                </Form.Item>
                <Link to={getModuleRoute("forgot-password")}>¿Olvidaste tu contraseña?</Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Iniciar Sesión
              </Button>
            </Form.Item>

            <Divider>O continúa con</Divider>

            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <Button 
                icon={<GoogleOutlined />} 
                onClick={handleGoogleLogin} 
                block
                size="large"
              >
                Google
              </Button>
              <Button 
                icon={<FacebookOutlined />} 
                onClick={handleFacebookLogin} 
                block
                size="large"
              >
                Facebook
              </Button>
            </div>
          </Form>

          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">¿No tienes una cuenta? </Text>
            <Link to={getModuleRoute("auth/register")} style={{ fontWeight: 'bold' }}>
              Regístrate aquí
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Login;
