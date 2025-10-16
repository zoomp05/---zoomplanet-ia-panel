import React from 'react';
import { Outlet } from 'react-router';
import ContextualHeader from '@components/ContextualHeader/ContextualHeader';

const TestLayout = () => {
  return (
    <div className="test-layout" style={{ border: '2px solid red', padding: '20px' }}>
      <ContextualHeader />
      <h1>TEST LAYOUT FROM ADMIN MODULE</h1>
      <div>Este es el layout del módulo admin aplicado al módulo project</div>
      <div>Las rutas del menú se normalizan según el contexto actual</div>
      <Outlet />
    </div>
  );
};

export default TestLayout;
