/**
 * Module Dependency Resolver
 * 
 * Resuelve el orden de carga de módulos basándose en sus dependencias,
 * detecta dependencias circulares, y maneja submódulos anidados.
 * 
 * Características:
 * - Resolución topológica de dependencias
 * - Detección de ciclos
 * - Soporte para submódulos
 * - Priorización de módulos críticos
 * - Validación de dependencias
 */

class ModuleDependencyResolver {
  constructor(siteConfig) {
    this.siteConfig = siteConfig;
    this.moduleGraph = new Map();
    this.resolvedOrder = [];
    this.visited = new Set();
    this.visiting = new Set();
    
    console.log('🔗 ModuleDependencyResolver initialized');
  }
  
  // ============================================
  // CONSTRUCCIÓN DEL GRAFO
  // ============================================
  
  /**
   * Construye el grafo de dependencias completo
   */
  buildDependencyGraph() {
    console.log('📊 Building dependency graph...');
    
    this.siteConfig.modules.forEach(moduleInstance => {
      const dependencies = this.collectAllDependencies(moduleInstance);
      
      this.moduleGraph.set(moduleInstance.id, {
        instance: moduleInstance,
        dependencies,
        submodules: this.extractSubmodules(moduleInstance),
        priority: moduleInstance.priority || 999,
        lazy: moduleInstance.lazy || false
      });
    });
    
    console.log(`✅ Dependency graph built (${this.moduleGraph.size} nodes)`);
    
    return this.moduleGraph;
  }
  
  /**
   * Recolecta todas las dependencias de un módulo (directas + de submódulos)
   */
  collectAllDependencies(moduleInstance) {
    const directDeps = moduleInstance.dependencies || [];
    const submoduleDeps = this.getSubmoduleDependencies(moduleInstance);
    
    // Combinar y eliminar duplicados
    return [...new Set([...directDeps, ...submoduleDeps])];
  }
  
  /**
   * Extrae los submódulos de un módulo cargando su configuración
   */
  extractSubmodules(moduleInstance) {
    try {
      // En desarrollo, cargar config dinámicamente
      // En producción, esto ya debería estar pre-cargado
      if (import.meta.env.MODE === 'development' && moduleInstance.config) {
        // Por ahora retornamos vacío, se cargará dinámicamente
        return {};
      }
      
      // En producción
      if (window.__SITE_MODULES__ && window.__SITE_MODULES__[moduleInstance.id]) {
        return window.__SITE_MODULES__[moduleInstance.id].config?.submodules || {};
      }
      
      return {};
    } catch (error) {
      console.warn(`Could not extract submodules for ${moduleInstance.id}:`, error);
      return {};
    }
  }
  
  /**
   * Obtiene dependencias de los submódulos
   */
  getSubmoduleDependencies(moduleInstance) {
    const submodules = this.extractSubmodules(moduleInstance);
    const dependencies = [];
    
    Object.entries(submodules).forEach(([submoduleName, submoduleConfig]) => {
      // Buscar si el submódulo ya está registrado como instancia principal
      const existingInstance = this.siteConfig.modules.find(
        m => m.module === submoduleName && m.scope === moduleInstance.scope
      );
      
      if (existingInstance) {
        dependencies.push(existingInstance.id);
      }
    });
    
    return dependencies;
  }
  
  // ============================================
  // RESOLUCIÓN DE ORDEN
  // ============================================
  
  /**
   * Resuelve el orden de carga de todos los módulos
   */
  resolveLoadOrder() {
    console.log('🔍 Resolving load order...');
    
    // 1. Construir grafo
    this.buildDependencyGraph();
    
    // 2. Validar dependencias
    this.validateDependencies();
    
    // 3. Resolver orden usando DFS topológico
    this.resolvedOrder = [];
    this.visited = new Set();
    this.visiting = new Set();
    
    // Visitar todos los nodos en orden de prioridad
    const sortedModules = Array.from(this.moduleGraph.entries())
      .sort(([, a], [, b]) => a.priority - b.priority);
    
    sortedModules.forEach(([instanceId]) => {
      if (!this.visited.has(instanceId)) {
        this.visit(instanceId);
      }
    });
    
    console.log(`✅ Load order resolved: ${this.resolvedOrder.join(' → ')}`);
    
    return this.resolvedOrder;
  }
  
