import React from 'react';
import { 
  PlusOutlined, 
  DownloadOutlined, 
  FilterOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

/**
 * Configuración de acciones contextuales para el sitio Migratum
 * Define las acciones disponibles en cada módulo/página
 * 
 * Este archivo centraliza la lógica de qué acciones se muestran según la ruta
 */

/**
 * Obtiene las acciones contextuales para una ruta específica
 * 
 * @param {string} pathname - Ruta actual
 * @returns {Array} Array de objetos de acción con key, icon, label, type, etc.
 */
export const getContextualActions = (pathname) => {
  // Dashboard
  if (pathname.endsWith('/dashboard')) {
    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Actualizar',
        type: 'default'
      },
      {
        key: 'export',
        icon: <DownloadOutlined />,
        label: 'Exportar',
        type: 'default'
      }
    ];
  }

  // KYC
  if (pathname.includes('/kyc')) {
    if (pathname.includes('/pending')) {
      return [
        {
          key: 'refresh',
          icon: <ReloadOutlined />,
          label: 'Actualizar',
          type: 'default'
        },
        {
          key: 'approve',
          icon: <CheckOutlined />,
          label: 'Aprobar Seleccionados',
          type: 'primary'
        },
        {
          key: 'reject',
          icon: <CloseOutlined />,
          label: 'Rechazar',
          type: 'default',
          danger: true
        }
      ];
    }
    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Actualizar',
        type: 'default'
      },
      {
        key: 'filter',
        icon: <FilterOutlined />,
        label: 'Filtrar',
        type: 'default'
      },
      {
        key: 'export',
        icon: <DownloadOutlined />,
        label: 'Exportar',
        type: 'default'
      }
    ];
  }
  
  // Wallet
  if (pathname.includes('/wallet')) {
    if (pathname.includes('/management')) {
      return [
        {
          key: 'refresh',
          icon: <ReloadOutlined />,
          label: 'Actualizar',
          type: 'default'
        },
        {
          key: 'new-wallet',
          icon: <PlusOutlined />,
          label: 'Nueva Wallet',
          type: 'primary'
        },
        {
          key: 'export',
          icon: <DownloadOutlined />,
          label: 'Exportar',
          type: 'default'
        }
      ];
    }
    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Actualizar',
        type: 'default'
      },
      {
        key: 'export',
        icon: <DownloadOutlined />,
        label: 'Exportar',
        type: 'default'
      }
    ];
  }
  
  // Créditos
  if (pathname.includes('/credits')) {
    if (pathname.includes('/pending')) {
      return [
        {
          key: 'refresh',
          icon: <ReloadOutlined />,
          label: 'Actualizar',
          type: 'default'
        },
        {
          key: 'evaluate',
          icon: <FileTextOutlined />,
          label: 'Evaluar Solicitud',
          type: 'primary'
        },
        {
          key: 'filter',
          icon: <FilterOutlined />,
          label: 'Filtrar',
          type: 'default'
        }
      ];
    }
    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Actualizar',
        type: 'default'
      },
      {
        key: 'new-application',
        icon: <PlusOutlined />,
        label: 'Nueva Solicitud',
        type: 'primary'
      },
      {
        key: 'filter',
        icon: <FilterOutlined />,
        label: 'Filtrar',
        type: 'default'
      }
    ];
  }
  
  // Vivienda
  if (pathname.includes('/housing')) {
    if (pathname.includes('/properties')) {
      return [
        {
          key: 'refresh',
          icon: <ReloadOutlined />,
          label: 'Actualizar',
          type: 'default'
        },
        {
          key: 'new-property',
          icon: <PlusOutlined />,
          label: 'Nueva Propiedad',
          type: 'primary'
        },
        {
          key: 'filter',
          icon: <FilterOutlined />,
          label: 'Filtrar',
          type: 'default'
        }
      ];
    }
    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Actualizar',
        type: 'default'
      }
    ];
  }
  
  // Servicios Migratorios
  if (pathname.includes('/immigration')) {
    if (pathname.includes('/applications')) {
      return [
        {
          key: 'refresh',
          icon: <ReloadOutlined />,
          label: 'Actualizar',
          type: 'default'
        },
        {
          key: 'new-application',
          icon: <PlusOutlined />,
          label: 'Nueva Aplicación',
          type: 'primary'
        },
        {
          key: 'filter',
          icon: <FilterOutlined />,
          label: 'Filtrar',
          type: 'default'
        }
      ];
    }
    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Actualizar',
        type: 'default'
      }
    ];
  }
  
  // Servicios Bancarios
  if (pathname.includes('/banking')) {
    if (pathname.includes('/applications')) {
      return [
        {
          key: 'refresh',
          icon: <ReloadOutlined />,
          label: 'Actualizar',
          type: 'default'
        },
        {
          key: 'new-application',
          icon: <PlusOutlined />,
          label: 'Nueva Aplicación',
          type: 'primary'
        }
      ];
    }
    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Actualizar',
        type: 'default'
      }
    ];
  }
  
  // Reportes
  if (pathname.includes('/reports')) {
    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Actualizar',
        type: 'default'
      },
      {
        key: 'generate',
        icon: <FileTextOutlined />,
        label: 'Generar Reporte',
        type: 'primary'
      },
      {
        key: 'export',
        icon: <DownloadOutlined />,
        label: 'Exportar',
        type: 'default'
      }
    ];
  }
  
  // Administración
  if (pathname.includes('/admin')) {
    if (pathname.includes('/users')) {
      return [
        {
          key: 'refresh',
          icon: <ReloadOutlined />,
          label: 'Actualizar',
          type: 'default'
        },
        {
          key: 'new-user',
          icon: <PlusOutlined />,
          label: 'Nuevo Usuario',
          type: 'primary'
        },
        {
          key: 'filter',
          icon: <FilterOutlined />,
          label: 'Filtrar',
          type: 'default'
        }
      ];
    }
    return [
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Actualizar',
        type: 'default'
      }
    ];
  }
  
  // Acciones por defecto
  return [
    {
      key: 'refresh',
      icon: <ReloadOutlined />,
      label: 'Actualizar',
      type: 'default'
    }
  ];
};

/**
 * Handler genérico para acciones contextuales
 * Puede ser sobrescrito por componentes específicos
 * 
 * @param {Object} action - Objeto de acción que fue clickeado
 * @param {Object} context - Contexto adicional (pathname, data, etc.)
 */
export const handleContextualAction = (action, context = {}) => {
  console.log('Acción ejecutada:', action.key, context);
  
  switch (action.key) {
    case 'refresh':
      window.location.reload();
      break;
    case 'export':
      console.log('Exportando datos...');
      // Implementar lógica de exportación
      break;
    case 'filter':
      console.log('Abriendo panel de filtros...');
      // Implementar lógica de filtros
      break;
    default:
      console.log('Acción no implementada:', action.key);
  }
};
