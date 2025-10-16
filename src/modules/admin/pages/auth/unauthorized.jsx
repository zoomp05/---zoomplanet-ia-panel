import React from 'react';
import { Result, Button, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router';

/**
 * Página de acceso no autorizado
 */
const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    // Detectar sitio actual de la URL
    const pathParts = location.pathname.split('/').filter(Boolean);
    const siteName = pathParts[0] || 'zoomy';
    navigate(`/${siteName}/admin`);
  };

  const handleLogin = () => {
    // Detectar sitio actual de la URL  
    const pathParts = location.pathname.split('/').filter(Boolean);
    const siteName = pathParts[0] || 'zoomy';
    navigate(`/${siteName}/admin/auth/login`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="Lo sentimos, no tienes autorización para acceder a esta página."
        extra={
          <Space>
            <Button type="primary" onClick={handleLogin}>
              Iniciar Sesión
            </Button>
            <Button onClick={handleGoHome}>
              Ir al Inicio
            </Button>
            <Button onClick={handleGoBack}>
              Volver
            </Button>
          </Space>
        }
      />
    </div>
  );
};

export default Unauthorized;
