import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Alert, Typography, message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router';
import { useContextualRoute } from "@hooks/useContextualRoute";
import { useMutation } from '@apollo/client';
import { RESEND_VERIFICATION_CODE } from '../apollo/auth';
import VerificationCodeModal from '../components/VerificationCodeModal';
import { toast } from 'react-hot-toast';

const { Title, Text } = Typography;

const ResendConfirmation = () => {
  const [form] = Form.useForm();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [email, setEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const getModuleRoute = useContextualRoute("module");

  // Obtener email del estado de navegación si viene del login
  useEffect(() => {
    if (location.state?.email) {
      form.setFieldsValue({ email: location.state.email });
    }
  }, [location.state, form]);

  const [resendVerificationCode, { loading, error }] = useMutation(RESEND_VERIFICATION_CODE, {
    onCompleted: (data) => {
      if (data && data.resendVerificationCode && data.resendVerificationCode.success) {
        const userEmail = form.getFieldValue('email');
        setEmail(userEmail);
        setShowVerificationModal(true);
        toast.success('Código de verificación enviado. Revisa tu email.');
      } else {
        const errorMessage = data?.resendVerificationCode?.message || 'Error al reenviar código';
        toast.error(errorMessage);
      }
    },
    onError: (error) => {
      console.error('Error al reenviar código:', error);
      toast.error('Error al reenviar código de verificación');
    }
  });

  const onFinish = async (values) => {
    try {
      await resendVerificationCode({
        variables: {
          email: values.email
        }
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleVerificationSuccess = (user) => {
    setShowVerificationModal(false);
    toast.success('¡Email verificado exitosamente!');
    setTimeout(() => {
      navigate(getModuleRoute("auth/login"));
    }, 1500);
  };

  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
  };

  return (
    <>
      <VerificationCodeModal
        visible={showVerificationModal}
        email={email}
        onSuccess={handleVerificationSuccess}
        onCancel={handleVerificationCancel}
      />
      
      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2}>Reenviar Email de Confirmación</Title>
          {location.state?.email ? (
            <div>
              <Alert
                message="Email no confirmado"
                description="Necesitas confirmar tu email antes de poder iniciar sesión. Te ayudamos a reenviar el email de confirmación."
                type="warning"
                showIcon
                style={{ marginBottom: '16px', textAlign: 'left' }}
              />
              <Text type="secondary">
                Reenviaremos el email de confirmación a tu dirección
              </Text>
            </div>
          ) : (
            <Text type="secondary">
              Ingresa tu email para reenviar el enlace de confirmación
            </Text>
          )}
        </div>

        {error && (
          <Alert
            message="Error"
            description={error.message}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          name="resend-confirmation"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingresa tu email' },
              { type: 'email', message: 'Ingresa un email válido' }
            ]}
          >
            <Input placeholder="Ingresa tu email" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Reenviar Email
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Text>
            ¿Ya confirmaste tu cuenta?{' '}
            <Link to={getModuleRoute("auth/login")}>Inicia Sesión</Link>
          </Text>
        </div>
      </Card>
    </div>
    </>
  );
};

export default ResendConfirmation;
