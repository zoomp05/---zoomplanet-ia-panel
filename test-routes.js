/**
 * Test de Verificación de Rutas Dinámicas
 * 
 * Este script prueba:
 * 1. Registro correcto de rutas
 * 2. Estructura jerárquica de rutas
 * 3. Rutas esperadas vs rutas reales
 * 4. No colisión entre instancias de Auth
 */

import zoomySite from './src/sites/zoomy/index.js';
import { getAllRoutes, debugRouteTree } from './src/zoom/routing/routesRegistry.js';

async function testRoutes() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🧪 TEST: Verificación de Rutas Dinámicas                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  try {
    // Inicializar site
    console.log('📍 Inicializando site Zoomy...\n');
    await zoomySite.install();
    console.log('✅ Site inicializado\n');
    
    // Obtener todas las rutas
    const routes = getAllRoutes();
    
    // ============================================
    // TEST 1: Verificar rutas esperadas
    // ============================================
    console.log('📍 TEST 1: Verificando rutas esperadas...\n');
    
    const expectedRoutes = [
      // Rutas de auth-panel (Auth raíz)
      '/zoomy/auth',
      '/zoomy/auth/login',
      '/zoomy/auth/register',
      '/zoomy/auth/forgot-password',
      '/zoomy/auth/verify-email',
      '/zoomy/auth/resend-confirmation',
      
      // Rutas de admin-main
      '/zoomy/admin',
      
      // Rutas de auth-admin (Auth dentro de Admin)
      '/zoomy/admin/auth',
      '/zoomy/admin/auth/login',
      '/zoomy/admin/auth/config'
    ];
    
    console.log('🔍 RUTAS ESPERADAS:');
    console.log('─────────────────────────────────────────────────');
    
    const foundRoutes = [];
    const missingRoutes = [];
    
    expectedRoutes.forEach(expectedPath => {
      const found = routes.some(route => route.path === expectedPath);
      if (found) {
        foundRoutes.push(expectedPath);
        console.log(`   ✅ ${expectedPath}`);
      } else {
        missingRoutes.push(expectedPath);
        console.log(`   ❌ ${expectedPath} (NO ENCONTRADA)`);
      }
    });
    
    console.log('─────────────────────────────────────────────────\n');
    console.log(`   Encontradas: ${foundRoutes.length}/${expectedRoutes.length}`);
    console.log(`   Faltantes: ${missingRoutes.length}\n`);
    
    // ============================================
    // TEST 2: Verificar no colisión de Auth
    // ============================================
    console.log('📍 TEST 2: Verificando no colisión entre instancias de Auth...\n');
    
    const authPanelRoutes = routes.filter(r => r.path.startsWith('/zoomy/auth'));
    const authAdminRoutes = routes.filter(r => r.path.startsWith('/zoomy/admin/auth'));
    
    console.log('🔐 INSTANCIAS DE AUTH:');
    console.log('─────────────────────────────────────────────────');
    console.log(`   auth-panel (/zoomy/auth/*): ${authPanelRoutes.length} rutas`);
    authPanelRoutes.forEach(route => {
      console.log(`     - ${route.path}`);
    });
    console.log('');
    console.log(`   auth-admin (/zoomy/admin/auth/*): ${authAdminRoutes.length} rutas`);
    authAdminRoutes.forEach(route => {
      console.log(`     - ${route.path}`);
    });
    console.log('─────────────────────────────────────────────────\n');
    
    // Verificar que no hay colisión
    const hasCollision = authPanelRoutes.some(panelRoute => 
      authAdminRoutes.some(adminRoute => panelRoute.path === adminRoute.path)
    );
    
    if (hasCollision) {
      console.log('   ❌ ¡HAY COLISIÓN! Las instancias comparten rutas');
    } else {
      console.log('   ✅ No hay colisión. Las instancias están aisladas correctamente\n');
    }
    
    // ============================================
    // TEST 3: Verificar jerarquía de rutas
    // ============================================
    console.log('📍 TEST 3: Verificando jerarquía de rutas...\n');
    
    const routeTree = debugRouteTree();
    
    console.log('🌳 JERARQUÍA:');
    console.log('─────────────────────────────────────────────────');
    console.log('zoomy/');
    
    // Verificar estructura esperada
    const hasZoomyBase = routeTree.zoomy && routeTree.zoomy.base;
    const hasAuthModule = routeTree.zoomy?.modules?.auth;
    const hasAdminModule = routeTree.zoomy?.modules?.admin;
    const hasAuthSubmodule = routeTree.zoomy?.modules?.admin?.submodules?.auth;
    
    console.log(`├── base: ${hasZoomyBase ? '✅' : '❌'}`);
    console.log(`├── modules/`);
    console.log(`│   ├── auth: ${hasAuthModule ? '✅' : '❌'} (auth-panel)`);
    console.log(`│   └── admin: ${hasAdminModule ? '✅' : '❌'} (admin-main)`);
    console.log(`│       └── submodules/`);
    console.log(`│           └── auth: ${hasAuthSubmodule ? '✅' : '❌'} (auth-admin)`);
    console.log('─────────────────────────────────────────────────\n');
    
    const hierarchyCorrect = hasAuthModule && hasAdminModule && hasAuthSubmodule;
    console.log(`   Jerarquía: ${hierarchyCorrect ? '✅ CORRECTA' : '❌ INCORRECTA'}\n`);
    
    // ============================================
    // TEST 4: Listar todas las rutas encontradas
    // ============================================
    console.log('📍 TEST 4: Listado completo de rutas...\n');
    
    console.log('📋 TODAS LAS RUTAS:');
    console.log('─────────────────────────────────────────────────');
    console.log(`   Total: ${routes.length} rutas\n`);
    
    // Agrupar por prefijo
    const routeGroups = {};
    routes.forEach(route => {
      const parts = route.path.split('/').filter(p => p);
      const prefix = parts.length >= 2 ? `/${parts[0]}/${parts[1]}` : route.path;
      
      if (!routeGroups[prefix]) {
        routeGroups[prefix] = [];
      }
      routeGroups[prefix].push(route.path);
    });
    
    Object.entries(routeGroups).forEach(([prefix, paths]) => {
      console.log(`   ${prefix}/* (${paths.length})`);
      paths.forEach(path => {
        console.log(`     - ${path}`);
      });
      console.log('');
    });
    console.log('─────────────────────────────────────────────────\n');
    
    // ============================================
    // TEST 5: Verificar layouts
    // ============================================
    console.log('📍 TEST 5: Verificando layouts...\n');
    
    console.log('🎨 LAYOUTS:');
    console.log('─────────────────────────────────────────────────');
    
    const layoutStats = {
      total: routes.length,
      withLayout: routes.filter(r => r.layout).length,
      withoutLayout: routes.filter(r => !r.layout).length
    };
    
    console.log(`   Total rutas: ${layoutStats.total}`);
    console.log(`   Con layout: ${layoutStats.withLayout}`);
    console.log(`   Sin layout: ${layoutStats.withoutLayout}\n`);
    
    // Contar layouts únicos
    const uniqueLayouts = [...new Set(routes.filter(r => r.layout).map(r => r.layout))];
    console.log(`   Layouts únicos: ${uniqueLayouts.length}`);
    uniqueLayouts.forEach(layout => {
      const count = routes.filter(r => r.layout === layout).length;
      console.log(`     - ${layout} (${count} rutas)`);
    });
    console.log('─────────────────────────────────────────────────\n');
    
    // ============================================
    // RESULTADO FINAL
    // ============================================
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  📊 RESUMEN DE TESTS                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');
    
    const allTestsPassed = 
      missingRoutes.length === 0 &&
      !hasCollision &&
      hierarchyCorrect &&
      routes.length > 0;
    
    console.log(`   ${missingRoutes.length === 0 ? '✅' : '❌'} Test 1: Rutas esperadas (${foundRoutes.length}/${expectedRoutes.length})`);
    console.log(`   ${!hasCollision ? '✅' : '❌'} Test 2: No colisión de Auth`);
    console.log(`   ${hierarchyCorrect ? '✅' : '❌'} Test 3: Jerarquía correcta`);
    console.log(`   ${routes.length > 0 ? '✅' : '❌'} Test 4: Rutas registradas (${routes.length})`);
    console.log(`   ${layoutStats.withLayout > 0 ? '✅' : '❌'} Test 5: Layouts configurados`);
    console.log('');
    console.log(`   ${allTestsPassed ? '✅ TODOS LOS TESTS PASARON' : '⚠️  ALGUNOS TESTS FALLARON'}`);
    console.log('\n');
    
    return {
      success: allTestsPassed,
      results: {
        expectedRoutes: expectedRoutes.length,
        foundRoutes: foundRoutes.length,
        missingRoutes: missingRoutes.length,
        hasCollision,
        hierarchyCorrect,
        totalRoutes: routes.length
      }
    };
    
  } catch (error) {
    console.error('\n');
    console.error('╔════════════════════════════════════════════════════════════╗');
    console.error('║  ❌ TEST FALLIDO                                          ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error('\n');
    console.error('💥 ERROR:');
    console.error('─────────────────────────────────────────────────');
    console.error(`   Mensaje: ${error.message}`);
    console.error('');
    console.error('   Stack Trace:');
    console.error(error.stack);
    console.error('─────────────────────────────────────────────────\n');
    
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Ejecutar test
console.log('Iniciando test de rutas...\n');
testRoutes()
  .then(result => {
    if (result.success) {
      console.log('🎉 Test de rutas finalizado correctamente');
      process.exit(0);
    } else {
      console.error('💔 Test de rutas finalizado con errores');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Error crítico:', error);
    process.exit(1);
  });
