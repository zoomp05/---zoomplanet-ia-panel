/**
 * EJEMPLO DE USO - useModuleNavigation Hook
 * 
 * Este archivo muestra cómo usar el hook useModuleNavigation
 * para mantener la jerarquía en la navegación de módulos
 */

import React from 'react';
import { Button, Space, Typography } from 'antd';
import { useModuleNavigation } from '@hooks/useModuleNavigation';

const { Title, Paragraph, Text } = Typography;

const ModuleNavigationExample = () => {
  const { 
    navigateContextual, 
    getContextualLink, 
    buildContextualUrl,
    routeContext,
    isActive 
  } = useModuleNavigation();

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>useModuleNavigation - Ejemplos de Uso</Title>
      
      <Paragraph>
        <Text strong>Contexto actual:</Text>
        <pre>{JSON.stringify(routeContext, null, 2)}</pre>
      </Paragraph>

      <Title level={3}>1. Navegación Contextual Automática</Title>
      <Paragraph>
        El hook detecta automáticamente el contexto y construye URLs apropiadas:
      </Paragraph>
      <Space wrap>
        <Button onClick={() => navigateContextual('create')}>
          Crear (auto: {buildContextualUrl('create')})
        </Button>
        <Button onClick={() => navigateContextual('list')}>
          Listar (auto: {buildContextualUrl('list')})
        </Button>
        <Button onClick={() => navigateContextual('settings')}>
          Configuración (auto: {buildContextualUrl('settings')})
        </Button>
      </Space>

      <Title level={3}>2. Navegación con Scope Específico</Title>
      <Paragraph>
        Puedes especificar el alcance de la navegación:
      </Paragraph>
      <Space wrap>
        <Button onClick={() => navigateContextual('create', 'module')}>
          Crear en Módulo ({buildContextualUrl('create', 'module')})
        </Button>
        <Button onClick={() => navigateContextual('admin/users', 'site')}>
          Usuarios en Sitio ({buildContextualUrl('admin/users', 'site')})
        </Button>
        <Button onClick={() => navigateContextual('/external/page', 'absolute')}>
          Página Absoluta ({buildContextualUrl('/external/page', 'absolute')})
        </Button>
      </Space>

      <Title level={3}>3. Enlaces Contextuales</Title>
      <Paragraph>
        Para crear enlaces que respeten la jerarquía:
      </Paragraph>
      <Space direction="vertical">
        <a href={getContextualLink('edit/123')}>
          Editar Item 123 ({getContextualLink('edit/123')})
        </a>
        <a href={getContextualLink('reports', 'module')}>
          Ver Reportes ({getContextualLink('reports', 'module')})
        </a>
      </Space>

      <Title level={3}>4. Estado Activo</Title>
      <Paragraph>
        Verificar si una ruta está activa:
      </Paragraph>
      <Space direction="vertical">
        <Text>¿Está activa 'create'? {isActive('create') ? '✅' : '❌'}</Text>
        <Text>¿Está activa 'list'? {isActive('list') ? '✅' : '❌'}</Text>
      </Space>

      <Title level={3}>5. Casos de Uso Comunes</Title>
      <Paragraph>
        <Text strong>En una lista de items:</Text>
      </Paragraph>
      <pre>{`
// En lugar de:
onClick={() => navigate(\`/newsletter/edit/\${id}\`)}

// Usar:
onClick={() => navigateContextual(\`edit/\${id}\`)}
// Resultado automático: /sitio/newsletter/edit/123 o /sitio/proyecto/newsletter/edit/123
      `}</pre>

      <Paragraph>
        <Text strong>Para botones de acción:</Text>
      </Paragraph>
      <pre>{`
// En lugar de:
onClick={() => navigate('/newsletter/create')}

// Usar:
onClick={() => navigateContextual('create')}
// Mantiene automáticamente la jerarquía actual
      `}</pre>

      <Paragraph>
        <Text strong>Para enlaces de navegación:</Text>
      </Paragraph>
      <pre>{`
// En lugar de:
<a href="/newsletter/settings">Configuración</a>

// Usar:
<a href={getContextualLink('settings')}>Configuración</a>
// Se adapta automáticamente al contexto
      `}</pre>

      <Title level={3}>6. Beneficios</Title>
      <ul>
        <li>✅ <strong>Automático:</strong> No necesitas conocer la ruta completa</li>
        <li>✅ <strong>Jerárquico:</strong> Respeta la estructura de módulos y submódulos</li>
        <li>✅ <strong>Flexible:</strong> Puedes especificar el scope cuando sea necesario</li>
        <li>✅ <strong>Consistente:</strong> Todas las navegaciones mantienen el contexto</li>
        <li>✅ <strong>Mantenible:</strong> Si cambias la estructura, las rutas se adaptan</li>
      </ul>
    </div>
  );
};

export default ModuleNavigationExample;
