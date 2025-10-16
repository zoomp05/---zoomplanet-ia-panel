const moduleRoutes = [];

export const registerModuleRoutes = (routes) => {
  moduleRoutes.push(...routes);
};

export const getModuleRoutes = () => moduleRoutes;