  /**
   * Visita un nodo del grafo (DFS topológico)
   */
  visit(instanceId) {
    // Detectar ciclo
    if (this.visiting.has(instanceId)) {
      const cycle = this.getCycle(instanceId);
      throw new Error(`Circular dependency detected: ${cycle.join(' → ')}`);
    }
    
    // Ya visitado
    if (this.visited.has(instanceId)) {
      return;
    }
    
    // Marcar como visitando
    this.visiting.add(instanceId);
    
    // Obtener nodo
    const node = this.moduleGraph.get(instanceId);
    
    if (!node) {
      throw new Error(`Module instance ${instanceId} not found in graph`);
    }
    
    // Visitar dependencias primero
    node.dependencies.forEach(depId => {
      if (!this.visited.has(depId)) {
        this.visit(depId);
      }
    });
    
    // Marcar como visitado
    this.visiting.delete(instanceId);
    this.visited.add(instanceId);
    
    // Agregar al orden resuelto
    this.resolvedOrder.push(instanceId);
  }
  
  /**
   * Obtiene el ciclo de dependencias para el error
   */
  getCycle(startId) {
    const cycle = [startId];
    let currentId = startId;
    
    while (true) {
      const node = this.moduleGraph.get(currentId);
      if (!node) break;
      
      const nextDep = node.dependencies.find(dep => this.visiting.has(dep));
      if (!nextDep) break;
      
      cycle.push(nextDep);
      
      if (nextDep === startId) break;
      currentId = nextDep;
    }
    
    return cycle;
  }
  
  // ============================================
  // VALIDACIÓN
  // ============================================
  
  /**
   * Valida que todas las dependencias existan
   */
  validateDependencies() {
    console.log('✅ Validating dependencies...');
    
    const errors = [];
    
    this.moduleGraph.forEach((node, instanceId) => {
      node.dependencies.forEach(depId => {
        if (!this.moduleGraph.has(depId)) {
          errors.push({
            type: 'MISSING_DEPENDENCY',
            message: `Module ${instanceId} depends on ${depId} which is not registered`,
            module: instanceId,
            dependency: depId
          });
        }
      });
    });
    
    if (errors.length > 0) {
      console.error('❌ Dependency validation failed:', errors);
      throw new Error(`Dependency validation failed: ${errors.length} errors found`);
    }
    
    console.log('✅ All dependencies valid');
  }
  
  /**
   * Valida que no haya ciclos en las dependencias
   */
  detectCycles() {
    console.log('🔍 Detecting cycles...');
    
    const cycles = [];
    
    this.moduleGraph.forEach((node, instanceId) => {
      const visited = new Set();
      const path = [];
      
      const hasCycle = this.dfsDetectCycle(instanceId, visited, path);
      
      if (hasCycle) {
        cycles.push(path);
      }
    });
    
    if (cycles.length > 0) {
      console.error('❌ Cycles detected:', cycles);
      throw new Error(`Circular dependencies detected: ${cycles.length} cycles found`);
    }
    
    console.log('✅ No cycles detected');
  }
  
  /**
   * DFS para detectar ciclos
   */
  dfsDetectCycle(instanceId, visited, path) {
    if (path.includes(instanceId)) {
      return true; // Ciclo encontrado
    }
    
    if (visited.has(instanceId)) {
      return false; // Ya visitado, no hay ciclo
    }
    
    visited.add(instanceId);
    path.push(instanceId);
    
    const node = this.moduleGraph.get(instanceId);
    
    if (node) {
      for (const depId of node.dependencies) {
        if (this.dfsDetectCycle(depId, visited, path)) {
          return true;
        }
      }
    }
    
    path.pop();
    return false;
  }
  
  // ============================================
  // CONSULTAS
  // ============================================
  
  /**
   * Obtiene módulos críticos (no lazy)
   */
  getCriticalModules() {
    const critical = [];
    
    this.resolvedOrder.forEach(instanceId => {
      const node = this.moduleGraph.get(instanceId);
      if (node && !node.lazy) {
        critical.push(instanceId);
      }
    });
    
    console.log(`📦 Critical modules: ${critical.length}/${this.resolvedOrder.length}`);
    
    return critical;
  }
  
