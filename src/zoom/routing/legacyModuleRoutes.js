// LEGACY simple moduleRoutes collector (temporal). Preferir routesRegistry.
const legacyModuleRoutes = [];
export const registerLegacyModuleRoutes = (routes=[]) => { legacyModuleRoutes.push(...routes); };
export const getLegacyModuleRoutes = () => legacyModuleRoutes;
export default { registerLegacyModuleRoutes, getLegacyModuleRoutes };
