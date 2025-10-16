import React from 'react';
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import { useMenuNormalizer } from '@hooks/useMenuNormalizer';
import Menu from "@components/Menu/Menu";
import Logo from "@components/Logo/Logo";
import "./ContextualHeader.css";

/**
 * Configuración base del menú (independiente del contexto)
 * Puedes usar diferentes scopes para cada item:
 * - 'site': /zoomy + url
 * - 'module': /zoomy/admin + url  
 * - 'submodule': /zoomy/admin/project + url
 * - 'absolute': url tal como está
 * - 'auto': detecta automáticamente
 */
const baseMenuConfig = [
  { 
    key: "home", 
    icon: <HomeOutlined />, 
    url: "/", 
    label: "Home",
    scope: "site" // Siempre ir al home del sitio
  },
  { 
    key: "projects", 
    label: "Proyectos", 
    url: "/project",
    scope: "auto" // Se adaptará al contexto actual
  },
  { 
    key: "products", 
    label: "Productos", 
    url: "/products/list",
    scope: "site" // Productos están a nivel de sitio
  },
  {
    label: 'Flow',
    key: 'flow',
    icon: <SettingOutlined />,
    scope: "site",
    children: [
      {
        key: 'flowList',
        label: 'Flow List',
        url: '/flows',
      }
    ],
  },
  {
    label: 'Newsletter',
    key: 'newsletter',
    icon: <SettingOutlined />,
    scope: "auto", // Cambiado de "site" a "auto" para que se adapte al contexto
    children: [
      {
        type: 'group',
        label: 'Administrar',
        children: [
          { label: 'Campañas', key: 'newsletter:2', url: '/newsletter/campaigns' },
          { label: 'Newsletters', key: 'newsletter:1', url: '/newsletter' },
          { label: 'Logs de Email', key: 'newsletter:3', url: '/newsletter/emailLogs' },
          { label: 'Contactos', key: 'newsletter:5', url: '/newsletter/contacts' },
          { label: 'Grupos de Contactos', key: 'newsletter:6', url: '/newsletter/contactGroup' },
        ],
      },
      {
        type: 'group',
        label: 'Configuración',
        children: [
          { label: 'Todas las configuraciones', key: 'newsletter:4', url: '/newsletter/Config' },
        ],
      },
    ],
  },
  {
    label: 'Editor',
    key: 'editor',
    icon: <SettingOutlined />,
    scope: "site",
    children: [
      {
        key: 'visualeditor',
        label: 'Editor Visual',
        url: '/visualeditor',
      },
    ],
  },
  { 
    key: "accounts", 
    label: "Cuentas", 
    url: "/accounts/list",
    scope: "site"
  },
  { 
    key: "users", 
    label: "Usuarios", 
    url: "/admin/users",
    scope: "site" // Los usuarios están en el admin del sitio
  },
  { 
    key: "roles", 
    label: "Roles", 
    url: "/admin/users/roles",
    scope: "site"
  },
  { 
    key: "permissions", 
    label: "Permisos", 
    url: "/admin/users/permissions",
    scope: "site"
  },
];

export default function ContextualHeader() {
  const { normalizeMenuItems, routeContext } = useMenuNormalizer();
  
  // Normalizar las rutas del menú según el contexto actual
  let normalizedMenuItems = [];
  
  try {
    normalizedMenuItems = normalizeMenuItems(baseMenuConfig);
    
    // Debug: mostrar contexto actual en desarrollo
    console.log('Contexto actual de ruta:', routeContext);
    console.log('Items de menú normalizados:', normalizedMenuItems);
    
    // Validación adicional para asegurar que todos los items son válidos
    const validItems = normalizedMenuItems.filter(item => {
      if (!item || typeof item.key !== 'string' || typeof item.label !== 'string') {
        console.warn('Item de menú inválido filtrado:', item);
        return false;
      }
      return true;
    });
    
    normalizedMenuItems = validItems;
    
  } catch (error) {
    console.error('Error al normalizar items del menú:', error);
    // Usar una configuración de menú de fallback
    normalizedMenuItems = [
      {
        key: "home",
        label: "Home",
        url: "/"
      }
    ];
  }

  return (
    <>
          <Logo />
          <Menu
            defaultItem="home"
            items={normalizedMenuItems}
            
          />
     </>
  );
}
