#!/bin/bash

# Script optimizado para desarrollo con hot reload en Docker
echo "🚀 Iniciando ZoomPlanet Panel con hot reload optimizado..."

# Verificar si node_modules ya existe para evitar reinstalación innecesaria
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Instalando dependencias..."
    npm ci --silent
else
    echo "📦 Dependencias ya instaladas, omitiendo npm install..."
fi

# Configurar variables de entorno para polling optimizado
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=500
export VITE_LEGACY_WATCH=true

# Iniciar Vite con configuración optimizada para Docker
echo "🔥 Iniciando servidor de desarrollo con polling rápido (500ms)..."
npm run dev:polling
