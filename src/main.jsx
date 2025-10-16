import './polyfills';
import './index.css';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ApolloProvider } from '@apollo/client';
import client from './config/apolloClient';
import { buildProviders } from './zoom/bootstrap/loadProviders.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  // TEMPORALMENTE sin StrictMode para evitar double-mounting en desarrollo
  // <StrictMode>
    <ApolloProvider client={client}>
      {/* Los providers dinámicos (auth, theme, etc.) se inyectan vía buildProviders */}
      <DynamicProvidersWrapper />
    </ApolloProvider>
  // </StrictMode>
);

// Componente wrapper para gestionar providers dinámicos async
function DynamicProvidersWrapper() {
  const [tree, setTree] = React.useState(null);
  const [error, setError] = React.useState(null);
  // Usar useRef para tracking que no cause re-renders
  const attemptsRef = React.useRef(0);
  const loadedRef = React.useRef(false);
  
  React.useEffect(() => {
    // Si ya se cargó exitosamente, no hacer nada
    if (loadedRef.current) {
      console.log('[DynamicProvidersWrapper] ⏭️ Ya cargado, saltando...');
      return;
    }
    
    attemptsRef.current += 1;
    console.log('[DynamicProvidersWrapper] 🚀 Montando, intento:', attemptsRef.current);
    
    // Prevenir loops infinitos
    if (attemptsRef.current > 3) {
      console.error('[DynamicProvidersWrapper] 💥 LOOP DETECTADO: Deteniendo después de 3 intentos');
      setError('Error: Demasiados intentos de carga. Revisa la configuración de providers.');
      return;
    }
    
    let active = true;
    buildProviders(<App />)
      .then(node => {
        if (active && !loadedRef.current) {
          console.log('[DynamicProvidersWrapper] ✅ Providers cargados exitosamente');
          loadedRef.current = true;
          setTree(node);
        }
      })
      .catch(err => {
        if (active) {
          console.error('[DynamicProvidersWrapper] ❌ Error cargando providers:', err);
          setError(err.message);
        }
      });
    
    return () => { active = false; };
  }, []); // IMPORTANTE: array vacío para ejecutar solo una vez
  
  if (error) {
    return (
      <div style={{padding: 40, textAlign: 'center', color: '#d00'}}>
        <h2>Error al cargar la aplicación</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Recargar</button>
      </div>
    );
  }
  
  return tree || <div style={{padding:40,textAlign:'center'}}>Inicializando módulos...</div>;
}