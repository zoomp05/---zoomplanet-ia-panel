/**
 * Rutas del módulo GoogleAds
 * 
 * Define todas las rutas para la gestión de Google Ads
 */

export const routes = [
  {
    path: "",
    layout: "modules/googleAds/layouts/MainLayout.jsx",
    moduleName: "googleAds",
    children: [
      // Dashboard principal
      {
        path: "",
        componentPath: "modules/googleAds/pages/Dashboard.jsx",
      },
      {
        path: ":id?",
        componentPath: "modules/googleAds/pages/Dashboard.jsx",
      },
      
      // Gestión de campañas
      {
        path: "campaigns",
        componentPath: "modules/googleAds/pages/Campaigns/CampaignsList.jsx",
      },
      {
        path: "campaigns/create",
        componentPath: "modules/googleAds/pages/Campaigns/CreateCampaign.jsx",
      },
      {
        path: "campaigns/:campaignId",
        componentPath: "modules/googleAds/pages/Campaigns/CampaignDetail.jsx",
      },
      {
        path: "campaigns/:campaignId/edit",
        componentPath: "modules/googleAds/pages/Campaigns/EditCampaign.jsx",
      },
      
      // Grupos de anuncios
      {
        path: "campaigns/:campaignId/ad-groups",
        componentPath: "modules/googleAds/pages/AdGroups/AdGroupsList.jsx",
      },
      {
        path: "campaigns/:campaignId/ad-groups/create",
        componentPath: "modules/googleAds/pages/AdGroups/CreateAdGroup.jsx",
      },
      {
        path: "campaigns/:campaignId/ad-groups/:adGroupId",
        componentPath: "modules/googleAds/pages/AdGroups/AdGroupDetail.jsx",
      },
      
      // Anuncios
      {
        path: "ads",
        componentPath: "modules/googleAds/pages/Ads/AdsList.jsx",
      },
      {
        path: "ads/create",
        componentPath: "modules/googleAds/pages/Ads/CreateAd.jsx",
      },
      {
        path: "ads/:adId",
        componentPath: "modules/googleAds/pages/Ads/AdDetail.jsx",
      },
      
      // Keywords
      {
        path: "keywords",
        componentPath: "modules/googleAds/pages/Keywords/KeywordsList.jsx",
      },
      {
        path: "keywords/research",
        componentPath: "modules/googleAds/pages/Keywords/KeywordResearch.jsx",
      },
      
      // Reportes y Analytics
      {
        path: "reports",
        componentPath: "modules/googleAds/pages/Reports/ReportsDashboard.jsx",
      },
      {
        path: "reports/performance",
        componentPath: "modules/googleAds/pages/Reports/PerformanceReport.jsx",
      },
      {
        path: "reports/conversions",
        componentPath: "modules/googleAds/pages/Reports/ConversionsReport.jsx",
      },
      
      // Sincronización con Marketing
      {
        path: "sync",
        componentPath: "modules/googleAds/pages/Sync/SyncDashboard.jsx",
      },
      {
        path: "sync/marketing-campaigns",
        componentPath: "modules/googleAds/pages/Sync/MarketingCampaignSync.jsx",
      },
      
      // Configuración - Todas las rutas apuntan al componente principal con tabs
      {
        path: "settings",
        componentPath: "modules/googleAds/pages/Settings/GoogleAdsSettings.jsx",
      },
      {
        path: "settings/accounts",
        componentPath: "modules/googleAds/pages/Settings/GoogleAdsSettings.jsx",
      },
      {
        path: "settings/api",
        componentPath: "modules/googleAds/pages/Settings/GoogleAdsSettings.jsx",
      }
    ],
  },
];
