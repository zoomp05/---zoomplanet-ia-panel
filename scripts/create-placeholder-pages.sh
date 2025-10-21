#!/bin/bash

# Script para crear páginas placeholder para los módulos de Migratum
# Uso: bash create-placeholder-pages.sh

BASE_DIR="src/modules"

# Definir módulos y páginas
declare -A MODULES

# Credits
MODULES[credits]="CreditsDashboard CreditsPending CreditsApproved CreditsEvaluation CreditsHistory"

# Housing  
MODULES[housing]="HousingDashboard HousingProperties HousingApplications HousingContracts HousingSupport"

# Immigration
MODULES[immigration]="ImmigrationDashboard ImmigrationApplications ImmigrationDocuments ImmigrationStatus ImmigrationConsultation"

# Banking
MODULES[banking]="BankingDashboard BankingAccounts BankingApplications BankingSupport"

# Reports
MODULES[reports]="ReportsDashboard ReportsFinancial ReportsUsers ReportsActivity"

# Wallet (páginas adicionales)
MODULES[wallet]="WalletTransactions TokenManagement WalletRewards"

# Crear páginas para cada módulo
for module in "${!MODULES[@]}"; do
  echo "📦 Creando módulo: $module"
  
  # Crear directorio del módulo
  mkdir -p "$BASE_DIR/$module/pages"
  
  # Crear cada página del módulo
  for page in ${MODULES[$module]}; do
    page_file="$BASE_DIR/$module/pages/$page.jsx"
    
    # Solo crear si no existe
    if [ ! -f "$page_file" ]; then
      echo "  ✅ Creando: $page.jsx"
      
      # Generar el contenido de la página
      cat > "$page_file" << EOF
import React from 'react';
import { PlaceholderPage } from '@zoom/components';
import { FileTextOutlined } from '@ant-design/icons';

/**
 * $page - Placeholder
 * TODO: Implementar funcionalidad completa
 */
const $page = () => {
  return (
    <PlaceholderPage
      moduleName="${module^}"
      pageName="$page"
      icon={<FileTextOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
    />
  );
};

export default $page;
EOF
    else
      echo "  ⏭️  Omitiendo (ya existe): $page.jsx"
    fi
  done
  
  echo ""
done

echo "✨ ¡Páginas placeholder creadas exitosamente!"