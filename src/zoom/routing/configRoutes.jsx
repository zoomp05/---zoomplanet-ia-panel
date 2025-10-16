// Moved from src/configRoutes.jsx into zoom/routing/configRoutes.jsx
// Centralized route configuration under zoom.
import { getAllRoutes } from '@config/routesRegistry';

const resolveRoutePaths = (routes, isChild = false) => {
  return routes.map(route => {
    const r = { ...route };
    let normalizedPath = r.path || '';
    if (!isChild) {
      if (normalizedPath && !normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath; // keep as-is
      }
    }
    const result = { ...r, path: normalizedPath };
    if (Array.isArray(r.children) && r.children.length > 0) {
      result.children = resolveRoutePaths(r.children, true);
    }
    return result;
  });
};

const getApplicationRoutes = () => {
  const staticRoutes = [
    { path: '/', componentPath: 'pages/Welcome.jsx' },
    { path: 'core', componentPath: 'layouts/MainLayout.jsx', children: [
      { path: '', componentPath: 'pages/Dashboard.jsx' },
      { path: 'projects', componentPath: 'layouts/BlankLayout.jsx', children: [
        { path: 'create', componentPath: 'pages/CreateProject.jsx' },
        { path: ':id', componentPath: 'pages/ProjectView.jsx' }
      ] }
    ] }
  ];
  const dynamicRoutes = getAllRoutes();
  console.log('[zoom/routing] Rutas dinámicas recuperadas:', dynamicRoutes);
  const resolvedDynamicRoutes = resolveRoutePaths(dynamicRoutes, false);
  return [...staticRoutes, ...resolvedDynamicRoutes];
};

const configRoutes = getApplicationRoutes();
export default configRoutes;
