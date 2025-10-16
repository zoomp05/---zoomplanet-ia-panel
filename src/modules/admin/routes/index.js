// Rutas relativas al módulo admin
export const routes = [
  {
    path: "", // /[siteName]/admin
    layout: "modules/admin/layouts/MainLayout.jsx",
    moduleName: "admin",
    children: [
      {
        path: "", // /[siteName]/admin
  componentPath: "modules/admin/pages/index.jsx"
      },
      {
        path: "dashboard", // /[siteName]/admin/dashboard
  componentPath: "modules/admin/pages/dashboard.jsx"
      },
      {
        path: "profile", // /[siteName]/admin/profile
  componentPath: "modules/admin/pages/profile.jsx"
      },
      {
        path: "settings", // /[siteName]/admin/settings
  componentPath: "modules/admin/pages/settings.jsx"
      },
      {
        path: "site-config", // /[siteName]/admin/site-config
        componentPath: "modules/base/pages/SiteConfiguration.jsx"
      },
      {
        path: "users", // /[siteName]/admin/users
  componentPath: "modules/user/pages/Users.jsx"
      },
      {
        path: "users/roles", // /[siteName]/admin/users/roles
  componentPath: "modules/user/pages/Roles.jsx"
      },
      {
        path: "users/permissions", // /[siteName]/admin/users/permissions
  componentPath: "modules/user/pages/Permissions.jsx"
      },
      /*{
        path: "auth/login", // /[siteName]/admin/auth/login
        componentPath: "modules/admin/pages/auth/login.jsx",
      }*/
    ]
  }
];
