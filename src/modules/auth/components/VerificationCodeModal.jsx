import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button, Typography, Space, Alert } from 'antd';
import { MailOutlined, ReloadOutlined } from '@ant-design/icons';
import * as ApolloClient from "@apollo/client";
import { VERIFY_EMAIL_CODE, RESEND_VERIFICATION_CODE } from '../apollo/auth';
import { toast } from 'react-hot-toast';

const { useMutation } = ApolloClient;
const { Title, Text } = Typography;

const VerificationCodeModal = ({ 
  visible, 
  email, 
  onSuccess, 
  onCancel 
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos en segundos
  const inputRefs = useRef([]);
  
  const [verifyEmailCode, { loading: verifyLoading }] = useMutation(VERIFY_EMAIL_CODE);
  const [resendVerificationCode, { loading: resendLoading }] = useMutation(RESEND_VERIFICATION_CODE);

  // Temporizador de cuenta regresiva
  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  // Formatear el tiempo restante
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Manejar cambio en los inputs
  const handleChange = (value, index) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejar tecla de retroceso
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Manejar pegado de código
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error('El código debe contener solo números');
      return;
    }

    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    
    // Focus al último input lleno o al primero vacío
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  // Verificar el código
  const handleVerify = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Por favor ingresa el código completo');
      return;
    }

    try {
      const { data, errors } = await verifyEmailCode({
        variables: {
          email,
          code: fullCode
        }
      });

      if (errors && errors.length > 0) {
        const msg = errors[0].message || "Error al verificar el código";
        setError(msg);
        toast.error(msg);
        return;
      }

      if (data?.verifyEmailCode?.success) {
        toast.success('¡Email verificado exitosamente!');
        onSuccess(data.verifyEmailCode.user);
      }
    } catch (err) {
      console.error('Verification error:', err);
      const msg = err?.graphQLErrors?.[0]?.message || "Error al verificar el código";
      setError(msg);
      toast.error(msg);
    }
  };

  // Reenviar código
  const handleResend = async () => {
    try {
      const { data, errors } = await resendVerificationCode({
        variables: { email }
      });

      if (errors && errors.length > 0) {
        const msg = errors[0].message || "Error al reenviar el código";
        toast.error(msg);
        return;
      }

      if (data?.resendVerificationCode?.success) {
        toast.success('Nuevo código enviado. Revisa tu email.');
        setTimeLeft(600); // Reiniciar el temporizador
        setCode(['', '', '', '', '', '']);
        setError(null);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Resend error:', err);
      const msg = err?.graphQLErrors?.[0]?.message || "Error al reenviar el código";
      toast.error(msg);
    }
  };

  // Reiniciar el modal cuando se cierra
  const handleCancel = () => {
    setCode(['', '', '', '', '', '']);
    setError(null);
    setTimeLeft(600);
    onCancel();
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      centered
      destroyOnClose
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: '#e6f7ff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <MailOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
        </div>

        <Title level={3} style={{ marginBottom: '8px' }}>
          Verifica tu Email
        </Title>
        
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
          Hemos enviado un código de 6 dígitos a
          <br />
          <strong>{email}</strong>
        </Text>

        {error && (
          <Alert
            message={error}
            type="error"
            style={{ marginBottom: '24px', textAlign: 'left' }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Space size="middle" style={{ marginBottom: '24px' }}>
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              maxLength={1}
              style={{
                width: '48px',
                height: '56px',
                fontSize: '24px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
              autoFocus={index === 0}
            />
          ))}
        </Space>

        <div style={{ marginBottom: '24px' }}>
          {timeLeft > 0 ? (
            <Text type="secondary">
              El código expira en: <strong style={{ color: timeLeft < 60 ? '#ff4d4f' : '#1890ff' }}>
                {formatTime(timeLeft)}
              </strong>
            </Text>
          ) : (
            <Text type="danger">
              El código ha expirado. Solicita uno nuevo.
            </Text>
          )}
        </div>

        <Button
          type="primary"
          size="large"
          onClick={handleVerify}
          loading={verifyLoading}
          disabled={code.join('').length !== 6 || timeLeft === 0}
          style={{ width: '100%', marginBottom: '12px' }}
        >
          Verificar Código
        </Button>

        <Button
          type="link"
          icon={<ReloadOutlined />}
          onClick={handleResend}
          loading={resendLoading}
          disabled={resendLoading}
        >
          Reenviar código
        </Button>

        <div style={{ marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ¿No recibiste el código? Revisa tu carpeta de spam o solicita uno nuevo.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default VerificationCodeModal;
