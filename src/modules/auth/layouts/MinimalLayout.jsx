import React from 'react';
import { Outlet } from 'react-router';
import { Card } from 'antd';

/**
 * Layout minimal para páginas de auth específicas
 * Solo el contenido sin header ni navegación
 */
const MinimalLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <Card style={{ 
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Outlet />
      </Card>
    </div>
  );
};

export default MinimalLayout;
