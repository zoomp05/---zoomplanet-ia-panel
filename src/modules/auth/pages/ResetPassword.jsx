// src/modules/auth/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import * as ApolloClient from "@apollo/client";
import { Form, Input, Button, Card, Typography, Row, Col, Result } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router';
import { useContextualRoute } from '@hooks/useContextualRoute';
import { resolveLoginRoute } from '../hooks/resolveLoginRoute.js';
import { toast } from 'react-hot-toast';
import { RESET_PASSWORD, VALIDATE_TOKEN } from '../apollo/auth';

const { useMutation, useQuery } = ApolloClient;
const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [token, setToken] = useState('');
  const getModuleRoute = useContextualRoute('module');

  const [resetPassword, { loading: resetLoading }] = useMutation(RESET_PASSWORD);

  // Extraer el token de la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Token no encontrado en la URL');
      navigate(resolveLoginRoute());
    }
  }, [location, navigate]);

  // Validar el token
  const { loading: validatingToken } = useQuery(VALIDATE_TOKEN, {
    variables: { token },
    skip: !token,
    onCompleted: (data) => {
      if (data.validateToken) {
        setValidToken(true);
      } else {
        toast.error('El token ha expirado o no es válido');
        navigate(resolveLoginRoute());
      }
    },
    onError: (error) => {
      console.error('Token validation error:', error);
      toast.error('Error al validar el token');
      navigate(resolveLoginRoute());
    }
  });

  const handleSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const { data } = await resetPassword({
        variables: {
          token,
          password: values.password
        }
      });

      if (data.resetPassword) {
        setSubmitted(true);
        toast.success('Contraseña restablecida con éxito');
      } else {
        toast.error('Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Error al procesar la solicitud');
    }
  };

  if (submitted) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={22} sm={16} md={12} lg={8} xl={6}>
          <Result
            status="success"
            title="¡Contraseña restablecida!"
            subTitle="Tu contraseña ha sido restablecida con éxito. Ahora puedes iniciar sesión con tu nueva contraseña."
            extra={[
              <Button type="primary" key="login">
                <Link to={getModuleRoute('auth/login')}>Ir al inicio de sesión</Link>
              </Button>
            ]}
          />
        </Col>
      </Row>
    );
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>Restablecer Contraseña</Title>
            <Text type="secondary">
              Ingresa tu nueva contraseña
            </Text>
          </div>

          {validToken && !validatingToken ? (
            <Form
              form={form}
              name="reset-password"
              onFinish={handleSubmit}
              layout="vertical"
            >
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Por favor ingresa tu nueva contraseña' },
                  { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nueva contraseña" size="large" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                rules={[
                  { required: true, message: 'Por favor confirma tu contraseña' },
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
                <Input.Password prefix={<LockOutlined />} placeholder="Confirmar contraseña" size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={resetLoading} block size="large">
                  Restablecer Contraseña
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Link to="/login">
                  <ArrowLeftOutlined /> Volver al inicio de sesión
                </Link>
              </div>
            </Form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text>Validando token...</Text>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ResetPassword;
