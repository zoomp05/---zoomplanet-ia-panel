// Rutas relativas al módulo user
export const routes = [
  {
    path: "",  // Esto se convertirá en /[siteName]/user
    componentPath: "modules/user/pages/index.jsx", // Elimina el punto inicial ./
  },
  {
    path: "profile",  // Esto se convertirá en /[siteName]/user/profile
    componentPath: "modules/user/pages/profile.jsx", // Elimina el punto inicial ./
  },
  {
    path: "roles",
    componentPath: "modules/user/pages/Roles.jsx",
  },
  {
    path: "permissions",
    componentPath: "modules/user/pages/Permissions.jsx",
  }
];