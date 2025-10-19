/**
 * Rutas base del sitio Migratum
 * 
 * Define las rutas principales del sitio:
 * - / (index)
 * - /dashboard
 */

export const routes = [
  {
    path: "",  // Ruta raíz del sitio (/migratum)
    componentPath: "./sites/migratum/pages/index.jsx",
  }, 
  {
    path: "dashboard", // /migratum/dashboard
    componentPath: "./sites/migratum/pages/Dashboard.jsx", 
  }
];

export const migratumRoutes = routes;
