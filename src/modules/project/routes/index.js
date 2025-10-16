export const routes = [
  {
    path: "",
    moduleName: "project", // Importante para que se aplique el layout sobrescrito
    children: [
      {
        path: ":id?", // Esto se convertirá en /[siteName]/project o /[siteName]/[parentModule]/project
        componentPath: "modules/project/pages/index.jsx",
      },
      {
        path: "",
        componentPath: "modules/project/pages/index.jsx",
      },
      {
        path: "list",
        componentPath: "modules/project/pages/list.jsx",
      },
      {
        path: "create",
        componentPath: "modules/project/pages/create.jsx",
      },
      /*{
        path: "detail/:id",
        componentPath: "modules/project/pages/detail.jsx",
      }*/
    ],
  },
];
