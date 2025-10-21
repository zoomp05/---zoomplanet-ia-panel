import React from 'react';
import { Card, Empty, Button } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

/**
 * Dashboard del módulo de Créditos (Placeholder)
 * TODO: Implementar funcionalidad completa
 */
const CreditsDashboard = () => {
  return (
    <div>
      <Card>
        <Empty
          image={<CreditCardOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
          description={
            <div>
              <h3>Módulo de Créditos</h3>
              <p>Dashboard de servicios crediticios en desarrollo</p>
            </div>
          }
        >
          <Button type="primary">Comenzar Implementación</Button>
        </Empty>
      </Card>
    </div>
  );
};

export default CreditsDashboard;