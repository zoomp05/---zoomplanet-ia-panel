import React from 'react';
import { AuthGuard } from '../../auth/guards/AuthGuard';
import { adminPolicies } from '../policies';

/**
 * Guard específico del módulo admin que usa la configuración del sitio
 */
export const AdminGuard = ({ children, policy = 'requireAdminAccess', ...props }) => {
  // Resolver la política desde las políticas específicas del admin
  const resolvedPolicy = adminPolicies[policy] || policy;
  
  return (
    <AuthGuard 
      policy={resolvedPolicy}
      {...props}
    >
      {children}
    </AuthGuard>
  );
};