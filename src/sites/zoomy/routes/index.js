//import AuthConfig from '../pages/AuthConfig';
//import Login from '../pages/Login';
//import ForgotPassword from '../pages/ForgotPassword';
//import ResetPassword from '../pages/ResetPassword';
//import AuthGuard from '../components/AuthGuard';

export const routes = [
  {
    path: "",  // Ruta raíz del sitio (se convertirá en /zoomy)
    componentPath: "./sites/zoomy/pages/index.jsx", // Asegúrate de que esta ruta es correcta
  }, 
  {
    path: "dashboard", // Se convertirá en /zoomy/dashboard
    componentPath: "./sites/zoomy/pages/dashboard.jsx", 
  }
];

// Esto es para compatibilidad con importaciones existentes
export const zoomyRoutes = routes;