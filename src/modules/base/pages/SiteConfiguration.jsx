/**
 * Página de Configuración del Sitio
 * 
 * Panel administrativo para visualizar y gestionar:
 * - Árbol de módulos del sitio
 * - Dependencias entre módulos
 * - Rutas de cada módulo
 * - Configuración global del sitio
 * 
 * NOTA: Este componente está en el módulo base para que cualquier 
 * módulo o site pueda importarlo y usarlo en su contexto.
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Tree, 
  Descriptions, 
  Tag, 
  Space, 
  Button, 
  Table,
  Alert,
  Collapse,
  Typography,
  Row,
  Col,
  Divider,
  Spin
} from 'antd';
import {
  SettingOutlined,
  ApartmentOutlined,
  ApiOutlined,
  SecurityScanOutlined,
  BranchesOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  FileOutlined,
  FileAddOutlined,
  FileExcelOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { policyProcessor } from '../../../zoom/security/policyProcessor.js';
import { loadModuleConfig, getConfigInfo, loadAllModuleConfigs } from '../../../zoom/config/configLoader.js';
import { useModuleRouteBuilder } from '../../../zoom/hooks/useModuleRouteBuilder.js';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

/**
 * Componente reutilizable de Configuración del Sitio
 * @param {Object} props
 * @param {Object} props.siteConfig - Configuración del sitio a visualizar
 * @param {string} props.siteId - ID del sitio (para obtener jerarquía de PolicyProcessor)
 */
