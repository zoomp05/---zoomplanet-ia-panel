import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.jsx';
import { evaluatePolicy } from '../policies';

// Configuración por defecto que puede ser sobrescrita
const defaultConfig = {
  loginRoute: '/login',
  unauthorizedRoute: '/unauthorized',
  loadingComponent: null
};

// Context para configuración global del AuthGuard
export const AuthConfigContext = React.createContext(defaultConfig);

export const AuthConfigProvider = ({ children, config }) => {
  const mergedConfig = { ...defaultConfig, ...config };
  return (
    <AuthConfigContext.Provider value={mergedConfig}>
      {children}
    </AuthConfigContext.Provider>
  );
};

export const AuthGuard = ({ 
  children, 
  policy = 'requireAuth',
  loginRoute,
  unauthorizedRoute,
  loadingComponent,
  onUnauthorized,
  context = {}
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const globalConfig = React.useContext(AuthConfigContext);
  
  // Usar configuración local o global
  const finalLoginRoute = loginRoute || globalConfig.loginRoute;
  const finalUnauthorizedRoute = unauthorizedRoute || globalConfig.unauthorizedRoute;
  const finalLoadingComponent = loadingComponent || globalConfig.loadingComponent;
  
  // Componente de loading personalizable
  if (loading) {
    if (finalLoadingComponent) {
      return finalLoadingComponent;
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Verificando autenticación...</div>
      </div>
    );
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate 
      to={finalLoginRoute} 
      state={{ from: location }} 
      replace 
    />;
  }
  
  // Si no hay política específica, solo verificar autenticación
  if (!policy) {
    return children;
  }
  
  // Evaluar la política específica
  const hasAccess = evaluatePolicy(policy, user, context);
  
  if (!hasAccess) {
    // Callback personalizado para manejo de no autorización
    if (onUnauthorized) {
      return onUnauthorized(user, location);
    }
    
    return <Navigate 
      to={finalUnauthorizedRoute} 
      state={{ 
        from: location, 
        reason: 'insufficient_permissions',
        user: user?.id 
      }} 
      replace 
    />;
  }
  
  return children;
};

// Variante específica para rutas de admin
export const AdminGuard = ({ children, ...props }) => {
  return (
    <AuthGuard 
      policy="requireAdminAccess" 
      unauthorizedFallback="/zoomy/admin/auth/unauthorized"
      {...props}
    >
      {children}
    </AuthGuard>
  );
};