import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definición de módulos y páginas
const modules = {
  credits: {
    pages: [
      { name: 'CreditsApproved', title: 'Créditos Activos', icon: 'CheckCircleOutlined', color: '#52c41a' },
      { name: 'CreditsEvaluation', title: 'Evaluación Crediticia', icon: 'FileSearchOutlined', color: '#1890ff' },
      { name: 'CreditsHistory', title: 'Historial Crediticio', icon: 'HistoryOutlined', color: '#722ed1' }
    ]
  },
  housing: {
    pages: [
      { name: 'HousingDashboard', title: 'Dashboard Vivienda', icon: 'HomeOutlined', color: '#1890ff' },
      { name: 'HousingProperties', title: 'Propiedades', icon: 'BankOutlined', color: '#13c2c2' },
      { name: 'HousingApplications', title: 'Aplicaciones', icon: 'FileTextOutlined', color: '#faad14' },
      { name: 'HousingContracts', title: 'Contratos', icon: 'FileDoneOutlined', color: '#52c41a' },
      { name: 'HousingSupport', title: 'Soporte', icon: 'CustomerServiceOutlined', color: '#722ed1' }
    ]
  },
  immigration: {
    pages: [
      { name: 'ImmigrationDashboard', title: 'Dashboard Migración', icon: 'GlobalOutlined', color: '#1890ff' },
      { name: 'ImmigrationApplications', title: 'Aplicaciones', icon: 'FormOutlined', color: '#faad14' },
      { name: 'ImmigrationDocuments', title: 'Documentos', icon: 'FileProtectOutlined', color: '#13c2c2' },
      { name: 'ImmigrationStatus', title: 'Estado de Casos', icon: 'CheckCircleOutlined', color: '#52c41a' },
      { name: 'ImmigrationConsultation', title: 'Consultas', icon: 'MessageOutlined', color: '#722ed1' }
    ]
  },
  banking: {
    pages: [
      { name: 'BankingDashboard', title: 'Dashboard Bancario', icon: 'BankOutlined', color: '#1890ff' },
      { name: 'BankingAccounts', title: 'Cuentas Bancarias', icon: 'CreditCardOutlined', color: '#13c2c2' },
      { name: 'BankingApplications', title: 'Aplicaciones', icon: 'FormOutlined', color: '#faad14' },
      { name: 'BankingSupport', title: 'Soporte Bancario', icon: 'CustomerServiceOutlined', color: '#722ed1' }
    ]
  },
  reports: {
    pages: [
      { name: 'ReportsDashboard', title: 'Dashboard Reportes', icon: 'BarChartOutlined', color: '#1890ff' },
      { name: 'ReportsFinancial', title: 'Reportes Financieros', icon: 'DollarOutlined', color: '#52c41a' },
      { name: 'ReportsUsers', title: 'Reportes de Usuarios', icon: 'TeamOutlined', color: '#13c2c2' },
      { name: 'ReportsActivity', title: 'Actividad del Sistema', icon: 'LineChartOutlined', color: '#722ed1' }
    ]
  },
  wallet: {
    pages: [
      { name: 'WalletTransactions', title: 'Transacciones', icon: 'SwapOutlined', color: '#13c2c2' },
      { name: 'TokenManagement', title: 'Gestión de Token', icon: 'DollarCircleOutlined', color: '#faad14' },
      { name: 'WalletRewards', title: 'Recompensas', icon: 'TrophyOutlined', color: '#faad14' }
    ]
  }
};

const baseDir = path.join(__dirname, '../src/modules');

// Generar cada página
Object.keys(modules).forEach(moduleName => {
  const moduleData = modules[moduleName];
  const moduleDir = path.join(baseDir, moduleName, 'pages');
  
  // Crear directorio si no existe
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true });
  }
  
  moduleData.pages.forEach(page => {
    const filePath = path.join(moduleDir, `${page.name}.jsx`);
    
    // Solo crear si no existe
    if (!fs.existsSync(filePath)) {
      const content = `import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { ${page.icon} } from '@ant-design/icons';

/**
 * ${page.name} - Placeholder
 * Módulo: ${moduleName}
 * TODO: Implementar funcionalidad completa
 */
const ${page.name} = () => {
  return (
    <PlaceholderPage
      moduleName="${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}"
      pageName="${page.title}"
      icon={<${page.icon} style={{ fontSize: 64, color: '${page.color}' }} />}
    />
  );
};

export default ${page.name};
`;
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Creado: ${moduleName}/${page.name}.jsx`);
    } else {
      console.log(`⏭️  Ya existe: ${moduleName}/${page.name}.jsx`);
    }
  });
});

console.log('\\n✨ ¡Páginas placeholder creadas exitosamente!');