const SiteConfigurationPage = ({ siteConfig: propSiteConfig, siteId: propSiteId }) => {
  const [moduleTree, setModuleTree] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  const [siteId, setSiteId] = useState(propSiteId);
  const [allConfigs, setAllConfigs] = useState({});
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  
  // Estados para información adicional del módulo seleccionado
  const [moduleInfo, setModuleInfo] = useState(null);
  const [moduleRoutes, setModuleRoutes] = useState(null);

  // Hook para construcción de rutas de módulos
  const { buildModuleBasePath, buildFullPath, getModuleRouteContext } = useModuleRouteBuilder(siteConfig);

  useEffect(() => {
    // Si se pasa siteConfig como prop, usarlo
    if (propSiteConfig) {
      setSiteConfig(propSiteConfig);
      setSiteId(propSiteConfig.siteId || propSiteId);
    } else {
      // Si no, intentar cargarlo dinámicamente (para zoomy por defecto)
      loadDefaultSiteConfig();
    }
  }, [propSiteConfig, propSiteId]);

  useEffect(() => {
    if (siteConfig && siteId) {
      loadSiteConfiguration();
      loadAllConfigurations();
    }
  }, [siteConfig, siteId]);

  // Cargar información adicional cuando cambia el módulo seleccionado
  useEffect(() => {
    const loadInfo = async () => {
      if (!selectedModule) {
        setModuleInfo(null);
        setModuleRoutes(null);
        return;
      }
      
      const info = await loadModuleInfo(selectedModule.module);
      const routes = await loadModuleRoutes(selectedModule.module);
      setModuleInfo(info);
      setModuleRoutes(routes);
    };
    
    loadInfo();
  }, [selectedModule]);

  /**
   * Cargar configuración por defecto (zoomy)
   */
  const loadDefaultSiteConfig = async () => {
    try {
      // Importación dinámica para evitar dependencias circulares
      const { default: defaultConfig } = await import('../../../sites/zoomy/site.config.js');
      setSiteConfig(defaultConfig);
      setSiteId(defaultConfig.siteId);
    } catch (error) {
      console.error('❌ Error cargando configuración del sitio:', error);
    }
  };

  /**
   * Cargar configuración del sitio y construir árbol
   */
  const loadSiteConfiguration = async () => {
    // Obtener jerarquía desde PolicyProcessor
    const hierarchy = policyProcessor.getHierarchy(siteId);
    setHierarchyData(hierarchy);

    // Construir árbol desde site.config (ahora es async)
    const tree = await buildModuleTree(siteConfig.modules);
    setModuleTree(tree);
  };

  /**
   * Construir árbol jerárquico de módulos con submódulos incorporados
   */
  const buildModuleTree = async (modules) => {
    const rootModules = modules.filter(m => !m.routing?.parentModule);
    
    const buildNode = async (module) => {
      const children = modules.filter(m => m.routing?.parentModule === module.module);
      
      // Cargar configuración del módulo usando ConfigLoader para obtener submódulos
      let incorporatedModules = [];
      let moduleConfig = null;
      
      try {
        // Primero intentar cargar config con ConfigLoader
        const moduleName = module.module || module.name;
        moduleConfig = await loadModuleConfig(moduleName, null, siteId, {
          silent: true,
          throwOnMissing: false
        });
        
        // Si la config tiene submodules definidos, usarlos
        if (moduleConfig && moduleConfig.submodules) {
          incorporatedModules = moduleConfig.submodules;
          console.log(`📦 Submódulos encontrados en config de ${moduleName}:`, incorporatedModules);
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo cargar config de ${module.module}:`, error);
      }
      
      // Si no hay submodules en config, intentar cargar desde index.js (legacy)
      if (incorporatedModules.length === 0) {
        try {
          const moduleInfo = await import(`../../../modules/${module.module}/index.js`);
          if (moduleInfo.default?.modules) {
            incorporatedModules = moduleInfo.default.modules;
            console.log(`📦 Submódulos encontrados en index.js de ${module.module}:`, incorporatedModules);
          }
        } catch (error) {
          // No hay submódulos incorporados
        }
      }

      // Crear nodos hijos: primero los del site.config, luego los incorporados
      const childNodes = await Promise.all(children.map(buildNode));
      
      const incorporatedNodes = incorporatedModules.map(subModName => ({
        title: (
          <Space>
            <Tag color="cyan" style={{ fontSize: '10px' }}>
              Submódulo
            </Tag>
            <strong>{subModName}</strong>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              (de {module.module})
            </Text>
          </Space>
        ),
        key: `${module.id}-incorporated-${subModName}`,
        icon: <AppstoreOutlined style={{ color: '#13c2c2' }} />,
        data: {
          // NO copiar todo el módulo padre, solo lo necesario
          id: `${module.id}-incorporated-${subModName}`,
          module: subModName,
          name: subModName,
          isIncorporated: true,
          parentModuleName: module.module,
          // NO incluir routing del padre, el submódulo tiene su propia ruta
          config: moduleConfig // Guardar config para visualización
        }
      }));
      
      const allChildren = [...childNodes, ...incorporatedNodes];
      
      return {
        title: (
          <Space>
            <Tag color={module.lazy ? 'orange' : 'green'}>
              {module.lazy ? 'Lazy' : 'Eager'}
            </Tag>
            <strong>{module.id}</strong>
            <Text type="secondary">({module.module})</Text>
          </Space>
        ),
        key: module.id,
        icon: <ApartmentOutlined />,
        data: module,
        children: allChildren.length > 0 ? await Promise.all(allChildren) : undefined
      };
    };

    // Construir todos los nodos raíz de forma asíncrona
    return Promise.all(rootModules.map(buildNode));
  };

  /**
   * Manejar selección de módulo en el árbol
   */
  const handleModuleSelect = (selectedKeys, info) => {
    if (selectedKeys.length > 0) {
      setSelectedModule(info.node.data);
    }
  };

  /**
   * Cargar todas las configuraciones de los módulos
   */
  const loadAllConfigurations = async () => {
    if (!siteConfig?.modules) return;
    
    setLoadingConfigs(true);
    try {
      const configs = await loadAllModuleConfigs(siteConfig.modules, siteId);
      setAllConfigs(configs);
      console.log('📦 Todas las configs cargadas:', configs);
    } catch (error) {
      console.error('Error cargando configs:', error);
    } finally {
      setLoadingConfigs(false);
    }
  };

  /**
   * Cargar información adicional del módulo desde su index.js
   */
  const loadModuleInfo = async (moduleName) => {
    try {
      const moduleInfo = await import(`../../../modules/${moduleName}/index.js`);
      return moduleInfo.default;
    } catch (error) {
      console.warn(`No se pudo cargar información de ${moduleName}:`, error);
      return null;
    }
  };

  /**
   * Cargar rutas del módulo desde routes/index.js
   */
  const loadModuleRoutes = async (moduleName) => {
    try {
      const routesModule = await import(`../../../modules/${moduleName}/routes/index.js`);
      return routesModule.routes || routesModule.default;
    } catch (error) {
      console.warn(`No se pudieron cargar rutas de ${moduleName}:`, error);
      return null;
    }
  };

  /**
   * Renderizar árbol de rutas recursivamente
   */
  const renderRouteTree = (routes, basePath = '', level = 0) => {
    if (!routes || !Array.isArray(routes)) return null;

    return routes.map((route, idx) => {
      // Usar buildFullPath del hook para construir la ruta completa
      const fullPath = buildFullPath(basePath, route.path);
      
      const indent = '  '.repeat(level);
      
      return (
        <div key={idx} style={{ marginLeft: level * 20 }}>
          <Space>
            <Text code>{fullPath}</Text>
            {route.componentPath && (
              <Tag color="blue" style={{ fontSize: '11px' }}>
                {route.componentPath.split('/').pop()}
              </Tag>
            )}
            {route.layout && (
              <Tag color="purple" style={{ fontSize: '11px' }}>
                Layout: {route.layout.split('/').pop()}
              </Tag>
            )}
          </Space>
          {route.children && renderRouteTree(route.children, fullPath, level + 1)}
        </div>
      );
    });
  };

  /**
   * Renderizar detalles del módulo seleccionado
   */
  const renderModuleDetails = () => {
    if (!selectedModule) {
      return (
        <Alert
          message="Selecciona un módulo"
          description="Haz clic en un módulo del árbol para ver sus detalles"
          type="info"
          showIcon
        />
      );
    }

    // Usar el hook para construir la ruta base del módulo
    const moduleBasePath = buildModuleBasePath(selectedModule);

    const routesData = selectedModule.publicRoutes?.map((route, idx) => ({
      key: idx,
      route: `${moduleBasePath}/${route}`,
      type: 'Pública',
      description: 'No requiere autenticación'
    })) || [];

    const protectedRoutesData = Object.entries(selectedModule.protectedRoutes || {}).map(([route, config], idx) => ({
      key: `protected-${idx}`,
      route: `${moduleBasePath}/${route}`,
      type: 'Protegida',
      description: config.policies?.map(p => p.roles?.join(', ')).join(' | ') || 'Requiere autenticación'
    }));

    const allRoutes = [...routesData, ...protectedRoutesData];

    const routeColumns = [
      {
        title: 'Ruta',
        dataIndex: 'route',
        key: 'route',
        render: (text) => <Text code>{text}</Text>
      },
      {
        title: 'Tipo',
        dataIndex: 'type',
        key: 'type',
        render: (text) => (
          <Tag color={text === 'Pública' ? 'green' : 'orange'}>
            {text}
          </Tag>
        )
      },
      {
        title: 'Descripción',
        dataIndex: 'description',
        key: 'description',
      },
    ];

    // Detectar si es un submódulo incorporado
    const isIncorporated = selectedModule.isIncorporated;
    const parentModuleName = selectedModule.parentModuleName;

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Alert para submódulos incorporados */}
        {isIncorporated && (
          <Alert
            message={`Submódulo de ${parentModuleName}`}
            description={
              <>
                <Text>Este es un submódulo gestionado por <Text strong>{parentModuleName}</Text>.</Text>
                <br />
                <Text type="secondary">
                  La configuración y rutas se definen en el módulo <Text code>{selectedModule.module}</Text>.
                </Text>
              </>
            }
            type="info"
            showIcon
            icon={<AppstoreOutlined />}
          />
        )}
        
        <Descriptions title="Información del Módulo" bordered column={2}>
          <Descriptions.Item label="ID">{selectedModule.id}</Descriptions.Item>
          <Descriptions.Item label="Módulo">{selectedModule.module}</Descriptions.Item>
          {!isIncorporated && (
            <>
              <Descriptions.Item label="Scope">{selectedModule.scope || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Prioridad">{selectedModule.priority || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Carga">
                <Tag color={selectedModule.lazy ? 'orange' : 'green'}>
                  {selectedModule.lazy ? 'Lazy (Bajo demanda)' : 'Eager (Inmediata)'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ruta Base">
                <Text code>{selectedModule.routes || 'N/A'}</Text>
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="Módulo Padre" span={2}>
            {isIncorporated ? (
              <Tag color="cyan">{parentModuleName}</Tag>
            ) : (
              selectedModule.routing?.parentModule || <Tag>Módulo Raíz</Tag>
            )}
          </Descriptions.Item>
          {!isIncorporated && selectedModule.dependencies && (
            <Descriptions.Item label="Dependencias" span={2}>
              {selectedModule.dependencies?.length > 0 ? (
                <Space wrap>
                  {selectedModule.dependencies.map(dep => (
                    <Tag key={dep} icon={<ApiOutlined />}>{dep}</Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">Sin dependencias</Text>
              )}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Módulos que incorpora (desde index.js) */}
        {moduleInfo?.modules && moduleInfo.modules.length > 0 && (
          <Card title="Módulos que Incorpora" size="small" extra={<Tag color="cyan">Desde index.js</Tag>}>
            <Space wrap>
              {moduleInfo.modules.map(mod => (
                <Tag key={mod} color="blue" icon={<ApartmentOutlined />}>
                  {mod}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

        {/* Layouts configurados */}
        {moduleInfo?.layouts && Object.keys(moduleInfo.layouts).length > 0 && (
          <Card title="Layouts Configurados" size="small" extra={<Tag color="purple">Desde index.js</Tag>}>
            <Descriptions column={1} size="small">
              {Object.entries(moduleInfo.layouts).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  <Text code style={{ fontSize: '11px' }}>{value}</Text>
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}

        {/* Configuración de Autenticación Completa */}
        {selectedModule.auth && Object.keys(selectedModule.auth).length > 0 && (
          <Card title="Configuración de Autenticación" size="small" extra={<Tag color="orange">Desde site.config.js</Tag>}>
            <Descriptions column={2} size="small" bordered>
              {Object.entries(selectedModule.auth).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  <Text code>{value || 'N/A'}</Text>
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}

        {/* Árbol de Rutas Completo */}
        {moduleRoutes && (
          <Card title="Árbol de Rutas Completo" size="small" extra={<Tag color="green">Desde routes/index.js</Tag>}>
            <div style={{ 
              background: '#f5f5f5', 
              padding: 16, 
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {renderRouteTree(moduleRoutes, moduleBasePath)}
            </div>
          </Card>
        )}

        {/* Rutas Públicas y Protegidas (de site.config) */}
        {allRoutes.length > 0 && (
          <Card 
            title={`Rutas Públicas/Protegidas (${allRoutes.length})`} 
            size="small"
            extra={<Tag color="orange">Desde site.config.js</Tag>}
          >
            <Table
              dataSource={allRoutes}
              columns={routeColumns}
              pagination={false}
              size="small"
            />
          </Card>
        )}

        {/* Configuración adicional del módulo */}
        {selectedModule.config && typeof selectedModule.config === 'string' && (
          <Card title="Archivo de Configuración" size="small">
            <Text code>{selectedModule.config}</Text>
          </Card>
        )}
        
        {/* Configuración cargada (objeto) */}
        {selectedModule.config && typeof selectedModule.config === 'object' && (
          <Card title="Configuración del Módulo" size="small" extra={<Tag color="blue">Desde ConfigLoader</Tag>}>
            <Alert
              message="Configuración Base"
              description={
                <>
                  <Text>Este módulo tiene configuración cargada con el sistema de cascada.</Text>
                  <br />
                  <Text type="secondary">
                    Ver pestaña "Configuraciones de Módulos" para detalles completos.
                  </Text>
                </>
              }
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
            />
            <Collapse>
              <Panel header="Ver configuración" key="config">
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4,
                  maxHeight: 300,
                  overflow: 'auto',
                  fontSize: 11
                }}>
                  {JSON.stringify(selectedModule.config, null, 2)}
                </pre>
              </Panel>
            </Collapse>
          </Card>
        )}
      </Space>
    );
  };

  /**
   * Renderizar configuración global del sitio
   */
  const renderGlobalConfig = () => {
    if (!siteConfig) return null;

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Descriptions title="Información del Sitio" bordered column={2}>
          <Descriptions.Item label="Site ID">{siteConfig.siteId}</Descriptions.Item>
          <Descriptions.Item label="Nombre">{siteConfig.name}</Descriptions.Item>
          <Descriptions.Item label="Versión">{siteConfig.version}</Descriptions.Item>
          <Descriptions.Item label="Modo">
            <Tag color={siteConfig.deployment?.mode === 'production' ? 'green' : 'blue'}>
              {siteConfig.deployment?.mode || 'development'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Base URL" span={2}>
            <Text code>{siteConfig.metadata?.baseUrl || 'N/A'}</Text>
          </Descriptions.Item>
        </Descriptions>

        {siteConfig.deployment && (
          <Card title="Deployment" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Build Optimization">
                <Tag color={siteConfig.deployment.buildOptimization ? 'green' : 'red'}>
                  {siteConfig.deployment.buildOptimization ? 'Habilitado' : 'Deshabilitado'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Static Generation">
                <Tag color={siteConfig.deployment.staticGeneration ? 'green' : 'red'}>
                  {siteConfig.deployment.staticGeneration ? 'Habilitado' : 'Deshabilitado'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Módulos Precargados" span={2}>
                <Space wrap>
                  {siteConfig.deployment.preloadModules?.map(mod => (
                    <Tag key={mod} color="blue">{mod}</Tag>
                  )) || <Text type="secondary">Ninguno</Text>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Módulos Lazy" span={2}>
                <Space wrap>
                  {siteConfig.deployment.lazyModules?.map(mod => (
                    <Tag key={mod} color="orange">{mod}</Tag>
                  )) || <Text type="secondary">Ninguno</Text>}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {siteConfig.features && (
          <Card title="Features" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Tag color={siteConfig.features.enableHotReload ? 'green' : 'default'}>
                  Hot Reload: {siteConfig.features.enableHotReload ? 'ON' : 'OFF'}
                </Tag>
              </Col>
              <Col span={12}>
                <Tag color={siteConfig.features.enableDevTools ? 'green' : 'default'}>
                  Dev Tools: {siteConfig.features.enableDevTools ? 'ON' : 'OFF'}
                </Tag>
              </Col>
              <Col span={12}>
                <Tag color={siteConfig.features.enableAnalytics ? 'green' : 'default'}>
                  Analytics: {siteConfig.features.enableAnalytics ? 'ON' : 'OFF'}
                </Tag>
              </Col>
              <Col span={12}>
                <Tag color={siteConfig.features.enableErrorReporting ? 'green' : 'default'}>
                  Error Reporting: {siteConfig.features.enableErrorReporting ? 'ON' : 'OFF'}
                </Tag>
              </Col>
            </Row>
          </Card>
        )}

        {siteConfig.security && (
          <Card title="Seguridad" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Tag color={siteConfig.security.enableCSRF ? 'green' : 'default'}>
                  CSRF Protection: {siteConfig.security.enableCSRF ? 'ON' : 'OFF'}
                </Tag>
              </Col>
              <Col span={12}>
                <Tag color={siteConfig.security.enableXSSProtection ? 'green' : 'default'}>
                  XSS Protection: {siteConfig.security.enableXSSProtection ? 'ON' : 'OFF'}
                </Tag>
              </Col>
              <Col span={24}>
                <Paragraph>
                  <Text strong>Orígenes Permitidos:</Text>
                  <ul>
                    {siteConfig.security.allowedOrigins?.map((origin, idx) => (
                      <li key={idx}><Text code>{origin}</Text></li>
                    )) || <li><Text type="secondary">No configurado</Text></li>}
                  </ul>
                </Paragraph>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    );
  };

  /**
   * Renderizar flujo de carga de la aplicación
   */
  const renderLoadingFlow = () => {
    if (!siteConfig) return null;

    const loadingSteps = [
      {
        order: 1,
        phase: 'Inicialización',
        file: 'src/main.jsx',
        description: 'Punto de entrada de la aplicación',
        children: [
          { file: 'src/App.jsx', description: 'Componente principal' },
          { file: 'src/zoom/routing/systemLoader.js', description: 'Inicialización del sistema' }
        ]
      },
      {
        order: 2,
        phase: 'Detección de Site',
        file: 'src/zoom/routing/systemLoader.js',
        description: 'Detecta el site actual desde la URL',
        children: [
          { file: `src/sites/${siteConfig.siteId}/site.config.js`, description: 'Configuración del site' }
        ]
      },
      {
        order: 3,
        phase: 'Carga de Módulos',
        file: 'src/zoom/routing/systemLoader.js',
        description: `Carga módulos en orden de prioridad`,
        children: siteConfig.modules
          .sort((a, b) => a.priority - b.priority)
          .map(module => ({
            file: `src/modules/${module.module}/index.js`,
            description: `${module.id} (priority: ${module.priority})`,
            badge: module.lazy ? 'Lazy' : 'Eager',
            badgeColor: module.lazy ? 'orange' : 'green',
            subChildren: [
              { 
                file: `src/modules/${module.module}/routes/index.js`, 
                description: 'Definición de rutas',
                optional: false 
              },
              { 
                file: module.config || 'N/A', 
                description: 'Configuración del módulo',
                optional: !module.config 
              }
            ]
          }))
      },
      {
        order: 4,
        phase: 'Registro de Rutas',
        file: 'src/zoom/routing/routesRegistry.js',
        description: 'Registra todas las rutas de los módulos',
        children: []
      },
      {
        order: 5,
        phase: 'Inicialización de Políticas',
        file: 'src/zoom/security/policyProcessor.js',
        description: 'Configura políticas de seguridad y jerarquía de módulos',
        children: []
      }
    ];

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="Flujo de Carga de la Aplicación"
          description="Orden cronológico de carga desde main.jsx hasta la inicialización completa del sistema"
          type="info"
          showIcon
        />

        <Collapse accordion>
          {loadingSteps.map((step) => (
            <Panel 
              header={
                <Space>
                  <Tag color="blue">{step.order}</Tag>
                  <strong>{step.phase}</strong>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {step.file}
                  </Text>
                </Space>
              } 
              key={step.order}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Text>{step.description}</Text>
                
                {step.children && step.children.length > 0 && (
                  <div style={{ marginLeft: 20, marginTop: 10 }}>
                    {step.children.map((child, idx) => (
                      <div key={idx} style={{ marginBottom: 12 }}>
                        <Space direction="vertical" size={2}>
                          <Space>
                            {child.badge && (
                              <Tag color={child.badgeColor} style={{ fontSize: '11px' }}>
                                {child.badge}
                              </Tag>
                            )}
                            <Text code style={{ fontSize: '12px' }}>
                              {child.file}
                            </Text>
                            {child.optional && (
                              <Tag color="default" style={{ fontSize: '10px' }}>opcional</Tag>
                            )}
                          </Space>
                          <Text type="secondary" style={{ fontSize: '11px', marginLeft: child.badge ? 42 : 0 }}>
                            {child.description}
                          </Text>
                        </Space>

                        {/* Sub-children (routes, config) */}
                        {child.subChildren && (
                          <div style={{ marginLeft: 20, marginTop: 8 }}>
                            {child.subChildren.map((subChild, subIdx) => (
                              <div key={subIdx} style={{ marginBottom: 6 }}>
                                <Space>
                                  <Text code style={{ fontSize: '11px', color: subChild.optional ? '#999' : 'inherit' }}>
                                    {subChild.file}
                                  </Text>
                                  {subChild.optional && (
                                    <Tag color="default" style={{ fontSize: '10px' }}>opcional</Tag>
                                  )}
                                </Space>
                                <br />
                                <Text type="secondary" style={{ fontSize: '10px', marginLeft: 10 }}>
                                  {subChild.description}
                                </Text>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Space>
            </Panel>
          ))}
        </Collapse>

        <Divider>Módulos Incorporados por Admin</Divider>

        <Alert
          message="Submódulos de Admin"
          description="Admin incorpora internamente otros módulos que no aparecen en site.config.js pero se cargan cuando admin se instala"
          type="warning"
          showIcon
        />

        {moduleInfo?.modules && moduleInfo.modules.length > 0 && (
          <Card title="Módulos que Admin Incorpora Internamente" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {moduleInfo.modules.map(mod => (
                <Card 
                  key={mod} 
                  size="small" 
                  type="inner"
                  title={
                    <Space>
                      <Tag color="cyan">{mod}</Tag>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Cargado cuando admin se instala
                      </Text>
                    </Space>
                  }
                >
                  <Space direction="vertical" size={4}>
                    <Text code style={{ fontSize: '11px' }}>
                      src/modules/{mod}/index.js
                    </Text>
                    <Text code style={{ fontSize: '11px' }}>
                      src/modules/{mod}/routes/index.js
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      📍 Nota: Estos módulos NO aparecen en site.config.js porque son submódulos internos de admin
                    </Text>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        )}
      </Space>
    );
  };

  /**
   * Renderizar reglas de instancias (para módulos con múltiples instancias)
   */
  const renderInstanceRules = () => {
    if (!siteConfig?.instanceRules) {
      return (
        <Alert
          message="Sin reglas de instancia configuradas"
          description="No hay reglas de interacción entre múltiples instancias definidas en este sitio"
          type="info"
          showIcon
        />
      );
    }

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="Reglas de Interacción entre Instancias"
          description="Define cómo múltiples instancias del mismo módulo interactúan entre sí"
          type="info"
          showIcon
        />

        {Object.entries(siteConfig.instanceRules).map(([moduleName, rules]) => (
          <Card key={moduleName} title={`Módulo: ${moduleName}`} size="small">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Múltiples Instancias">
                <Tag color={rules.allowMultiple ? 'green' : 'red'}>
                  {rules.allowMultiple ? 'Permitido' : 'No Permitido'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Aislamiento de Sesión">
                <Tag color={rules.sessionIsolation ? 'blue' : 'default'}>
                  {rules.sessionIsolation ? 'Habilitado' : 'Deshabilitado'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Estrategia de Sesión" span={2}>
                <Tag color="purple">{rules.sessionStrategy}</Tag>
              </Descriptions.Item>
            </Descriptions>

            {rules.sessions && (
              <>
                <Divider>Configuración de Sesiones por Scope</Divider>
                <Collapse>
                  {Object.entries(rules.sessions).map(([scope, sessionConfig]) => (
                    <Panel header={`Scope: ${scope}`} key={scope}>
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="Storage">
                          <Tag>{sessionConfig.storage}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Key">
                          <Text code>{sessionConfig.key}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Timeout">
                          {sessionConfig.timeout}s ({Math.floor(sessionConfig.timeout / 60)} min)
                        </Descriptions.Item>
                        <Descriptions.Item label="Sliding">
                          <Tag color={sessionConfig.sliding ? 'green' : 'default'}>
                            {sessionConfig.sliding ? 'Sí' : 'No'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Secure">
                          <Tag color={sessionConfig.secure ? 'green' : 'default'}>
                            {sessionConfig.secure ? 'Sí' : 'No'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="SameSite">
                          <Tag>{sessionConfig.sameSite}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Prioridad">
                          <Tag color={
                            sessionConfig.priority === 'high' ? 'red' :
                            sessionConfig.priority === 'medium' ? 'orange' : 'default'
                          }>
                            {sessionConfig.priority}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Compartir con">
                          {sessionConfig.shareWith?.length > 0 ? (
                            <Space wrap>
                              {sessionConfig.shareWith.map(s => <Tag key={s}>{s}</Tag>)}
                            </Space>
                          ) : (
                            <Text type="secondary">Ninguno (aislada)</Text>
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                    </Panel>
                  ))}
                </Collapse>
              </>
            )}
          </Card>
        ))}
      </Space>
    );
  };

  // Renderizar configuraciones de módulos con cascada
  const renderConfigurations = () => {
    if (loadingConfigs) {
      return (
        <Card>
          <Spin tip="Cargando configuraciones de módulos...">
            <div style={{ minHeight: 200 }} />
          </Spin>
        </Card>
      );
    }

    const modules = Object.keys(allConfigs);
    
    if (modules.length === 0) {
      return (
        <Alert
          message="No hay configuraciones cargadas"
          description="Los módulos no tienen archivos de configuración o aún no se han cargado."
          type="info"
          showIcon
        />
      );
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Sistema de Configuración Cascada"
          description={
            <>
              <Text>Este sistema implementa una jerarquía de 3 niveles:</Text>
              <ol style={{ marginTop: 8 }}>
                <li><Text strong>Base:</Text> Configuración por defecto del módulo en <Text code>src/modules/{'{módulo}'}/config/</Text></li>
                <li><Text strong>Override de Padre:</Text> El módulo padre puede sobrescribir valores en <Text code>src/modules/{'{padre}'}/config/{'{módulo}'}.config.js</Text></li>
                <li><Text strong>Override de Sitio:</Text> El sitio puede sobrescribir cualquier valor en <Text code>src/{'{sitio}'}/config/{'{módulo}'}.config.js</Text></li>
              </ol>
            </>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {modules.map(moduleName => {
          const configData = allConfigs[moduleName];
          const { config, _meta } = configData;

          return (
            <Card
              key={moduleName}
              title={
                <Space>
                  <FileTextOutlined />
                  <Text strong>Módulo: {moduleName}</Text>
                  {_meta?.parent && (
                    <Tag color="blue">Padre: {_meta.parent}</Tag>
                  )}
                </Space>
              }
              size="small"
            >
              <Collapse accordion>
                {/* Configuración Final Merged */}
                <Panel
                  header={
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text strong>Configuración Final (Merged)</Text>
                      <Tag color="success">Activa</Tag>
                    </Space>
                  }
                  key="merged"
                >
                  <pre style={{ 
                    background: '#f0f9ff', 
                    padding: 16, 
                    borderRadius: 4,
                    border: '1px solid #91d5ff',
                    maxHeight: 400,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </Panel>

                {/* Base Config */}
                {_meta?.sources?.base && (
                  <Panel
                    header={
                      <Space>
                        <FileOutlined style={{ color: '#1890ff' }} />
                        <Text>Base Config</Text>
                        <Tag color="blue">Nivel 1</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {_meta.sources.base}
                        </Text>
                      </Space>
                    }
                    key="base"
                  >
                    <pre style={{ 
                      background: '#f5f5f5', 
                      padding: 16, 
                      borderRadius: 4,
                      maxHeight: 300,
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(_meta.baseConfig || {}, null, 2)}
                    </pre>
                  </Panel>
                )}

                {/* Parent Override */}
                {_meta?.sources?.parentOverride && (
                  <Panel
                    header={
                      <Space>
                        <FileAddOutlined style={{ color: '#faad14' }} />
                        <Text>Override del Padre</Text>
                        <Tag color="orange">Nivel 2</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {_meta.sources.parentOverride}
                        </Text>
                      </Space>
                    }
                    key="parent"
                  >
                    <Alert
                      message="Valores sobrescritos por el módulo padre"
                      type="warning"
                      showIcon
                      style={{ marginBottom: 12 }}
                    />
                    <pre style={{ 
                      background: '#fffbe6', 
                      padding: 16, 
                      borderRadius: 4,
                      border: '1px solid #ffe58f',
                      maxHeight: 300,
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(_meta.parentOverride || {}, null, 2)}
                    </pre>
                  </Panel>
                )}

                {/* Site Override */}
                {_meta?.sources?.siteOverride && (
                  <Panel
                    header={
                      <Space>
                        <FileExcelOutlined style={{ color: '#f5222d' }} />
                        <Text>Override del Sitio</Text>
                        <Tag color="red">Nivel 3</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {_meta.sources.siteOverride}
                        </Text>
                      </Space>
                    }
                    key="site"
                  >
                    <Alert
                      message="Valores sobrescritos por el sitio (máxima prioridad)"
                      type="error"
                      showIcon
                      style={{ marginBottom: 12 }}
                    />
                    <pre style={{ 
                      background: '#fff1f0', 
                      padding: 16, 
                      borderRadius: 4,
                      border: '1px solid #ffccc7',
                      maxHeight: 300,
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(_meta.siteOverride || {}, null, 2)}
                    </pre>
                  </Panel>
                )}

                {/* Metadata */}
                <Panel
                  header={
                    <Space>
                      <InfoCircleOutlined style={{ color: '#722ed1' }} />
                      <Text type="secondary">Metadata de Carga</Text>
                    </Space>
                  }
                  key="metadata"
                >
                  <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="Módulo">{_meta?.module || moduleName}</Descriptions.Item>
                    <Descriptions.Item label="Sitio">{_meta?.site || siteId}</Descriptions.Item>
                    {_meta?.parent && (
                      <Descriptions.Item label="Módulo Padre">{_meta.parent}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="Fuentes Encontradas" span={2}>
                      <Space direction="vertical">
                        {_meta?.sources?.base && (
                          <Tag color="blue" icon={<CheckOutlined />}>Base Config</Tag>
                        )}
                        {_meta?.sources?.parentOverride && (
                          <Tag color="orange" icon={<CheckOutlined />}>Parent Override</Tag>
                        )}
                        {_meta?.sources?.siteOverride && (
                          <Tag color="red" icon={<CheckOutlined />}>Site Override</Tag>
                        )}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Panel>
              </Collapse>
            </Card>
          );
        })}
      </Space>
    );
  };

  if (!siteConfig) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Cargando configuración..."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <SettingOutlined /> Configuración del Sitio: {siteConfig.name}
      </Title>
      <Paragraph>
        Visualiza y gestiona la configuración global del sitio, el árbol de módulos,
        sus dependencias y rutas.
      </Paragraph>

      <Tabs defaultActiveKey="tree" size="large">
        <TabPane
          tab={<span><ApartmentOutlined />Árbol de Módulos</span>}
          key="tree"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Módulos del Sitio" size="small">
                <Tree
                  showIcon
                  showLine
                  defaultExpandAll
                  treeData={moduleTree}
                  onSelect={handleModuleSelect}
                />
              </Card>
            </Col>
            <Col span={16}>
              <Card title="Detalles del Módulo" size="small">
                {renderModuleDetails()}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={<span><FileTextOutlined />Configuración Global</span>}
          key="global"
        >
          {renderGlobalConfig()}
        </TabPane>

        <TabPane
          tab={<span><BranchesOutlined />Reglas de Instancias</span>}
          key="instances"
        >
          {renderInstanceRules()}
        </TabPane>

        <TabPane
          tab={<span><FileTextOutlined />Configuraciones de Módulos</span>}
          key="configs"
        >
          {renderConfigurations()}
        </TabPane>

        <TabPane
          tab={<span><SecurityScanOutlined />Jerarquía de Políticas</span>}
          key="policies"
        >
          <Card title="Jerarquía Registrada en PolicyProcessor">
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
              {JSON.stringify(hierarchyData, null, 2)}
            </pre>
          </Card>
        </TabPane>

        <TabPane
          tab={<span><FileTextOutlined />Flujo de Carga</span>}
          key="loading-flow"
        >
          {renderLoadingFlow()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SiteConfigurationPage;
