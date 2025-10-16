// Configuración de navegación para módulo CRM unificando Marketing y Newsletter
import { DashboardOutlined, MailOutlined, BarChartOutlined } from '@ant-design/icons';

export const navigationConfig = {
  mainMenu: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: DashboardOutlined,
      path: '',
      description: 'Resumen CRM'
    },
    {
      key: 'leads',
      label: 'Leads',
      icon: DashboardOutlined,
      path: 'leads',
      children: [
        { key: 'leads-list', label: 'Listado', path: 'leads' },
        { key: 'leads-kanban', label: 'Pipeline', path: 'leads/pipeline' }
      ]
    },
    {
      key: 'marketing',
      label: 'Marketing',
      icon: BarChartOutlined,
      path: 'marketing',
      children: [
        { key: 'marketing-campaigns', label: 'Campañas', path: 'marketing/campaigns' },
        { key: 'marketing-create', label: 'Nueva Campaña', path: 'marketing/campaigns/create' },
        { key: 'marketing-ai', label: 'Campañas IA', path: 'marketing/ai-campaigns' },
        { key: 'marketing-analytics', label: 'Analytics', path: 'marketing/analytics' }
      ]
    },
    {
      key: 'newsletter',
      label: 'Newsletter',
      icon: MailOutlined,
      path: 'newsletter',
      children: [
        { key: 'newsletter-campaigns', label: 'Campañas', path: 'newsletter/campaigns' },
        { key: 'newsletter-home', label: 'Newsletters', path: 'newsletter' },
        { key: 'newsletter-create', label: 'Crear Newsletter', path: 'newsletter/create' },
        { key: 'newsletter-contacts', label: 'Contactos', path: 'newsletter/contacts' },
        { key: 'newsletter-contacts-groups', label: 'Grupos de Contactos', path: 'newsletter/contactGroup' }
      ]
    }
  ]
};

export default navigationConfig;
