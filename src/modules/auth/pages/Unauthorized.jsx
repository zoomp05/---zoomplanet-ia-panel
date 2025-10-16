import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router';
import { LockOutlined } from '@ant-design/icons';

const Unauthorized = ({ 
  title = "Sin Permisos",
  subtitle = "No tienes permisos para acceder a esta página.",
  homeRoute = '/',
  loginRoute = '/login',
  showLoginButton = true,
  showHomeButton = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const goBack = () => {
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate(homeRoute);
    }
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Result
        status="403"
        title="403"
        subTitle={subtitle}
        icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
        extra={
          <div>
            {showHomeButton && (
              <Button type="primary" onClick={goBack}>
                Regresar
              </Button>
            )}
            {showLoginButton && (
              <Button 
                style={{ marginLeft: 8 }} 
                onClick={() => navigate(loginRoute)}
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
};

export default Unauthorized;