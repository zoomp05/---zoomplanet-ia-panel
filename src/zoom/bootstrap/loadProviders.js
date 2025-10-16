// src/zoom/bootstrap/loadProviders.js
// Carga dinámica y composición de providers declarados en appConfig.

import React from 'react';
import { appConfig } from '../appConfig';

/**
 * Crea un árbol de providers dinámicamente alrededor de un nodo base.
 * Cada provider se importa por ruta relativa (ESM) y se compone.
 * @param {React.ReactNode} children
 * @returns {Promise<React.ReactNode>}
 */
export async function buildProviders(children) {
  const providerEntries = [];

  // Auth provider (si definido)
  const authProvPath = appConfig.modules?.auth?.provider;
  if (authProvPath) {
    const candidatePaths = [
      `../../${authProvPath}`,
      authProvPath.endsWith('.jsx') ? `../../${authProvPath.replace(/\.jsx$/, '.js')}` : null,
      authProvPath.endsWith('.js') ? `../../${authProvPath.replace(/\.js$/, '.jsx')}` : null,
      `../../${authProvPath.replace(/\.jsx?$/, '')}.jsx`,
      `../../${authProvPath.replace(/\.jsx?$/, '')}.js`
    ].filter(Boolean);
    let loaded = false;
    for (const p of candidatePaths) {
      try {
        const mod = await import(/* @vite-ignore */ p);
        const Provider = mod.AuthProvider || mod.default || Object.values(mod)[0];
        if (Provider) {
          console.info('[bootstrap] AuthProvider cargado dinámicamente desde', p);
          providerEntries.push(Provider);
          loaded = true;
          break;
        }
      } catch (e) {
        // intento fallido; continuar
      }
    }
    if (!loaded) {
      console.error('[bootstrap] Fallo al cargar AuthProvider. Revisa appConfig.modules.auth.provider =', authProvPath);
    }
  }

  // Aquí se pueden añadir más providers (theme, i18n, featureFlags) leyendo appConfig

  // Compose (reduceRight) providers
  if (providerEntries.length === 0) {
    // Si no se cargó AuthProvider no devolvemos App directamente para evitar errores useAuth sin provider
    console.error('[bootstrap] NO PROVIDERS -> Bloqueando render de App para evitar errores de contexto');
    return React.createElement('div', { style:{padding:40, color:'#b00', fontFamily:'sans-serif'} }, 'Error: No se pudo cargar AuthProvider.');
  }
  console.info('[bootstrap] Providers aplicados en orden (interno→externo):', providerEntries.map(p => p.name||'AnonymousProvider'));
  return providerEntries.reduceRight((acc, Prov) => React.createElement(Prov, null, acc), children);
}

// Utility opcional para montar App con providers (no usado actualmente)
export async function mountApp(AppComponent) {
  return buildProviders(React.createElement(AppComponent));
}
