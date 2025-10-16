import React from 'react';
import { HomeOutlined, SettingOutlined, TrophyOutlined, UserOutlined, AppstoreOutlined, SafetyCertificateOutlined, TeamOutlined } from "@ant-design/icons";
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
        key: 'newsletter-admin-group',
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
        key: 'newsletter-config-group',
        label: 'Configuración',
        children: [
          { label: 'Todas las configuraciones', key: 'newsletter:4', url: '/newsletter/Config' },
        ],
      },
    ],
  },
  {
    label: 'Marketing',
    key: 'marketing',
    icon: <TrophyOutlined />,
    scope: "module", // Cambiado de "auto" a "module" para que siempre sea /zoomy/admin/marketing
    children: [
      {
        type: 'group',
        label: 'Campañas IA',
        children: [
          { label: 'Dashboard', key: 'marketing:1', url: '/marketing' },
          { label: 'Campañas Asistidas por IA', key: 'marketing:2', url: '/marketing/campaigns' },
        ],
      },
      {
        type: 'group',
        label: 'Google Ads',
        children: [
          { label: 'Dashboard Google Ads', key: 'googleads:1', url: '/googleAds' },
          { label: 'Campañas', key: 'googleads:2', url: '/googleAds/campaigns' },
          { label: 'Keywords', key: 'googleads:3', url: '/googleAds/keywords' },
          { label: 'Reportes', key: 'googleads:4', url: '/googleAds/reports' },
          { label: 'Sincronizar con Marketing', key: 'googleads:5', url: '/googleAds/sync/marketing-campaigns' },
        ],
      },
      {
        type: 'group',
        label: 'Análisis y Seguimiento',
        children: [
          { label: 'Analytics', key: 'marketing:4', url: '/marketing/analytics' },
          { label: 'CRM & Leads', key: 'marketing:5', url: '/marketing/leads' },
        ],
      },
      {
        type: 'group',
        label: 'Configuración',
        children: [
          { label: 'Configuración Marketing', key: 'marketing:6', url: '/marketing/configuration' },
          { label: 'Configuración Google Ads', key: 'googleads:6', url: '/googleAds/settings' },
        ],
      },
    ],
  },
  /*{
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
  },*/
  // Agrupación de administración de cuentas/usuarios/perfiles/roles/permiso
  {
    label: 'Administración',
    key: 'admin-people',
    icon: <SettingOutlined />,
    scope: 'module', // Prefija /:site/admin
    children: [

      {
        type: 'group',
        key: 'accounts-admin-group',
        label: 'Accounts',
        children: [
          { key: 'accounts', icon: <AppstoreOutlined />, label: 'Cuentas', url: '/account' },
        ],
      },
      {
        type: 'group',
        key: 'access-control-admin-group',
        label: 'Access Control',
        children: [
      { key: 'users', icon: <UserOutlined />, label: 'Usuarios', url: '/users' },
      { key: 'roles', icon: <SafetyCertificateOutlined />, label: 'Roles', url: '/users/roles' },
      { key: 'permissions', icon: <TeamOutlined />, label: 'Permisos', url: '/users/permissions' },
          // { key: 'accounts', icon: <AppstoreOutlined />, label: 'Cuentas', url: '/account' },
        ],
      },
      {
        type: 'group',
        key: 'system-admin-group',
        label: 'Sistema',
        children: [
          { key: 'site-config', icon: <AppstoreOutlined />, label: 'Configuración del Sitio', url: '/site-config' },
        ],
      },
      
    ],
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
    
    // Transformar los items al formato que espera Ant Design Menu
    const transformForAntd = (items, parentKey = '') => {
      return items.map((item, index) => {
        if (!item || typeof item !== 'object') {
          console.warn('Item inválido encontrado:', item);
          return null;
        }
        
        // Generar una key única si no existe
        const itemKey = item.key || `${parentKey}item-${index}`;
        const itemLabel = item.label || `Item ${index}`;
        
        // Validar que key y label no estén vacíos después de la asignación
        if (!itemKey || !itemLabel) {
          console.warn('Item de menú con key o label vacío después de validación:', { 
            original: item, 
            key: itemKey, 
            label: itemLabel 
          });
          return null;
        }
        
        console.log(`Transformando item: ${itemKey} - ${itemLabel}`);
        
        const transformedItem = {
          key: String(itemKey),
          label: String(itemLabel),
          icon: item.icon || null,
          // Preservar la URL para la navegación
          url: item.url || null,
        };
        
        // Si tiene children, transformarlos recursivamente
        if (item.children && Array.isArray(item.children)) {
          const transformedChildren = transformForAntd(item.children, `${itemKey}-`);
          if (transformedChildren.length > 0) {
            transformedItem.children = transformedChildren;
          }
        }
        
        // Si es un grupo
        if (item.type === 'group') {
          transformedItem.type = 'group';
          if (item.children) {
            const transformedChildren = transformForAntd(item.children, `${itemKey}-`);
            if (transformedChildren.length > 0) {
              transformedItem.children = transformedChildren;
            }
          }
        }
        
        return transformedItem;
      }).filter(Boolean);
    };
    
    normalizedMenuItems = transformForAntd(normalizedMenuItems);
    
  } catch (error) {
    console.error('Error al normalizar items del menú:', error);
    // Usar una configuración de menú de fallback con formato correcto para Ant Design
    normalizedMenuItems = [
      {
        key: "home",
        label: "Home",
        icon: null
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
