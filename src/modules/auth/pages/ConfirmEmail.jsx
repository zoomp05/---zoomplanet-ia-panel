import React, { useState, useEffect } from 'react';
import * as ApolloClient from "@apollo/client";
import { Card, Typography, Button, Alert, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { CONFIRM_EMAIL, RESEND_VERIFICATION_CODE } from '../apollo/auth';
import { toast } from 'react-hot-toast';
import { useContextualRoute } from "@hooks/useContextualRoute";
import VerificationCodeModal from '../components/VerificationCodeModal';

const { useMutation } = ApolloClient;
const { Title, Text } = Typography;

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confirmEmail] = useMutation(CONFIRM_EMAIL);
  const [resendVerificationCode] = useMutation(RESEND_VERIFICATION_CODE);
  const getModuleRoute = useContextualRoute("module");
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const token = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');

  useEffect(() => {
    if (token) {
      handleConfirmEmail();
    } else {
      setError('Token de confirmación no válido');
      setLoading(false);
    }
  }, [token]);

  const handleConfirmEmail = async () => {
    try {
      const { data } = await confirmEmail({
        variables: { token }
      });

      // Verificar que data y data.confirmEmail existan
      if (data && data.confirmEmail) {
        if (data.confirmEmail.success) {
          setSuccess(true);
          setEmail(data.confirmEmail.user?.email || emailFromUrl || '');
          toast.success('¡Email confirmado exitosamente!');
        } else {
          setError(data.confirmEmail.message || 'Error al confirmar email');
          toast.error(data.confirmEmail.message || 'Error al confirmar email');
        }
      } else {
        // Si data es null o data.confirmEmail no existe
        setError('Respuesta inválida del servidor');
        toast.error('Error: respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Confirm email error:', err);
      setError(err.message || 'Error al confirmar email');
      toast.error(err.message || 'Error al confirmar email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email && !emailFromUrl) {
      toast.error('Email no disponible para reenvío');
      return;
    }

    setResending(true);
    try {
      const userEmail = email || emailFromUrl;
      
      const { data } = await resendVerificationCode({
        variables: { 
          email: userEmail
        }
      });

      if (data && data.resendVerificationCode && data.resendVerificationCode.success) {
        setEmail(userEmail);
        setShowVerificationModal(true);
        toast.success('Código de verificación enviado. Revisa tu email.');
      } else {
        toast.error(data?.resendVerificationCode?.message || 'Error al reenviar código');
      }
    } catch (err) {
      console.error('Resend verification code error:', err);
      toast.error(err.message || 'Error al reenviar código de verificación');
    } finally {
      setResending(false);
    }
  };

  const handleVerificationSuccess = (user) => {
    setShowVerificationModal(false);
    setSuccess(true);
    setEmail(user.email);
    toast.success('¡Email verificado exitosamente!');
  };

  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
  };

  if (loading) {
    return (
      <>
        <VerificationCodeModal
          visible={showVerificationModal}
          email={email || emailFromUrl}
          onSuccess={handleVerificationSuccess}
          onCancel={handleVerificationCancel}
        />
        
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <Card style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Confirmando tu email...</Text>
            </div>
          </Card>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <VerificationCodeModal
          visible={showVerificationModal}
          email={email || emailFromUrl}
          onSuccess={handleVerificationSuccess}
          onCancel={handleVerificationCancel}
        />
        
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined 
                style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} 
              />
              <Title level={2} style={{ color: '#52c41a' }}>
                ¡Email Confirmado!
              </Title>
              <Text>
                Tu email ha sido confirmado exitosamente. 
                Ahora puedes iniciar sesión con tu cuenta.
              </Text>
              {email && (
                <div style={{ margin: '16px 0' }}>
                  <Text type="secondary">Email confirmado: <strong>{email}</strong></Text>
                </div>
              )}
              <div style={{ marginTop: '24px' }}>
                <Link to={getModuleRoute("auth/login")}>
                  <Button type="primary" size="large" block>
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <VerificationCodeModal
        visible={showVerificationModal}
        email={email || emailFromUrl}
        onSuccess={handleVerificationSuccess}
        onCancel={handleVerificationCancel}
      />
      
      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <CloseCircleOutlined 
              style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} 
            />
            <Title level={2} style={{ color: '#ff4d4f' }}>
              Error de Confirmación
            </Title>
            <Alert
              message={error}
              type="error"
              style={{ marginBottom: '24px' }}
            />
            
            <div style={{ marginBottom: '16px' }}>
              <Text>
                El enlace de confirmación puede haber expirado o ser inválido.
              </Text>
            </div>

            {(email || emailFromUrl) && (
              <div style={{ marginBottom: '24px' }}>
                <Button 
                  onClick={handleResendConfirmation}
                  loading={resending}
                  block
                >
                  Verificar con Código
                </Button>
              </div>
            )}

            <div>
              <Link to={getModuleRoute("auth/login")}>
                <Button type="primary" block>
                  Volver al Login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ConfirmEmail;
