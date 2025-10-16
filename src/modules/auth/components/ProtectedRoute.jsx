// Deprecated stub: ProtectedRoute fue reemplazado por RouteGuard.
// Se mantiene temporalmente para evitar fallos en imports residuales.
export default function ProtectedRoute() {
  if (import.meta.env?.DEV) console.warn('[Deprecated] ProtectedRoute stub (usar RouteGuard)');
  return null;
}
