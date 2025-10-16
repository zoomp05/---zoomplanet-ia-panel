// src/modules/auth/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import * as ApolloClient from "@apollo/client";
import { Form, Input, Button, Card, Typography, Row, Col, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { toast } from 'react-hot-toast';
import { FORGOT_PASSWORD } from '../apollo/auth';

const { useMutation } = ApolloClient;
const { Title, Text, Paragraph } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD);

  const handleSubmit = async (values) => {
    try {
      const { data } = await forgotPassword({
        variables: {
          email: values.email
        }
      });

      if (data.forgotPassword) {
        setEmail(values.email);
        setSubmitted(true);
        toast.success('Instrucciones enviadas a tu correo electrónico');
      } else {
        toast.error('Error al enviar las instrucciones');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Error al procesar la solicitud');
    }
  };

  if (submitted) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={22} sm={16} md={12} lg={8} xl={6}>
          <Result
            status="success"
            title="¡Solicitud enviada!"
            subTitle={`Hemos enviado instrucciones para restablecer tu contraseña a ${email}. Por favor revisa tu bandeja de entrada.`}
            extra={[
              <Button type="primary" key="login">
                <Link to="/login">Volver al inicio de sesión</Link>
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
            <Title level={3}>Recuperar Contraseña</Title>
            <Text type="secondary">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
            </Text>
          </div>

          <Form
            form={form}
            name="forgot-password"
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
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Enviar Instrucciones
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Link to="/login">
                <ArrowLeftOutlined /> Volver al inicio de sesión
              </Link>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default ForgotPassword;
