import React from 'react';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  HomeOutlined,
  WalletOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  BankOutlined,
  SolutionOutlined,
} from '@ant-design/icons';

/**
 * Configuración de menús para el sitio Migratum
 * Define la estructura y navegación específica de servicios financieros para inmigrantes
 */

// Configuración del menú lateral principal
export const migratumSidebarConfig = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    url: "/dashboard",
    scope: "site"
  },
  {
    key: "kyc",
    icon: <SafetyCertificateOutlined />,
    label: "KYC y Verificación",
    scope: "site",
    children: [
      { 
        key: "kyc-dashboard", 
        label: "Dashboard KYC", 
        url: "/kyc" 
      },
      { 
        key: "kyc-pending", 
        label: "Pendientes de Revisión", 
        url: "/kyc/pending" 
      },
      { 
        key: "kyc-approved", 
        label: "Aprobados", 
        url: "/kyc/approved" 
      },
      { 
        key: "kyc-rejected", 
        label: "Rechazados", 
        url: "/kyc/rejected" 
      },
      { 
        key: "kyc-documents", 
        label: "Documentos", 
        url: "/kyc/documents" 
      }
    ]
  },
  {
    key: "wallet",
    icon: <WalletOutlined />,
    label: "Wallet y Token",
    scope: "site",
    children: [
      { 
        key: "wallet-dashboard", 
        label: "Dashboard Wallet", 
        url: "/wallet" 
      },
      { 
        key: "wallet-management", 
        label: "Gestión de Wallets", 
        url: "/wallet/management" 
      },
      { 
        key: "wallet-transactions", 
        label: "Transacciones", 
        url: "/wallet/transactions" 
      },
      { 
        key: "wallet-token", 
        label: "Gestión de Token MIG", 
        url: "/wallet/token-management" 
      },
      { 
        key: "wallet-rewards", 
        label: "Recompensas", 
        url: "/wallet/rewards" 
      }
    ]
  },
  {
    key: "credits",
    icon: <CreditCardOutlined />,
    label: "Servicios Crediticios",
    scope: "site",
    children: [
      { 
        key: "credits-dashboard", 
        label: "Dashboard Créditos", 
        url: "/credits" 
      },
      { 
        key: "credits-pending", 
        label: "Solicitudes Pendientes", 
        url: "/credits/pending" 
      },
      { 
        key: "credits-active", 
        label: "Créditos Activos", 
        url: "/credits/approved" 
      },
      { 
        key: "credits-evaluation", 
        label: "Evaluación Crediticia", 
        url: "/credits/evaluation" 
      },
      { 
        key: "credits-history", 
        label: "Historial Crediticio", 
        url: "/credits/history" 
      }
    ]
  },
  {
    key: "housing",
    icon: <HomeOutlined />,
    label: "Servicios de Vivienda",
    scope: "site",
    children: [
      { 
        key: "housing-dashboard", 
        label: "Dashboard Vivienda", 
        url: "/housing" 
      },
      { 
        key: "housing-properties", 
        label: "Propiedades Disponibles", 
        url: "/housing/properties" 
      },
      { 
        key: "housing-applications", 
        label: "Aplicaciones de Renta", 
        url: "/housing/applications" 
      },
      { 
        key: "housing-contracts", 
        label: "Contratos", 
        url: "/housing/contracts" 
      },
      { 
        key: "housing-support", 
        label: "Soporte Habitacional", 
        url: "/housing/support" 
      }
    ]
  },
  {
    key: "immigration",
    icon: <SolutionOutlined />,
    label: "Servicios Migratorios",
    scope: "site",
    children: [
      { 
        key: "immigration-dashboard", 
        label: "Dashboard Migración", 
        url: "/immigration" 
      },
      { 
        key: "immigration-applications", 
        label: "Aplicaciones", 
        url: "/immigration/applications" 
      },
      { 
        key: "immigration-documents", 
        label: "Documentos", 
        url: "/immigration/documents" 
      },
      { 
        key: "immigration-status", 
        label: "Estado de Casos", 
        url: "/immigration/status" 
      },
      { 
        key: "immigration-consultation", 
        label: "Consultas", 
        url: "/immigration/consultation" 
      }
    ]
  },
  {
    key: "banking",
    icon: <BankOutlined />,
    label: "Servicios Bancarios",
    scope: "site",
    children: [
      { 
        key: "banking-dashboard", 
        label: "Dashboard Bancario", 
        url: "/banking" 
      },
      { 
        key: "banking-accounts", 
        label: "Cuentas Bancarias", 
        url: "/banking/accounts" 
      },
      { 
        key: "banking-applications", 
        label: "Aplicaciones", 
        url: "/banking/applications" 
      },
      { 
        key: "banking-support", 
        label: "Soporte Bancario", 
        url: "/banking/support" 
      }
    ]
  },
  {
    key: "reports",
    icon: <FileTextOutlined />,
    label: "Reportes y Analytics",
    scope: "site",
    children: [
      { 
        key: "reports-dashboard", 
        label: "Dashboard Reportes", 
        url: "/reports" 
      },
      { 
        key: "reports-financial", 
        label: "Reportes Financieros", 
        url: "/reports/financial" 
      },
      { 
        key: "reports-users", 
        label: "Reportes de Usuarios", 
        url: "/reports/users" 
      },
      { 
        key: "reports-activity", 
        label: "Actividad del Sistema", 
        url: "/reports/activity" 
      }
    ]
  },
  {
    key: "admin",
    icon: <SettingOutlined />,
    label: "Administración",
    scope: "site",
    children: [
      {
        type: 'group',
        label: 'Gestión de Usuarios',
        children: [
          { 
            key: "admin-users", 
            icon: <TeamOutlined />, 
            label: "Usuarios", 
            url: "/admin/users" 
          },
          { 
            key: "admin-roles", 
            icon: <SafetyCertificateOutlined />, 
            label: "Roles y Permisos", 
            url: "/admin/users/roles" 
          }
        ]
      },
      {
        type: 'group',
        label: 'Configuración del Sistema',
        children: [
          { 
            key: "admin-settings", 
            icon: <SettingOutlined />, 
            label: "Configuración General", 
            url: "/admin/settings" 
          },
          { 
            key: "admin-site-config", 
            label: "Configuración del Sitio", 
            url: "/admin/site-config" 
          }
        ]
      }
    ]
  }
];

// Configuración del menú superior (usuario)
export const migratumTopMenuConfig = {
  items: [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      url: '/admin/account',
      scope: 'site'
    },
    {
      key: 'notifications', 
      icon: <FileTextOutlined />,
      label: 'Notificaciones',
      url: '/admin/notifications',
      scope: 'site'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      url: '/admin/settings',
      scope: 'site'
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
      action: 'logout' // Marcador especial para el logout
    },
  ],
};

// Configuración de usuario por defecto
export const migratumDefaultUser = {
  name: 'Admin Migratum',
  avatar: null,
  role: 'Administrador'
};

// Configuración general del sitio
export const migratumSiteConfig = {
  name: 'MIGRATUM',
  fullName: 'Migratum Financial Services',
  description: 'Servicios Financieros para Inmigrantes en Canadá',
  footerText: `Migratum Financial Services ©${new Date().getFullYear()} - Servicios para Inmigrantes en Canadá`,
  theme: {
    primaryColor: '#1890ff',
    logoHeight: 32
  }
};