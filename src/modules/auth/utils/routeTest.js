/**
 * Pruebas de resolución de rutas jerárquicas
 * Demuestra cómo el PolicyProcessor resuelve rutas automáticamente
 */

import { policyProcessor } from '../../../zoom/security/policyProcessor.js';

// Configuración de ejemplo para pruebas
const testModuleConfig = {
  moduleName: 'admin',
  auth: {
    loginRoute: '/admin/auth/login',
    registerRoute: '/admin/auth/register',
    homeRoute: '/admin/dashboard',
    defaultRedirect: '/admin/dashboard',
    unauthorizedRoute: '/admin/auth/unauthorized'
  }
};

export function testRouteResolution() {
  // Registrar módulo de prueba
  policyProcessor.registerModule(testModuleConfig);

  const testCases = [
    {
      description: 'Ruta de login del admin',
      input: '/admin/auth/login',
      site: 'misite',
      module: 'admin',
      expected: '/misite/admin/auth/login'
    },
    {
      description: 'Ruta relativa en admin',
      input: 'users/create',
      site: 'misite', 
      module: 'admin',
      expected: '/misite/admin/users/create'
    },
    {
      description: 'Ruta absoluta entre módulos',
      input: '/marketing/campaigns',
      site: 'misite',
      module: 'admin',
      expected: '/misite/marketing/campaigns'
    },
    {
      description: 'Ruta ya completa',
      input: '/misite/admin/dashboard',
      site: 'misite',
      module: 'admin', 
      expected: '/misite/admin/dashboard'
    }
  ];

  console.log('🧪 === PRUEBAS DE RESOLUCIÓN DE RUTAS ===');
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.description}`);
    console.log(`   Entrada: ${testCase.input}`);
    console.log(`   Sitio: ${testCase.site}, Módulo: ${testCase.module}`);
    
    const resolved = policyProcessor.resolveHierarchicalRoute(
      testCase.input,
      testCase.site,
      testCase.module
    );
    
    console.log(`   Resultado: ${resolved}`);
    console.log(`   Esperado: ${testCase.expected}`);
    console.log(`   ✅ ${resolved === testCase.expected ? 'PASÓ' : '❌ FALLÓ'}`);
  });

  // Probar configuración de auth resuelta
  console.log('\n🔧 === CONFIGURACIÓN AUTH RESUELTA ===');
  const resolvedAuth = policyProcessor.getResolvedAuthConfig(
    testModuleConfig,
    'misite',
    'admin'
  );
  
  console.log('Configuración auth resuelta:');
  Object.entries(resolvedAuth).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  return {
    testCases: testCases.map(tc => ({
      ...tc,
      result: policyProcessor.resolveHierarchicalRoute(tc.input, tc.site, tc.module),
      passed: policyProcessor.resolveHierarchicalRoute(tc.input, tc.site, tc.module) === tc.expected
    })),
    resolvedAuth
  };
}

// Para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.testRouteResolution = testRouteResolution;
}
