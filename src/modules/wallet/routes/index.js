// Rutas del módulo wallet
export const routes = [
  {
    path: "", // /[siteName]/wallet
    layout: "modules/admin/layouts/MainLayout.jsx",
    moduleName: "wallet",
    children: [
      {
        path: "", // /[siteName]/wallet
        componentPath: "modules/wallet/pages/Dashboard.jsx"
      },
      {
        path: "management", // /[siteName]/wallet/management
        componentPath: "modules/wallet/pages/Management.jsx"
      },
      {
        path: "transactions", // /[siteName]/wallet/transactions
        componentPath: "modules/wallet/pages/Transactions.jsx"
      },
      {
        path: "token-management", // /[siteName]/wallet/token-management
        componentPath: "modules/wallet/pages/TokenManagement.jsx"
      },
      {
        path: "p2p-transfers", // /[siteName]/wallet/p2p-transfers
        componentPath: "modules/wallet/pages/P2PTransfers.jsx"
      },
      {
        path: "fiat-conversion", // /[siteName]/wallet/fiat-conversion
        componentPath: "modules/wallet/pages/FiatConversion.jsx"
      },
      {
        path: "reports", // /[siteName]/wallet/reports
        componentPath: "modules/wallet/pages/Reports.jsx"
      }
    ]
  }
];