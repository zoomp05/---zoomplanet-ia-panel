export const routes = [
  {
    path: "", 
    moduleName: "crm",
      children: [
      {
        path: "",
        componentPath: 'modules/crm/pages/dashboard.jsx',
      }
      ,{
        path: "leads",
        componentPath: 'modules/crm/pages/leads/LeadsList.jsx'
      }
      ,{
        path: "leads/pipeline",
        componentPath: 'modules/crm/pages/leads/LeadsKanban.jsx'
      }
  // Submódulos marketing y newsletter se agregan dinámicamente
    ]
  }
];
