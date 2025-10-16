// src/zoom/bootstrap/loadProviders.jsx
// Carga dinámica y composición de providers declarados en appConfig.

import React from 'react';
import { appConfig } from '../appConfig';

export async function buildProviders(children) {
  console.info('[bootstrap] 🚀 Iniciando buildProviders...');
  
  const providerEntries = [];
  const authProvPath = appConfig.modules?.auth?.provider;
  
  if (!authProvPath) {
    console.warn('[bootstrap] ⚠️ No hay authProvPath configurado en appConfig');
    return children; // Sin providers, devolver children directamente
  }
  
  console.info('[bootstrap] Intentando cargar AuthProvider desde:', authProvPath);
  
  const candidatePaths = [
    `../../${authProvPath}`,
    authProvPath.endsWith('.jsx') ? `../../${authProvPath.replace(/\.jsx$/, '.js')}` : null,
    authProvPath.endsWith('.js') ? `../../${authProvPath.replace(/\.js$/, '.jsx')}` : null,
    `../../${authProvPath.replace(/\.jsx?$/, '')}.jsx`,
    `../../${authProvPath.replace(/\.jsx?$/, '')}.js`
  ].filter(Boolean);
  
  let loaded = false;
  let lastError = null;
  
  for (const p of candidatePaths) {
    try {
      console.info(`[bootstrap] 🔍 Probando ruta: ${p}`);
      const mod = await import(/* @vite-ignore */ p);
      const Provider = mod.AuthProvider || mod.default || Object.values(mod)[0];
      if (Provider) {
        console.info(`[bootstrap] ✅ AuthProvider cargado desde: ${p}`);
        providerEntries.push(Provider);
        loaded = true;
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[bootstrap] ❌ Falló carga desde ${p}:`, err.message);
    }
  }
  
  if (!loaded) {
    console.error('[bootstrap] 💥 FALLO FATAL: No se pudo cargar AuthProvider');
    console.error('[bootstrap] Última error:', lastError);
    console.error('[bootstrap] authProvPath configurado:', authProvPath);
    console.error('[bootstrap] Rutas intentadas:', candidatePaths);
    // NO devolver un elemento de error que cause re-render infinito
    // Devolver children directamente para permitir que la app continúe
    return children;
  }
  
  console.info('[bootstrap] 🎉 Providers cargados:', providerEntries.length);
  return providerEntries.reduceRight((acc, Prov) => React.createElement(Prov, null, acc), children);
}

// Utility opcional para montar App con providers (no usado actualmente)
export async function mountApp(AppComponent) {
  return buildProviders(React.createElement(AppComponent));
}