  /**
   * Obtiene módulos lazy
   */
  getLazyModules() {
    const lazy = [];
    
    this.resolvedOrder.forEach(instanceId => {
      const node = this.moduleGraph.get(instanceId);
      if (node && node.lazy) {
        lazy.push(instanceId);
      }
    });
    
    console.log(`⏱️ Lazy modules: ${lazy.length}/${this.resolvedOrder.length}`);
    
    return lazy;
  }
  
  /**
   * Obtiene dependencias de un módulo
   */
  getDependencies(instanceId) {
    const node = this.moduleGraph.get(instanceId);
    return node ? node.dependencies : [];
  }
  
  /**
   * Obtiene módulos que dependen de este (dependientes)
   */
  getDependents(instanceId) {
    const dependents = [];
    
    this.moduleGraph.forEach((node, id) => {
      if (node.dependencies.includes(instanceId)) {
        dependents.push(id);
      }
    });
    
    return dependents;
  }
  
  /**
   * Obtiene el árbol de dependencias completo de un módulo
   */
  getDependencyTree(instanceId, depth = 0, visited = new Set()) {
    if (visited.has(instanceId)) {
      return { instanceId, circular: true };
    }
    
    visited.add(instanceId);
    
    const node = this.moduleGraph.get(instanceId);
    
    if (!node) {
      return { instanceId, error: 'not found' };
    }
    
    const tree = {
      instanceId,
      module: node.instance.module,
      scope: node.instance.scope,
      priority: node.priority,
      lazy: node.lazy,
      dependencies: node.dependencies.map(depId =>
        this.getDependencyTree(depId, depth + 1, new Set(visited))
      )
    };
    
    return tree;
  }
  
  /**
   * Verifica si un módulo puede ser cargado (todas sus dependencias están cargadas)
   */
  canLoad(instanceId, loadedModules = []) {
    const node = this.moduleGraph.get(instanceId);
    
    if (!node) return false;
    
    return node.dependencies.every(depId => loadedModules.includes(depId));
  }
  
  /**
   * Obtiene el siguiente módulo que puede ser cargado
   */
  getNextLoadable(loadedModules = []) {
    for (const instanceId of this.resolvedOrder) {
      if (!loadedModules.includes(instanceId) && this.canLoad(instanceId, loadedModules)) {
        return instanceId;
      }
    }
    return null;
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Genera un reporte del grafo de dependencias
   */
  generateReport() {
    return {
      totalModules: this.moduleGraph.size,
      criticalModules: this.getCriticalModules().length,
      lazyModules: this.getLazyModules().length,
      loadOrder: this.resolvedOrder,
      dependencyTrees: Array.from(this.moduleGraph.keys()).map(id => ({
        instanceId: id,
        tree: this.getDependencyTree(id)
      }))
    };
  }
  
  /**
   * Imprime el grafo de dependencias en consola
   */
  printGraph() {
    console.log('\n📊 Dependency Graph:\n');
    
    this.moduleGraph.forEach((node, instanceId) => {
      console.log(`${instanceId} [${node.instance.module}:${node.instance.scope}]`);
      console.log(`  Priority: ${node.priority}`);
      console.log(`  Lazy: ${node.lazy}`);
      console.log(`  Dependencies: ${node.dependencies.length > 0 ? node.dependencies.join(', ') : 'none'}`);
      console.log('');
    });
    
    console.log(`Load Order: ${this.resolvedOrder.join(' → ')}\n`);
  }
  
  /**
   * Exporta el grafo como JSON
   */
  toJSON() {
    const graph = {};
    
    this.moduleGraph.forEach((node, instanceId) => {
      graph[instanceId] = {
        module: node.instance.module,
        scope: node.instance.scope,
        dependencies: node.dependencies,
        priority: node.priority,
        lazy: node.lazy
      };
    });
    
    return {
      graph,
      loadOrder: this.resolvedOrder,
      critical: this.getCriticalModules(),
      lazy: this.getLazyModules()
    };
  }
}

export default ModuleDependencyResolver;
