import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';

/**
 * Componente de bienvenida para Migratum
 * Se puede usar como landing page temporal
 */
const Welcome = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="success"
      title="¡Bienvenido a Migratum!"
      subTitle="Panel de administración iniciado correctamente"
      extra={[
        <Button 
          type="primary" 
          key="dashboard"
          onClick={() => navigate('/migratum/dashboard')}
        >
          Ir al Dashboard
        </Button>,
        <Button 
          key="account"
          onClick={() => navigate('/migratum/account')}
        >
          Mi Cuenta
        </Button>,
      ]}
    />
  );
};

export default Welcome;
