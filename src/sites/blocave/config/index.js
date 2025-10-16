import { authConfig } from './authConfig';

// Configuraciones centralizadas del sitio Blocave
export const siteConfig = {
  siteName: 'blocave',
  displayName: 'Blocave',
  description: 'Sistema de gestión Blocave',
  
  // Configuración de autenticación
  auth: authConfig,
  
  // Configuración de tema/apariencia
  theme: {
    primaryColor: '#34495e',
    backgroundColor: '#2c3e50',
    textColor: '#ecf0f1'
  },
  
  // Configuración de características habilitadas
  features: {
    contentManagement: true,
    userModeration: true,
    systemAdmin: true,
    reporting: true
  },
  
  // URLs y endpoints específicos
  api: {
    baseUrl: import.meta.env.VITE_BLOCAVE_API_URL || '/api/blocave',
    graphqlEndpoint: '/graphql'
  }
};

export default siteConfig;
