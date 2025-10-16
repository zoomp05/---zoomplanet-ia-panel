import React, { createContext, useContext } from 'react';

const SiteContext = createContext({
  siteName: 'zoomy',
  siteConfig: null,
  authConfig: null
});

export const SiteProvider = ({ children, siteName = 'zoomy', siteConfig = null }) => {
  // Extraer la configuración de auth del siteConfig
  const authConfig = siteConfig?.auth || null;
  
  return (
    <SiteContext.Provider value={{ siteName, siteConfig, authConfig }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite debe usarse dentro de SiteProvider');
  }
  return context;
};

export default SiteContext;
