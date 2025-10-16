// Deprecated legacy implementation. This file is now a thin shim pointing to the new core.
// TODO: Eliminar este archivo una vez que no existan imports legacy.
export * from '../zoom/routing/routeProcessorCore.js';
import { processRoutes } from '../zoom/routing/routeProcessorCore.js';
export default processRoutes;