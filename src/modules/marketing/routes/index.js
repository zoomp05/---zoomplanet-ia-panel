export const routes = [
  {
    path: "",
    layout: "modules/marketing/layouts/MainLayout.jsx", // Usar layout específico del módulo
    moduleName: "marketing", // Importante para que se aplique el layout sobrescrito
    children: [
      {
        path: ":id?", // Esto se convertirá en /[siteName]/marketing o /[siteName]/[parentModule]/marketing
        componentPath: "modules/marketing/pages/index.jsx",
      },
      {
        path: "",
        componentPath: "modules/marketing/pages/index.jsx",
      },
      // Rutas de campañas asistidas por IA
      {
        path: "campaigns",
        componentPath: "modules/marketing/pages/campaigns.jsx",
      },
      {
        path: "campaigns/create",
        componentPath: "modules/marketing/pages/CreateAICampaign.jsx",
      },
      {
        path: "campaigns/create-ai",
        componentPath: "modules/marketing/pages/CreateAICampaign.jsx",
      },
      {
        path: "campaigns/:id",
        componentPath: "modules/marketing/pages/campaignDetail.jsx",
      },
      {
        path: "campaigns/:id/edit",
        componentPath: "modules/marketing/pages/editCampaign.jsx",
      },
      {
        path: "ai-workflow/:id",
        componentPath: "modules/marketing/pages/AICampaignWorkflow.jsx",
      },
      {
        path: "ai-campaigns/:id",
        componentPath: "modules/marketing/pages/AICampaignDetail.jsx",
      },
      // Analytics y Reportes
      {
        path: "analytics",
        componentPath: "modules/marketing/pages/analytics.jsx",
      },
      {
        path: "ai-analytics",
        componentPath: "modules/marketing/pages/AICampaignAnalyticsSimple.jsx",
      },
      // CRM y Leads
      {
        path: "leads",
        componentPath: "modules/marketing/pages/leads.jsx",
      },
      // Configuración
      {
        path: "configuration",
        componentPath: "modules/marketing/pages/configuration.jsx",
      }
    ],
  },
];
