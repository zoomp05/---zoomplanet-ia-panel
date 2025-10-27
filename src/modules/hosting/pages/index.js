/**
 * Módulo Hosting - Páginas
 * Exporta todas las páginas del módulo de hosting
 */

// Páginas principales
export { default as Dashboard } from './Dashboard';
export { default as AccountsList } from './AccountsList';
export { default as AccountDetails } from './AccountDetails';
export { default as Plans } from './Plans';
export { default as Resources } from './Resources';

// Páginas de dominios
export { default as DomainsList } from './domains/DomainsList';

// Páginas de billing
export { default as BillingDashboard } from './billing/BillingDashboard';

// Página de plan (existente)
export { default as Plan } from './plan';
