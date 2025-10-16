/**
 * Test de Inicialización Completa del Site Zoomy
 * 
 * Este script prueba:
 * 1. Creación del ModuleInitializer
 * 2. Carga de módulos en orden correcto
 * 3. Registro de rutas dinámicas
 * 4. Estado final del sistema
 */

import zoomySite from './src/sites/zoomy/index.js';
import { getAllRoutes, debugRouteTree } from './src/zoom/routing/routesRegistry.js';

async function testSiteInitialization() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🧪 TEST: Inicialización Completa del Site Zoomy         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  try {
    // ============================================
    // PASO 1: Ejecutar install del site
    // ============================================
    console.log('📍 PASO 1: Ejecutando zoomySite.install()...\n');
    await zoomySite.install();
    
    console.log('\n✅ Install completado\n');
    
    // ============================================
    // PASO 2: Obtener ModuleInitializer
    // ============================================
    console.log('📍 PASO 2: Obteniendo ModuleInitializer...\n');
    const initializer = zoomySite.getModuleInitializer();
    
    if (!initializer) {
      throw new Error('❌ ModuleInitializer no está disponible');
    }
    console.log('✅ ModuleInitializer obtenido correctamente\n');
    
    // ============================================
    // PASO 3: Verificar estado del sistema
    // ============================================
    console.log('📍 PASO 3: Verificando estado del sistema...\n');
    const diagnostics = initializer.getDiagnostics();
    
    console.log('📊 DIAGNÓSTICO DEL SISTEMA:');
    console.log('─────────────────────────────────────────────────');
    console.log(`   Site ID:          ${diagnostics.siteId}`);
    console.log(`   Inicializado:     ${diagnostics.initialized ? '✅' : '❌'}`);
    console.log(`   Total Módulos:    ${diagnostics.totalModules}`);
    console.log('');
    console.log('   Estados de Módulos:');
    Object.entries(diagnostics.states).forEach(([state, count]) => {
      console.log(`     - ${state}: ${count}`);
    });
    
    if (diagnostics.errors.length > 0) {
      console.log('');
      console.log('   ⚠️  Errores:');
      diagnostics.errors.forEach((error, i) => {
        console.log(`     ${i + 1}. ${error.instanceId}: ${error.error}`);
      });
    } else {
      console.log('');
      console.log('   ✅ Sin errores');
    }
    console.log('─────────────────────────────────────────────────\n');
    
    // ============================================
    // PASO 4: Verificar módulos cargados
    // ============================================
    console.log('📍 PASO 4: Verificando módulos cargados...\n');
    const instances = initializer.getAllModuleInstances();
    const moduleIds = Object.keys(instances);
    
    console.log('📦 MÓDULOS CARGADOS:');
    console.log('─────────────────────────────────────────────────');
    if (moduleIds.length === 0) {
      console.log('   ⚠️  No hay módulos cargados');
    } else {
      moduleIds.forEach((instanceId, index) => {
        const moduleData = initializer.modules.get(instanceId);
        const config = moduleData?.config;
        const state = moduleData?.state;
        
        console.log(`   ${index + 1}. ${instanceId}`);
        console.log(`      Módulo: ${config?.module || config?.name || 'N/A'}`);
        console.log(`      Scope: ${config?.scope || 'N/A'}`);
        console.log(`      Estado: ${state || 'N/A'}`);
        console.log(`      Lazy: ${config?.lazy ? '✅' : '❌'}`);
        console.log('');
      });
    }
    console.log('─────────────────────────────────────────────────\n');
    
    // ============================================
    // PASO 5: Verificar rutas registradas
    // ============================================
    console.log('📍 PASO 5: Verificando rutas registradas...\n');
    const routes = getAllRoutes();
    
    console.log('🛤️  RUTAS REGISTRADAS:');
    console.log('─────────────────────────────────────────────────');
    console.log(`   Total de rutas: ${routes.length}`);
    console.log('');
    
    if (routes.length === 0) {
      console.log('   ⚠️  No hay rutas registradas');
    } else {
      // Agrupar rutas por módulo
      const routesByModule = {};
      routes.forEach(route => {
        const pathParts = route.path.split('/').filter(p => p);
        const moduleKey = pathParts.length >= 2 ? `/${pathParts[0]}/${pathParts[1]}` : route.path;
        
        if (!routesByModule[moduleKey]) {
          routesByModule[moduleKey] = [];
        }
        routesByModule[moduleKey].push(route.path);
      });
      
      Object.entries(routesByModule).forEach(([module, modulePaths]) => {
        console.log(`   ${module}/* (${modulePaths.length} rutas)`);
        modulePaths.slice(0, 5).forEach(path => {
          console.log(`     - ${path}`);
        });
        if (modulePaths.length > 5) {
          console.log(`     ... y ${modulePaths.length - 5} más`);
        }
        console.log('');
      });
    }
    console.log('─────────────────────────────────────────────────\n');
    
    // ============================================
    // PASO 6: Verificar SessionManager
    // ============================================
    console.log('📍 PASO 6: Verificando SessionManager...\n');
    const sessionManager = initializer.sessionManager;
    
    console.log('🔐 SESSION MANAGER:');
    console.log('─────────────────────────────────────────────────');
    console.log(`   Activo: ${sessionManager ? '✅' : '❌'}`);
    
    if (sessionManager) {
      console.log(`   Site ID: ${sessionManager.siteConfig?.siteId || 'N/A'}`);
      
      // Verificar configuración de sesiones
      const sessionConfig = sessionManager.siteConfig?.instanceRules?.auth?.sessions;
      if (sessionConfig) {
        console.log('');
        console.log('   Sesiones configuradas:');
        Object.keys(sessionConfig).forEach(scope => {
          const config = sessionConfig[scope];
          console.log(`     - ${scope}: ${config.timeout}s (${config.storage})`);
        });
      }
    }
    console.log('─────────────────────────────────────────────────\n');
    
    // ============================================
    // PASO 7: Verificar árbol de rutas completo
    // ============================================
    console.log('📍 PASO 7: Árbol de rutas completo...\n');
    const routeTree = debugRouteTree();
    
    console.log('🌳 ÁRBOL DE RUTAS:');
    console.log('─────────────────────────────────────────────────');
    console.log(JSON.stringify(routeTree, null, 2));
    console.log('─────────────────────────────────────────────────\n');
    
    // ============================================
    // RESULTADO FINAL
    // ============================================
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ TEST COMPLETADO EXITOSAMENTE                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');
    
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Site inicializado: ${diagnostics.initialized}`);
    console.log(`   ✅ Módulos cargados: ${moduleIds.length}`);
    console.log(`   ✅ Rutas registradas: ${routes.length}`);
    console.log(`   ✅ SessionManager activo: ${!!sessionManager}`);
    console.log(`   ${diagnostics.errors.length === 0 ? '✅' : '⚠️ '} Errores: ${diagnostics.errors.length}`);
    console.log('\n');
    
    return {
      success: true,
      diagnostics,
      modulesLoaded: moduleIds.length,
      routesRegistered: routes.length,
      errors: diagnostics.errors
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
console.log('Iniciando test de inicialización...\n');
testSiteInitialization()
  .then(result => {
    if (result.success) {
      console.log('🎉 Test finalizado correctamente');
      process.exit(0);
    } else {
      console.error('💔 Test finalizado con errores');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Error crítico:', error);
    process.exit(1);
  });
