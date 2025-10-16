import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Spin, Alert } from 'antd';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSite } from '../../../zoom/context/SiteContext.jsx';
import { policyProcessor } from '../../../zoom/security/policyProcessor.js';

const RouteGuard = ({ children, moduleConfig }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated } = useAuth();
  const { siteName } = useSite();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.info(`[Auth] isAuthenticated=${!!isAuthenticated}, user=${user ? 'present' : 'null'}`);
  }, [isAuthenticated, user]);

  useEffect(() => {
    checkAccess();
  }, [location.pathname, user, siteName]);

  useEffect(() => {
    if (moduleConfig) {
      policyProcessor.registerModule(moduleConfig);
    }
  }, [moduleConfig]);

  const checkAccess = async () => {
    setLoading(true);
    setError(null);

    try {
      // PROTECCIÓN ANTI-LOOP: Si la ruta actual contiene '/auth/', siempre permitir
      if (location.pathname.includes('/auth/')) {
        console.log(`🚨 ANTI-LOOP: Ruta contiene /auth/, permitiendo acceso sin evaluar: ${location.pathname}`);
        setAuthorized(true);
        setLoading(false);
        return;
      }

      if (!moduleConfig) {
        setAuthorized(true);
        return;
      }

      // Calcular relativePath dentro del módulo
      const pathParts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
      const siteIndex = pathParts.indexOf(siteName);
      const moduleIndex = siteIndex >= 0 ? siteIndex + 1 : -1;
      const routeParts = moduleIndex >= 0 ? pathParts.slice(moduleIndex + 1) : [];
      const relativePath = routeParts.join('/'); // '' para raíz del módulo

      console.log(`[RouteGuard] 🔍 Evaluando ruta:`, {
        fullPath: location.pathname,
        siteName,
        pathParts,
        siteIndex,
        moduleIndex,
        routeParts,
        relativePath,
        moduleConfig: moduleConfig?.moduleName
      });

      // Rutas públicas del módulo (evitar bucles)
      const publicRoutes = moduleConfig.publicRoutes || [
        'auth/login',
        'auth/register', 
        'auth/forgot-password',
        'auth/reset-password',
        'auth/verify-email',
        'auth/unauthorized'
      ];

      // Si la ruta actual es una pública, dejar pasar
      // Comparar tanto el relativePath como variantes sin el prefijo del módulo
      const isPublic = publicRoutes.some(pubRoute => {
        // Comparar exacto
        if (relativePath === pubRoute) return true;
        // Comparar sin slash inicial
        if (relativePath === pubRoute.replace(/^\//, '')) return true;
        // Si relativePath incluye la ruta pública
        if (relativePath.endsWith(pubRoute)) return true;
        return false;
      });

      if (isPublic) {
        console.log(`🔓 Ruta pública detectada: ${relativePath} → No requiere autenticación`);
        setAuthorized(true);
        return;
      }

      // Evaluar acceso
      const accessResult = await policyProcessor.evaluateAccess(
        moduleConfig.moduleName,
        relativePath,
        user,
        siteName,
        { location, timestamp: Date.now() }
      );

      if (accessResult === true || accessResult.allow === true) {
        setAuthorized(true);

        // Si hay sesión y estamos en la raíz del módulo, redirigir a homeRoute
        if (isAuthenticated && (relativePath === '' || relativePath === '/')) {
          const home = policyProcessor.getRedirectRoute(
            moduleConfig.moduleName,
            'home',
            siteName,
            { location, timestamp: Date.now() }
          );
          if (home && home !== location.pathname) {
            console.info(`➡️ Redirigiendo a homeRoute: ${home}`);
            navigate(home, { replace: true });
            return;
          }
        }
      } else {
        const redirectTo = accessResult.redirectTo || 
          policyProcessor.getRedirectRoute(
            moduleConfig.moduleName,
            'login',
            siteName,
            { location, timestamp: Date.now() }
          );

        console.log(`Acceso denegado. Política fallida: ${accessResult.failedPolicy}`);
        navigate(redirectTo, {
          replace: true,
          state: {
            from: location.pathname,
            reason: `Política fallida: ${accessResult.failedPolicy}`
          }
        });
        setAuthorized(false);
      }
    } catch (err) {
      console.error('Error checking access:', err);
      setError(err.message);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <Spin size="large" tip="Verificando permisos..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error de Autorización"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (!authorized) {
    return (
      <Alert
        message="Acceso Denegado"
        description="No tienes permisos para acceder a esta página."
        type="warning"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return children;
};

export default RouteGuard;
