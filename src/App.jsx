import './polyfills';
import './index.css';
import React, { useEffect, useState, useRef } from 'react';
// TODO: Evolucionar a carga dinámica de providers según appConfig (src/zoom/appConfig.js)
// Ej: leer appConfig.modules.auth.provider y envolver AppRoot dinámicamente
import { RouterProvider } from "react-router";
import { SiteProvider } from './zoom/context/SiteContext.jsx';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import RouterErrorBoundary from './zoom/components/RouterErrorBoundary';
// Importamos el sistema unificado de carga (notar la extensión .jsx)
import { initializeSystem, detectCurrentSite, getSiteConfig } from './zoom/routing/systemLoader.js';

function App() {
  const [router, setRouter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSite, setCurrentSite] = useState('zoomy');
  const [siteConfig, setSiteConfig] = useState(null);
  
  // Protección contra re-inicialización
  const initializedRef = useRef(false);
  const initAttemptsRef = useRef(0);

  useEffect(() => {
    // Si ya se inicializó, no hacer nada
    if (initializedRef.current) {
      console.log('[App] ⏭️ Ya inicializado, saltando...');
      return;
    }
    
    initAttemptsRef.current += 1;
    console.log('[App] 🚀 Iniciando sistema... (intento:', initAttemptsRef.current, ')');
    
    // Protección anti-loop
    if (initAttemptsRef.current > 2) {
      console.error('[App] 💥 Demasiados intentos de inicialización, deteniendo...');
      setError(new Error('Loop de inicialización detectado'));
      setLoading(false);
      return;
    }
    
    // Inicialización asíncrona
    const init = async () => {
      try {
        setLoading(true);
        console.log('[App] 🔍 Detectando sitio...');
        const detectedSite = await detectCurrentSite();
        console.log('[App] ✅ Sitio detectado:', detectedSite);
        setCurrentSite(detectedSite);

        console.log('[App] 🔧 Inicializando sistema de rutas...');
        const generatedRouter = await initializeSystem();
        console.log('[App] ✅ Router generado');
        
        setRouter(generatedRouter);

        // Obtener configuración del sitio después de que se carga
        console.log('[App] ⚙️ Cargando configuración del sitio...');
        const config = getSiteConfig(detectedSite);
        console.log('[App] ✅ Configuración cargada');
        setSiteConfig(config);

        setLoading(false);
        initializedRef.current = true; // Marcar como inicializado
        console.log('[App] 🎉 Sistema inicializado correctamente');
      } catch (err) {
        console.error("[App] ❌ Error al inicializar el sistema:", err);
        setError(err);
        setLoading(false);
      }
    };

    init();
  }, []); // IMPORTANTE: array vacío para ejecutar solo una vez

  // Escuchar cambios en la URL para detectar cambios de sitio
  useEffect(() => {
    const handleLocationChange = async () => {
      console.log('[App] 🔄 Detectando cambio de ubicación...');
      const newSite = await detectCurrentSite();
      if (newSite !== currentSite) {
        console.log(`[App] 🔀 Cambio de sitio detectado: ${currentSite} -> ${newSite}`);
        setCurrentSite(newSite);

        // Actualizar configuración del sitio
        const config = getSiteConfig(newSite);
        setSiteConfig(config);
      }
    };

    // Escuchar eventos de navegación
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [currentSite]);

  // Mientras se carga, mostramos un indicador
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Cargando aplicación {typeof currentSite === 'string' ? currentSite.toUpperCase() : ''}...</p>
      </div>
    );
  }

  // Si hubo un error, mostramos un mensaje
  if (error) {
    return (
      <div className="app-error">
        <h2>Error al inicializar la aplicación</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  // Si no hay router, algo salió mal
  if (!router) {
    return (
      <div className="app-error">
        <h2>Error al cargar las rutas</h2>
        <p>No se pudo generar el router de la aplicación.</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <SiteProvider siteName={currentSite} siteConfig={siteConfig}>
          <RouterProvider 
            router={router} 
            fallbackElement={<div>Cargando...</div>}
            errorElement={<RouterErrorBoundary />}
          />
          <Toaster position="top-right" />
        </SiteProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;

// Nota: Protección de rutas ahora centralizada vía RouteGuard y authConfig (PolicyProcessor).
