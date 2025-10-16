// src/zoom/routing/systemLoaderCore.js
import { createBrowserRouter } from 'react-router';
import { appConfig } from '../appConfig.js';
import React from 'react';
import { policyProcessor } from '../security/policyProcessor.js';
// Import actualizado al nuevo registro centralizado (mantenemos shim temporalmente)
import { clearAllRoutes } from '../routing/routesRegistry';

// (processRoutes import no longer needed directly here if dynamicRoutes handles it)

const loadedSites = {};
const loadedModules = {};
const siteConfigs = {};

export const getAvailableSites = async () => {
  try {
    const siteModules = {
      ...import.meta.glob('../../sites/*/index.js'),
      ...import.meta.glob('../../sites/*/index.jsx'),
    };
    const siteNames = Object.keys(siteModules)
      .map(path => {
        const match = path.match(/\.\/\.\.\/sites\/([^\/]+)\/index\.(?:jsx?|js)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    console.log('[systemLoader] Sitios detectados:', siteNames);
    return siteNames;
  } catch (error) {
    console.error('[systemLoader] Error detectando sitios:', error);
    return ['zoomy'];
  }
};

export const detectCurrentSite = async () => {
  const path = window.location.pathname || '/';
  try {
    if (import.meta.env && import.meta.env.DEV) {
      const availableSites = await getAvailableSites();
      const ordered = [...availableSites].sort((a,b) => b.length - a.length);
      for (const s of ordered) {
        if (path === `/${s}` || path.startsWith(`/${s}/`)) return s;
      }
  return appConfig.sites?.enabled?.[0] || availableSites[0] || 'zoomy';
    }
  return appConfig.sites?.enabled?.[0] || 'zoomy';
  } catch {
  return appConfig.sites?.enabled?.[0] || 'zoomy';
  }
};

export const getSiteConfig = (siteName) => siteConfigs[siteName] || null;

async function loadSite(siteName) {
  if (loadedSites[siteName]) return loadedSites[siteName];
  let siteModule;
  try {
    siteModule = (await import(/* @vite-ignore */ `../../sites/${siteName}/index.js`)).default;
  } catch (e1) {
    try { siteModule = (await import(/* @vite-ignore */ `../../sites/${siteName}/index.jsx`)).default; } catch (e2) { console.error('[systemLoader] No se pudo cargar sitio', siteName, e1, e2); return null; }
  }
  siteModule?.install?.();
  if (siteModule?.config) {
    siteConfigs[siteName] = siteModule.config;
    if (siteModule.config?.auth) policyProcessor.registerSiteAuthConfig(siteName, siteModule.config.auth);
  }
  loadedSites[siteName] = siteModule;
  return siteModule;
}

async function loadModuleForSite(moduleName, siteName, inheritedLayouts = {}, parentModule = null) {
  const cacheKey = `${siteName}::${parentModule ? parentModule + '>' : ''}${moduleName}`;
  if (loadedModules[cacheKey]) return loadedModules[cacheKey];
  let moduleDef;
  try {
    moduleDef = (await import(/* @vite-ignore */ `../../modules/${moduleName}/index.js`)).default;
  } catch (e1) {
    try { moduleDef = (await import(/* @vite-ignore */ `../../modules/${moduleName}/index.jsx`)).default; } catch (e2) { console.error('[systemLoader] No se pudo cargar módulo', moduleName, e1, e2); return null; }
  }
  try {
    const modConfigImport = await import(/* @vite-ignore */ `../../modules/${moduleName}/config/authConfig.js`);
    const modConfig = modConfigImport?.default || Object.values(modConfigImport)[0];
    if (modConfig && typeof modConfig === 'object') {
      if (!modConfig.moduleName) modConfig.moduleName = moduleName;
      if (!policyProcessor.moduleConfigs.has(modConfig.moduleName)) policyProcessor.registerModule(modConfig);
      // Registrar jerarquía
      policyProcessor.registerModuleHierarchy(siteName, modConfig.moduleName, modConfig, parentModule);
    }
  } catch {}
  moduleDef?.install?.(siteName, parentModule, inheritedLayouts);
  if (Array.isArray(moduleDef?.modules) && moduleDef.modules.length) {
    const combinedLayouts = { ...(inheritedLayouts||{}), ...(moduleDef.layouts||{}) };
    for (const sub of moduleDef.modules) await loadModuleForSite(sub, siteName, combinedLayouts, moduleDef.name || moduleName);
  }
  loadedModules[cacheKey] = moduleDef;
  return moduleDef;
}

export const initializeSystem = async () => {
  clearAllRoutes();
  let sitesToLoad = [];
  if (import.meta.env && import.meta.env.DEV) sitesToLoad = await getAvailableSites(); else sitesToLoad = appConfig.sites?.enabled || ['zoomy'];
  for (const s of sitesToLoad) {
    const site = await loadSite(s); if (!site) continue;
    const siteLayouts = site.layouts || {};
    const modules = Array.isArray(site.modules) ? site.modules : [];
    for (const m of modules) await loadModuleForSite(m, s, siteLayouts, null);
  }
  try {
  const dynamicRoutesModule = await import(/* @vite-ignore */ './dynamicRoutes.jsx');
    const generateRoutes = dynamicRoutesModule.default;
    const router = await generateRoutes();
    return router;
  } catch (error) {
    console.error('[systemLoader] Fallback router por error:', error);
    return createBrowserRouter([
      { path: '/', element: React.createElement('div', null, 'Inicio') },
      { path: '*', element: React.createElement('div', null, 'No encontrado') }
    ]);
  }
};
