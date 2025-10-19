import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Spin } from 'antd';

/**
 * Página de índice de Migratum
 * Redirige automáticamente al dashboard
 */
const MigratumIndex = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente al dashboard
    const timer = setTimeout(() => {
      navigate('/migratum/dashboard', { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <Result
        icon={<Spin size="large" />}
        title="Bienvenido a Migratum"
        subTitle="Redirigiendo al panel de administración..."
      />
    </div>
  );
};

export default MigratumIndex;
