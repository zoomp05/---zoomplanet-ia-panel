import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Card, Row, Col, Button, Tag, Space, Descriptions, Badge, Divider, Statistic, Modal, message } from 'antd';
import {
  CloudServerOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { GET_PRODUCTS } from '../../commerce/apollo/product';
import { useNavigate } from 'react-router';

/**
 * Página de Planes de Hosting
 * Muestra los productos tipo HOSTING_PLAN del módulo commerce
 * y permite gestionarlos y crear nuevas cuentas basadas en estos planes
 */
const HostingPlans = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Query para obtener productos de tipo HOSTING_PLAN
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      filter: {
        type: 'HOSTING_PLAN',
        showDeleted: false
      },
      limit: 50,
      offset: 0
    },
    fetchPolicy: 'cache-and-network',
  });

  const plans = data?.products?.edges || [];

  // Handler para crear cuenta basada en un plan
  const handleCreateAccount = (plan) => {
    Modal.confirm({
      title: 'Crear Nueva Cuenta de Hosting',
      content: `¿Deseas crear una nueva cuenta con el plan ${plan.name}?`,
      okText: 'Crear Cuenta',
      cancelText: 'Cancelar',
      onOk: () => {
        navigate(`/admin/hosting/accounts/new?planId=${plan.id}`);
      }
    });
  };

  // Handler para editar plan (redirige a commerce)
  const handleEditPlan = (plan) => {
    Modal.confirm({
      title: 'Editar Plan en Commerce',
      content: `Serás redirigido al módulo de commerce para editar el plan ${plan.name}. ¿Continuar?`,
      okText: 'Ir a Commerce',
      cancelText: 'Cancelar',
      onOk: () => {
        navigate(`/admin/commerce?editProduct=${plan.id}`);
      }
    });
  };

  // Renderizar características del plan
  const renderPlanFeatures = (metadata) => {
    if (!metadata?.hosting) return null;

    const { hosting } = metadata;
    
    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><ThunderboltOutlined /> CPU</span>
          <strong>{hosting.cpu?.cores} cores ({hosting.cpu?.type})</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><DatabaseOutlined /> RAM</span>
          <strong>{hosting.ram?.amount} {hosting.ram?.unit}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><DatabaseOutlined /> Storage</span>
          <strong>{hosting.storage?.amount} {hosting.storage?.unit} {hosting.storage?.type}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><GlobalOutlined /> Bandwidth</span>
          <strong>
            {hosting.bandwidth?.unlimited ? 'Unlimited' : `${hosting.bandwidth?.amount} ${hosting.bandwidth?.unit}`}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><GlobalOutlined /> Websites</span>
          <strong>{hosting.websites || 1}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><DatabaseOutlined /> Databases</span>
          <strong>{hosting.databases || 1}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><MailOutlined /> Email Accounts</span>
          <strong>{hosting.emailAccounts || 0}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><SafetyCertificateOutlined /> Free SSL</span>
          <strong>{hosting.freeSSL ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}</strong>
        </div>
        {hosting.backup?.enabled && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔄 Backup</span>
            <strong>{hosting.backup.frequency}</strong>
          </div>
        )}
      </Space>
    );
  };

  // Renderizar precios
  const renderPricing = (pricing) => {
    if (!pricing || pricing.length === 0) return <span>N/A</span>;

    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {pricing.map((price, index) => {
          const intervalLabels = {
            'ONE_TIME': 'Pago Único',
            'MONTHLY': 'Mensual',
            'ANNUAL': 'Anual',
            'BIENNIAL': 'Bienal'
          };

          return (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="blue">{intervalLabels[price.interval]}</Tag>
              <strong style={{ fontSize: '16px' }}>
                ${price.amount.toFixed(2)} {price.currency}
              </strong>
            </div>
          );
        })}
      </Space>
    );
  };

  if (error) {
    message.error('Error al cargar los planes de hosting');
    return null;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>
          <CloudServerOutlined /> Planes de Hosting
        </h1>
        <Space>
          <Button onClick={() => refetch()}>Actualizar</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/commerce')}
          >
            Crear Plan en Commerce
          </Button>
        </Space>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total de Planes"
              value={plans.length}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Planes Activos"
              value={plans.filter(p => p.isActive).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Cuentas Usando Planes"
              value={0}
              suffix="/ TODO"
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Grid de planes */}
      <Row gutter={[16, 16]}>
        {loading ? (
          <Col span={24}>
            <Card loading />
          </Col>
        ) : plans.length === 0 ? (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CloudServerOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', color: '#8c8c8c' }}>
                  No hay planes de hosting configurados
                </p>
                <Button type="primary" onClick={() => navigate('/admin/commerce')}>
                  Crear Primer Plan
                </Button>
              </div>
            </Card>
          </Col>
        ) : (
          plans.map((plan) => (
            <Col key={plan.id} xs={24} sm={12} lg={8} xl={6}>
              <Card
                hoverable
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{plan.name}</span>
                    <Tag color={plan.isActive ? 'success' : 'default'}>
                      {plan.isActive ? 'Activo' : 'Inactivo'}
                    </Tag>
                  </div>
                }
                extra={
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined />}
                    onClick={() => handleEditPlan(plan)}
                  />
                }
                actions={[
                  <Button 
                    key="create"
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleCreateAccount(plan)}
                  >
                    Crear Cuenta
                  </Button>
                ]}
              >
                {/* SKU */}
                <div style={{ marginBottom: '12px' }}>
                  <Tag>{plan.sku}</Tag>
                </div>

                {/* Descripción */}
                {plan.description && (
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#8c8c8c', 
                    marginBottom: '16px',
                    minHeight: '40px'
                  }}>
                    {plan.description}
                  </p>
                )}

                <Divider style={{ margin: '12px 0' }}>Recursos</Divider>

                {/* Características del plan */}
                {renderPlanFeatures(plan.metadata)}

                <Divider style={{ margin: '12px 0' }}>Precios</Divider>

                {/* Precios */}
                {renderPricing(plan.pricing)}

                {/* Features adicionales */}
                {plan.features && plan.features.length > 0 && (
                  <>
                    <Divider style={{ margin: '12px 0' }}>Features</Divider>
                    <ul style={{ fontSize: '12px', paddingLeft: '20px', marginBottom: 0 }}>
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>{feature.name}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default HostingPlans;
