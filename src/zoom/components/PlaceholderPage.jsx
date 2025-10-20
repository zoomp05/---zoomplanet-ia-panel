import React from 'react';
import { Card, Empty, Button, Space } from 'antd';
import { 
  FileTextOutlined,
  RocketOutlined 
} from '@ant-design/icons';

/**
 * Componente placeholder para páginas en desarrollo
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.moduleName - Nombre del módulo
 * @param {string} props.pageName - Nombre de la página
 * @param {ReactNode} props.icon - Icono personalizado
 * @param {string} props.description - Descripción personalizada
 */
const PlaceholderPage = ({ 
  moduleName = 'Módulo', 
  pageName = 'Página',
  icon = <FileTextOutlined style={{ fontSize: 64, color: '#1890ff' }} />,
  description
}) => {
  return (
    <div>
      <Card>
        <Empty
          image={icon}
          imageStyle={{ height: 80 }}
          description={
            <Space direction="vertical" size="middle">
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>{moduleName}</h2>
                <h3 style={{ margin: '8px 0', color: '#666' }}>{pageName}</h3>
              </div>
              <p style={{ color: '#999' }}>
                {description || `Esta página está en desarrollo. La funcionalidad de ${moduleName} - ${pageName} será implementada próximamente.`}
              </p>
            </Space>
          }
        >
          <Space>
            <Button type="primary" icon={<RocketOutlined />}>
              Comenzar Implementación
            </Button>
            <Button>Ver Documentación</Button>
          </Space>
        </Empty>
      </Card>
    </div>
  );
};

export default PlaceholderPage;