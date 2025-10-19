// Rutas del módulo KYC
export const routes = [
  {
    path: "", // /[siteName]/kyc
    layout: "modules/admin/layouts/MainLayout.jsx",
    moduleName: "kyc",
    children: [
      {
        path: "", // /[siteName]/kyc
        componentPath: "modules/kyc/pages/Dashboard.jsx"
      },
      {
        path: "pending", // /[siteName]/kyc/pending
        componentPath: "modules/kyc/pages/PendingReviews.jsx"
      },
      {
        path: "approved", // /[siteName]/kyc/approved
        componentPath: "modules/kyc/pages/ApprovedKYC.jsx"
      },
      {
        path: "rejected", // /[siteName]/kyc/rejected
        componentPath: "modules/kyc/pages/RejectedKYC.jsx"
      },
      {
        path: "documents", // /[siteName]/kyc/documents
        componentPath: "modules/kyc/pages/DocumentManagement.jsx"
      },
      {
        path: "verification-rules", // /[siteName]/kyc/verification-rules
        componentPath: "modules/kyc/pages/VerificationRules.jsx"
      },
      {
        path: "audit-log", // /[siteName]/kyc/audit-log
        componentPath: "modules/kyc/pages/AuditLog.jsx"
      }
    ]
  }
];