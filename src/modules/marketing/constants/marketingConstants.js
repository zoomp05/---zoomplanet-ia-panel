// constants/marketingConstants.js

export const CAMPAIGN_TYPES = {
  AWARENESS: {
    key: 'AWARENESS',
    label: 'Conocimiento de Marca',
    description: 'Campañas para aumentar el reconocimiento de marca',
    icon: 'eye'
  },
  CONSIDERATION: {
    key: 'CONSIDERATION',
    label: 'Consideración',
    description: 'Campañas para generar interés en productos/servicios',
    icon: 'search'
  },
  CONVERSION: {
    key: 'CONVERSION',
    label: 'Conversión',
    description: 'Campañas enfocadas en generar conversiones',
    icon: 'target'
  },
  RETENTION: {
    key: 'RETENTION',
    label: 'Retención',
    description: 'Campañas para mantener y fidelizar clientes',
    icon: 'heart'
  },
  ADVOCACY: {
    key: 'ADVOCACY',
    label: 'Advocacy',
    description: 'Campañas para convertir clientes en defensores de la marca',
    icon: 'users'
  },
  LAUNCH: {
    key: 'LAUNCH',
    label: 'Lanzamiento',
    description: 'Campañas para lanzar nuevos productos o servicios',
    icon: 'rocket'
  },
  SEASONAL: {
    key: 'SEASONAL',
    label: 'Estacional',
    description: 'Campañas vinculadas a temporadas específicas',
    icon: 'calendar'
  },
  PROMOTIONAL: {
    key: 'PROMOTIONAL',
    label: 'Promocional',
    description: 'Campañas promocionales con descuentos y ofertas',
    icon: 'percent'
  },
  BRAND_BUILDING: {
    key: 'BRAND_BUILDING',
    label: 'Construcción de Marca',
    description: 'Campañas para fortalecer la imagen de marca',
    icon: 'award'
  },
  LEAD_GENERATION: {
    key: 'LEAD_GENERATION',
    label: 'Generación de Leads',
    description: 'Campañas enfocadas en capturar leads potenciales',
    icon: 'user-plus'
  }
};

export const CAMPAIGN_STATUS = {
  DRAFT: {
    key: 'DRAFT',
    label: 'Borrador',
    color: 'gray',
    icon: 'edit'
  },
  SCHEDULED: {
    key: 'SCHEDULED',
    label: 'Programada',
    color: 'blue',
    icon: 'clock'
  },
  ACTIVE: {
    key: 'ACTIVE',
    label: 'Activa',
    color: 'green',
    icon: 'play'
  },
  PAUSED: {
    key: 'PAUSED',
    label: 'Pausada',
    color: 'yellow',
    icon: 'pause'
  },
  COMPLETED: {
    key: 'COMPLETED',
    label: 'Completada',
    color: 'green',
    icon: 'check-circle'
  },
  CANCELLED: {
    key: 'CANCELLED',
    label: 'Cancelada',
    color: 'red',
    icon: 'x'
  },
  ARCHIVED: {
    key: 'ARCHIVED',
    label: 'Archivada',
    color: 'gray',
    icon: 'archive'
  },
  DELETED: {
    key: 'DELETED',
    label: 'Eliminada',
    color: 'red',
    icon: 'trash'
  }
};

export const CAMPAIGN_PRIORITY = {
  LOW: {
    key: 'LOW',
    label: 'Baja',
    color: 'gray',
    icon: 'arrow-down'
  },
  MEDIUM: {
    key: 'MEDIUM',
    label: 'Media',
    color: 'yellow',
    icon: 'minus'
  },
  HIGH: {
    key: 'HIGH',
    label: 'Alta',
    color: 'orange',
    icon: 'arrow-up'
  },
  CRITICAL: {
    key: 'CRITICAL',
    label: 'Crítica',
    color: 'red',
    icon: 'alert-triangle'
  }
};

export const MARKETING_CHANNELS = {
  EMAIL: {
    key: 'EMAIL',
    label: 'Email Marketing',
    icon: 'mail'
  },
  SOCIAL_MEDIA: {
    key: 'SOCIAL_MEDIA',
    label: 'Redes Sociales',
    icon: 'share-2'
  },
  GOOGLE_ADS: {
    key: 'GOOGLE_ADS',
    label: 'Google Ads',
    icon: 'search'
  },
  FACEBOOK_ADS: {
    key: 'FACEBOOK_ADS',
    label: 'Facebook Ads',
    icon: 'facebook'
  },
  LINKEDIN_ADS: {
    key: 'LINKEDIN_ADS',
    label: 'LinkedIn Ads',
    icon: 'linkedin'
  },
  CONTENT_MARKETING: {
    key: 'CONTENT_MARKETING',
    label: 'Marketing de Contenido',
    icon: 'file-text'
  },
  SEO: {
    key: 'SEO',
    label: 'SEO',
    icon: 'trending-up'
  },
  WEBINARS: {
    key: 'WEBINARS',
    label: 'Webinars',
    icon: 'video'
  },
  EVENTS: {
    key: 'EVENTS',
    label: 'Eventos',
    icon: 'calendar'
  },
  DIRECT_MAIL: {
    key: 'DIRECT_MAIL',
    label: 'Correo Directo',
    icon: 'mail'
  }
};

export const PRIORITY_LEVELS = {
  LOW: {
    key: 'LOW',
    label: 'Baja',
    color: 'gray',
    value: 1
  },
  MEDIUM: {
    key: 'MEDIUM',
    label: 'Media',
    color: 'yellow',
    value: 2
  },
  HIGH: {
    key: 'HIGH',
    label: 'Alta',
    color: 'orange',
    value: 3
  },
  URGENT: {
    key: 'URGENT',
    label: 'Urgente',
    color: 'red',
    value: 4
  }
};

export const CURRENCIES = {
  USD: { key: 'USD', label: 'Dólar Estadounidense', symbol: '$' },
  EUR: { key: 'EUR', label: 'Euro', symbol: '€' },
  GBP: { key: 'GBP', label: 'Libra Esterlina', symbol: '£' },
  MXN: { key: 'MXN', label: 'Peso Mexicano', symbol: '$' },
  CAD: { key: 'CAD', label: 'Dólar Canadiense', symbol: 'C$' },
  AUD: { key: 'AUD', label: 'Dólar Australiano', symbol: 'A$' }
};

export const KPI_UNITS = {
  PERCENTAGE: { key: 'PERCENTAGE', label: 'Porcentaje', symbol: '%' },
  NUMBER: { key: 'NUMBER', label: 'Número', symbol: '' },
  CURRENCY: { key: 'CURRENCY', label: 'Moneda', symbol: '$' },
  RATE: { key: 'RATE', label: 'Tasa', symbol: '' }
};

export const DEFAULT_KPIS = [
  {
    name: 'Impresiones',
    target: 10000,
    current: 0,
    unit: 'NUMBER'
  },
  {
    name: 'Clicks',
    target: 1000,
    current: 0,
    unit: 'NUMBER'
  },
  {
    name: 'CTR',
    target: 2.5,
    current: 0,
    unit: 'PERCENTAGE'
  },
  {
    name: 'Conversiones',
    target: 100,
    current: 0,
    unit: 'NUMBER'
  },
  {
    name: 'Tasa de Conversión',
    target: 10,
    current: 0,
    unit: 'PERCENTAGE'
  },
  {
    name: 'ROI',
    target: 300,
    current: 0,
    unit: 'PERCENTAGE'
  }
];
