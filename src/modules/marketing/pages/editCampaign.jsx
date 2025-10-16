// pages/editCampaign.jsx
import React from 'react';
import { useParams, Link } from 'react-router';
import { Card, Button, Result, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useMarketingCampaign } from '../hooks/useMarketingCampaigns';

const EditCampaignPage = () => {
  const { id } = useParams();
  const { campaign, loading, error } = useMarketingCampaign(id);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <Alert
        message="Error al cargar la campaña"
        description={error?.message || 'Campaña no encontrada'}
        type="error"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Card>
        <Result
          icon={<EditOutlined style={{ color: '#1890ff' }} />}
          title="Formulario de Edición"
          subTitle="El formulario de edición de campañas estará disponible próximamente."
          extra={[
            <Link 
              key="back"
              to={`/marketing/campaigns/${campaign.id}`}
            >
              <Button 
                type="primary" 
                icon={<ArrowLeftOutlined />}
              >
                Ver Detalles de la Campaña
              </Button>
            </Link>,
            <Link key="list" to="/marketing/campaigns">
              <Button>
                Volver a la Lista
              </Button>
            </Link>
          ]}
        />
        
        <Card 
          title={`Información Actual - ${campaign.name}`}
          style={{ marginTop: '24px' }}
          size="small"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <strong>Nombre:</strong><br />
              {campaign.name}
            </div>
            <div>
              <strong>Estado:</strong><br />
              {campaign.status}
            </div>
            <div>
              <strong>Tipo:</strong><br />
              {campaign.type}
            </div>
            {campaign.budget?.allocated && (
              <div>
                <strong>Presupuesto:</strong><br />
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: campaign.budget.currency || 'USD'
                }).format(campaign.budget.allocated)}
              </div>
            )}
            {campaign.description && (
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Descripción:</strong><br />
                {campaign.description}
              </div>
            )}
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default EditCampaignPage;
