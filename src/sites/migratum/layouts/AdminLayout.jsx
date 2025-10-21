import React from 'react';
import { useNavigate } from 'react-router';

// Importar componentes reutilizables del core
import { AppLayout } from '@zoom/components';

// Importar configuración específica del sitio
import { 
  migratumSidebarConfig, 
  migratumTopMenuConfig, 
  migratumDefaultUser,
  migratumSiteConfig 
} from '../config/menuConfig.jsx';

// Importar componentes específicos del sitio
import MigratumLogo from '../components/MigratumLogo';

/**
 * Layout administrativo para el sitio Migratum
 * Utiliza el AppLayout reutilizable del core con configuración específica del sitio
 * Enfocado en servicios financieros para inmigrantes en Canadá
 */
const AdminLayout = () => {
  const navigate = useNavigate();

  // Handler personalizado para logout
  const handleLogout = () => {
    // TODO: Implementar lógica de logout (limpiar tokens, etc.)
    console.log('Cerrando sesión...');
    navigate('/migratum/auth/login');
  };

  // Procesar configuración del menú superior para agregar handlers
  const processedTopMenuConfig = {
    ...migratumTopMenuConfig,
    items: migratumTopMenuConfig.items.map(item => {
      if (item.action === 'logout') {
        return {
          ...item,
          onClick: handleLogout
        };
      }
      return item;
    })
  };

  // El nuevo AppLayout maneja toda la lógica del menú internamente
  // Solo necesitamos pasar la configuración
  
  // Props opcionales para personalizar el logo:
  // 
  // IMPORTANTE: Diferencia entre logoStyle y logoProps
  // - logoStyle:      Estilos del CONTENEDOR del logo (el div que lo envuelve)
  // - logoProps:      Props que se pasan al COMPONENTE del logo (MigratumLogo)
  // 
  // Ejemplo para cambiar altura del logo:
  // logoProps={{ height: '60px' }}                    ✅ Afecta al logo
  // logoStyle={{ height: '100px' }}                   ❌ Afecta al contenedor, no al logo
  //
  // Otros ejemplos:
  // - sidebarLogoSize="large"                         // Tamaño predefinido: 'small' | 'medium' | 'large'
  // - headerLogoSize="small"                          // Tamaño en header
  // - logoProps={{ height: '50px', width: 'auto' }}  // Altura/ancho del logo
  // - logoStyle={{ padding: '10px' }}                // Padding del contenedor
  // - headerLogoProps={{ height: '30px' }}           // Altura del logo en header

  return (
    <AppLayout
      sidebarMenuConfig={migratumSidebarConfig}
      topMenuConfig={processedTopMenuConfig}
      siteName={migratumSiteConfig.name}
      logo={MigratumLogo}
      logoStyle={{ height: '100px' }}
      logoProps={{ height: 100, width: 'auto' }}
      user={migratumDefaultUser}
      onLogout={handleLogout}
      footerText={migratumSiteConfig.footerText}
    />
  );
};

export default AdminLayout;
