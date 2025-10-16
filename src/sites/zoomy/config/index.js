import { authConfig } from './authConfig';

// Configuraciones centralizadas del sitio Zoomy
export const siteConfig = {
  siteName: 'zoomy',
  displayName: 'Zoomy',
  description: 'Panel de administración de Zoomy',
  
  // Configuración de autenticación
  auth: authConfig,
  
  // Configuración de tema/apariencia
  theme: {
    primaryColor: '#1890ff',
    backgroundColor: '#001529',
    textColor: '#ffffff'
  },
  
  // Configuración de características habilitadas
  features: {
    analytics: true,
    campaigns: true,
    userManagement: true,
    reports: true
  },
  
  // URLs y endpoints específicos
  api: {
    baseUrl: import.meta.env.VITE_ZOOMY_API_URL || '/api/zoomy',
    graphqlEndpoint: '/graphql'
  }
};

export default siteConfig;
