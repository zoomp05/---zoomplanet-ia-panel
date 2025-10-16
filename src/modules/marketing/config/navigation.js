// src/modules/marketing/config/navigation.js
import {
  BulbOutlined,
  RobotOutlined,
  BarChartOutlined,
  PlusOutlined,
  EyeOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

/**
 * Configuración de navegación para el módulo de marketing
 */
export const navigationConfig = {
  // Menú principal
  mainMenu: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: DashboardOutlined,
      path: '',
      description: 'Vista general del módulo'
    },
    {
      key: 'newsletter',
      label: 'Newsletter',
      icon: BarChartOutlined,
      path: 'newsletter',
      description: 'Gestión de newsletters y grupos de contacto',
      children: [
        {
          key: 'contactGroup',
          label: 'Contact Groups',
          icon: TeamOutlined,
          path: 'newsletter/contactGroup'
        }
      ]
    },
    {
      key: 'campaigns',
      label: 'Campañas',
      icon: BulbOutlined,
      path: 'campaigns',
      description: 'Gestión de campañas tradicionales',
      children: [
        {
          key: 'campaigns-list',
          label: 'Ver Campañas',
          icon: EyeOutlined,
          path: 'campaigns'
        },
        {
          key: 'campaigns-create',
          label: 'Nueva Campaña',
          icon: PlusOutlined,
          path: 'campaigns/create'
        }
      ]
    },
    {
      key: 'ai-campaigns',
      label: 'Campañas IA',
      icon: RobotOutlined,
      path: 'ai-campaigns',
      description: 'Campañas generadas con Inteligencia Artificial',
      highlight: true,
      children: [
        {
          key: 'ai-dashboard',
          label: 'Dashboard IA',
          icon: DashboardOutlined,
          path: 'ai-campaigns'
        },
        {
          key: 'ai-create',
          label: 'Crear con IA',
          icon: PlusOutlined,
          path: 'campaigns/create-ai'
        },
        {
          key: 'ai-analytics',
          label: 'Analytics IA',
          icon: BarChartOutlined,
          path: 'ai-analytics'
        }
      ]
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: BarChartOutlined,
      path: 'analytics',
      description: 'Análisis y métricas generales'
    }
  ],

  // Acciones rápidas
  quickActions: [
    {
      key: 'create-traditional',
      label: 'Nueva Campaña',
      icon: PlusOutlined,
      path: 'campaigns/create',
      type: 'primary',
      color: '#52c41a'
    },
    {
      key: 'create-ai',
      label: 'Crear con IA',
      icon: RobotOutlined,
      path: 'campaigns/create-ai',
      type: 'primary',
      color: '#1890ff',
      highlight: true
    },
    {
      key: 'view-campaigns',
      label: 'Ver Campañas',
      icon: EyeOutlined,
      path: 'campaigns',
      type: 'default'
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: BarChartOutlined,
      path: 'analytics',
      type: 'default'
    }
  ],

  // Secciones de IA
  aiSections: [
    {
      key: 'ai-create',
      title: 'Crear con IA',
      description: 'Genera campañas completas automáticamente',
      icon: BulbOutlined,
      path: 'campaigns/create-ai',
      color: '#52c41a',
      features: [
        'Generación de brief automática',
        'Objetivos inteligentes',
        'Estrategias personalizadas',
        'Ideas de contenido'
      ]
    },
    {
      key: 'ai-workflow',
      title: 'Workflow IA',
      description: 'Proceso paso a paso con asistencia de IA',
      icon: PlayCircleOutlined,
      path: 'ai-campaigns',
      color: '#1890ff',
      features: [
        'Seguimiento en tiempo real',
        'Validación automática',
        'Mejoras sugeridas',
        'Control de calidad'
      ]
    },
    {
      key: 'ai-analytics',
      title: 'Analytics IA',
      description: 'Métricas de generación con IA',
      icon: BarChartOutlined,
      path: 'ai-analytics',
      color: '#faad14',
      features: [
        'Costos de generación',
        'Calidad de contenido',
        'Tiempo de procesamiento',
        'Tendencias de uso'
      ]
    },
    {
      key: 'ai-optimization',
      title: 'Mejora Automática',
      description: 'Optimización continua con IA',
      icon: ThunderboltOutlined,
      path: '#', // Próximamente
      color: '#722ed1',
      disabled: true,
      features: [
        'Análisis de rendimiento',
        'Sugerencias automáticas',
        'A/B testing inteligente',
        'Optimización en tiempo real'
      ]
    }
  ],

  // Breadcrumbs mapping
  breadcrumbsMap: {
    '': 'Marketing',
    'campaigns': 'Campañas',
    'campaigns/create': 'Nueva Campaña',
    'campaigns/create-ai': 'Crear con IA',
    'ai-campaigns': 'Dashboard IA',
    'ai-analytics': 'Analytics IA',
    'analytics': 'Analytics'
  }
};

export default navigationConfig;
