import React from 'react';
import { Card, Typography, Button, Steps, Alert } from 'antd';
import { MailOutlined, CheckCircleOutlined, LoginOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router';
import { useContextualRoute } from "@hooks/useContextualRoute";
import EmailNotConfirmedAlert from '../components/EmailNotConfirmedAlert';

const { Title, Text, Paragraph } = Typography;

const EmailConfirmationRequired = () => {
  const location = useLocation();
  const email = location.state?.email;
  const getModuleRoute = useContextualRoute("module");
  
  // Debug: Verificar que getModuleRoute sea una función
  console.log('🔍 EmailConfirmationRequired - getModuleRoute:', getModuleRoute);
  console.log('🔍 EmailConfirmationRequired - getModuleRoute type:', typeof getModuleRoute);

  const steps = [
    {
      title: 'Revisa tu email',
      description: 'Busca en tu bandeja de entrada y carpeta de spam',
      icon: <MailOutlined />
    },
    {
      title: 'Haz clic en el enlace',
      description: 'Confirma tu email haciendo clic en el enlace del mensaje',
      icon: <CheckCircleOutlined />
    },
    {
      title: 'Inicia sesión',
      description: 'Una vez confirmado, podrás iniciar sesión normalmente',
      icon: <LoginOutlined />
    }
  ];

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2}>Confirmación de Email Requerida</Title>
          <Text type="secondary">
            Necesitas confirmar tu email antes de poder acceder a tu cuenta
          </Text>
        </div>

        <EmailNotConfirmedAlert 
          email={email} 
          getModuleRoute={getModuleRoute}
          style={{ marginBottom: '24px' }}
        />

        <div style={{ marginBottom: '32px' }}>
          <Title level={4}>Pasos para completar tu registro:</Title>
          <Steps
            direction="vertical"
            size="small"
            items={steps}
          />
        </div>

        <Alert
          message="¿No recibiste el email?"
          description={
            <div>
              <Paragraph>
                Si no encuentras el email de confirmación:
              </Paragraph>
              <ul>
                <li>Revisa tu carpeta de spam o correo no deseado</li>
                <li>Asegúrate de que la dirección {email && <strong>{email}</strong>} sea correcta</li>
                <li>Espera unos minutos, a veces puede tardar en llegar</li>
                <li>Si sigue sin llegar, solicita un reenvío</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px', textAlign: 'left' }}
        />

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to={getModuleRoute("auth/resend-confirmation")} state={{ email }}>
            <Button type="primary" icon={<MailOutlined />}>
              Reenviar Email
            </Button>
          </Link>
          <Link to={getModuleRoute("auth/login")}>
            <Button>
              Volver al Login
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default EmailConfirmationRequired;
