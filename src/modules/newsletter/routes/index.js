export const routes = [
  {
    path: "",
    moduleName: "newsletter", // Importante para que se aplique el layout sobrescrito
    children: [
      {
        path: "",
        componentPath: "modules/newsletter/pages/newsletter.jsx",
      },
      {
        path: "create",
        componentPath: "modules/newsletter/pages/newsletter.jsx",
      },
      {
        path: "edit/:id",
        componentPath: "modules/newsletter/pages/newsletter.jsx",
      },
      {
        path: "campaigns",
        componentPath: "modules/newsletter/pages/campaigns.jsx",
      },
      {
        path: "emailLogs",
        componentPath: "modules/newsletter/pages/emailLogs.jsx",
      },
      {
        path: "Config", // Esto se convertirá en /[siteName]/newsletter o /[siteName]/[parentModule]/newsletter
        componentPath: "modules/newsletter/pages/newsletterConfig.jsx",
      },
      {
        path: "contacts",
        componentPath: "modules/newsletter/pages/contacts.jsx",
      },
      {
        path: "contactGroup",
        componentPath: "modules/newsletter/pages/contactGroup.jsx",
      },
    ],
  },
];
