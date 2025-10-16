import React from 'react';
import { Alert, Button } from 'antd';
import { MailOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router';

const EmailNotConfirmedAlert = ({ email, showResendButton = true, style = {}, getModuleRoute }) => {
  // Debug: Verificar que getModuleRoute sea una función
  console.log('🔍 EmailNotConfirmedAlert - getModuleRoute:', getModuleRoute);
  console.log('🔍 EmailNotConfirmedAlert - getModuleRoute type:', typeof getModuleRoute);
  
  return (
    <Alert
      message="Email no confirmado"
      description={
        <div>
          <p>
            <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
            Tu cuenta existe pero necesitas confirmar tu email antes de poder iniciar sesión.
          </p>
          {email && (
            <p>
              <MailOutlined style={{ marginRight: '8px' }} />
              Email registrado: <strong>{email}</strong>
            </p>
          )}
          <p>
            Por favor revisa tu bandeja de entrada (incluyendo la carpeta de spam) 
            para encontrar el email de confirmación.
          </p>
          {showResendButton && getModuleRoute && typeof getModuleRoute === 'function' && (
            <div style={{ marginTop: '12px' }}>
              <Link to={getModuleRoute("auth/resend-confirmation")} state={{ email }}>
                <Button type="primary" icon={<MailOutlined />}>
                  Reenviar Email de Confirmación
                </Button>
              </Link>
            </div>
          )}
        </div>
      }
      type="warning"
      showIcon
      style={{ textAlign: 'left', ...style }}
    />
  );
};

export default EmailNotConfirmedAlert;
