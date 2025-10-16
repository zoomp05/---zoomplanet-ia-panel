// Rutas relativas al módulo account
export const routes = [
  {
    path: '',
    moduleName: 'account', // Necesario para que se aplique el layout heredado (Admin/MainLayout)
    children: [
      {
        path: '', // /[site]/[parent]/account
        componentPath: 'modules/account/pages/Accounts.jsx'
      },
      {
        path: 'me', // /[site]/[parent]/account/me
        componentPath: 'modules/account/pages/MyAccount.jsx'
      }
    ]
  }
];
