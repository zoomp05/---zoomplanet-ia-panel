/**
 * Listado de Campañas de Google Ads
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag,
  Input,
  Row,
  Col,
  Typography,
  Statistic,
  Select,
  message,
  Modal,
  Alert
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  SyncOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CAMPAIGNS, SYNC_CAMPAIGN_METRICS, IMPORT_CAMPAIGNS_FROM_GOOGLE_ADS } from '../../graphql/campaigns';
import { GET_CONNECTED_ACCOUNTS } from '../../graphql/accounts';

const { Title } = Typography;
const { Option } = Select;

const CampaignsList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Query para obtener cuentas conectadas
  const { data: accountsData, loading: loadingAccounts } = useQuery(GET_CONNECTED_ACCOUNTS);

  // Query para obtener campañas
  const { 
    data: campaignsData, 
    loading: loadingCampaigns, 
    refetch: refetchCampaigns,
    error: campaignsError
  } = useQuery(GET_CAMPAIGNS, {
    variables: {
      filters: {
        ...(selectedAccount && { accountId: selectedAccount }),
        ...(searchText && { search: searchText })
      },
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize
    },
    fetchPolicy: 'network-only'
  });

  // Mutation para sincronizar métricas
  const [syncMetrics] = useMutation(SYNC_CAMPAIGN_METRICS);

  // Mutation para importar campañas desde Google Ads
  const [importCampaigns, { loading: importing }] = useMutation(IMPORT_CAMPAIGNS_FROM_GOOGLE_ADS);

  // Actualizar paginación cuando cambian los datos
  useEffect(() => {
    if (campaignsData?.gAdsCampaigns?.pageInfo) {
      setPagination(prev => ({
        ...prev,
        total: campaignsData.gAdsCampaigns.pageInfo.totalItems
      }));
    }
  }, [campaignsData]);

  // Obtener cuentas principales y aplanar subcuentas
  const mainAccounts = (accountsData?.gAdsAccounts?.edges?.map(edge => edge.node) || [])
    .filter(account => !account.managerAccount);
  
  // Debug: verificar datos de cuentas
  useEffect(() => {
    console.log('📊 Accounts Data:', {
      accountsData,
      mainAccounts,
      edges: accountsData?.gAdsAccounts?.edges,
      totalCount: accountsData?.gAdsAccounts?.totalCount
    });
  }, [accountsData]);
  
  // Crear lista plana de todas las cuentas (principales + subcuentas)
  const allAccounts = mainAccounts.reduce((acc, account) => {
    // Agregar cuenta principal
    acc.push({
      ...account,
      isMainAccount: true
    });
    
    // Agregar subcuentas si existen
    if (account.subAccounts && account.subAccounts.length > 0) {
      account.subAccounts.forEach(subAccount => {
        acc.push({
          ...subAccount,
          isSubAccount: true,
          parentAccountId: account._id,
          parentAccountName: account.name
        });
      });
    }
    
    return acc;
  }, []);

  const campaigns = campaignsData?.gAdsCampaigns?.edges?.map(edge => edge.node) || [];
  const pageInfo = campaignsData?.gAdsCampaigns?.pageInfo;

  // Handler para cambiar de cuenta
  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
    setPagination({ ...pagination, current: 1 });
  };

  // Handler para sincronizar una campaña
  const handleSyncCampaign = async (campaignId) => {
    try {
      const { data } = await syncMetrics({
        variables: { id: campaignId }
      });
      
      if (data?.syncGAdsCampaignMetrics?.success) {
        message.success('Métricas sincronizadas correctamente');
        refetchCampaigns();
      } else {
        message.error(data?.syncGAdsCampaignMetrics?.message || 'Error al sincronizar');
      }
    } catch (error) {
      console.error('Error syncing campaign:', error);
      message.error('Error al sincronizar la campaña');
    }
  };

  // Handler para importar campañas desde Google Ads
  const handleImportCampaigns = async () => {
    if (!selectedAccount) {
      message.warning('Por favor selecciona una cuenta primero');
      return;
    }

    try {
      const { data } = await importCampaigns({
        variables: {
          accountId: selectedAccount,
          projectId: 'current-project-id' // TODO: Obtener del contexto
        }
      });

      if (data?.importCampaignsFromGoogleAds?.success) {
        message.success(`${data.importCampaignsFromGoogleAds.campaigns.length} campañas importadas`);
        refetchCampaigns();
      } else {
        const errorMsg = data?.importCampaignsFromGoogleAds?.message || 'Error al importar';
        const errors = data?.importCampaignsFromGoogleAds?.errors || [];
        
        // Detectar error de Developer Token
        if (errors.some(e => e.includes('developer token') || e.includes('test account'))) {
          Modal.warning({
            title: '🔒 Developer Token solo para cuentas de prueba',
            width: 600,
            content: (
              <div>
                <p><strong>Tu Developer Token de Google Ads solo tiene acceso a cuentas de PRUEBA.</strong></p>
                <p>Esta cuenta (<strong>{accounts.find(a => a._id === selectedAccount)?.name}</strong>) es una cuenta REAL.</p>
                
                <div style={{ marginTop: 16, padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
                  <p><strong>✅ Solución rápida (Desarrollo):</strong></p>
                  <ol style={{ paddingLeft: 20, marginBottom: 0 }}>
                    <li>Ve a tu cuenta MCC en Google Ads</li>
                    <li>Herramientas y configuración → Cuentas de prueba</li>
                    <li>Crear nueva cuenta de prueba</li>
                    <li>Conéctala aquí y vuelve a importar</li>
                  </ol>
                </div>
                
                <div style={{ marginTop: 12, padding: 12, background: '#e6f7ff', borderRadius: 4 }}>
                  <p><strong>📋 Solución producción:</strong></p>
                  <p>Solicita <strong>Basic Access</strong> para tu Developer Token en:</p>
                  <a href="https://ads.google.com/aw/apicenter" target="_blank" rel="noopener noreferrer">
                    https://ads.google.com/aw/apicenter
                  </a>
                  <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: '#666' }}>
                    (Tiempo de aprobación: 1-3 días hábiles)
                  </p>
                </div>
              </div>
            )
          });
        } else {
          message.error(errorMsg);
        }
      }
    } catch (error) {
      console.error('Error importing campaigns:', error);
      message.error('Error al importar campañas: ' + (error.message || 'Error desconocido'));
    }
  };

  // Handler para cambio de paginación
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Campaña',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      render: (text, record) => (
        <div>
          <Button type="link" onClick={() => navigate(record._id)}>
            {text}
          </Button>
          {record.account && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {record.account.name}
            </Tag>
          )}
          {record.marketingCampaign && (
            <Tag color="purple" style={{ marginLeft: 8 }}>
              Vinculada con Marketing
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          'ENABLED': 'green',
          'PAUSED': 'orange',
          'REMOVED': 'red'
        };
        const statusLabels = {
          'ENABLED': 'Activa',
          'PAUSED': 'Pausada',
          'REMOVED': 'Eliminada'
        };
        return (
          <Tag color={statusColors[status] || 'default'}>
            {statusLabels[status] || status}
          </Tag>
        );
      }
    },
    {
      title: 'Tipo',
      dataIndex: 'campaignType',
      key: 'campaignType',
      render: (type) => (
        <Tag>{type || 'N/A'}</Tag>
      )
    },
    {
      title: 'Presupuesto',
      key: 'budget',
      render: (_, record) => {
        const amount = record.budget?.dailyBudget || 0;
        const currency = record.budget?.currency || 'USD';
        return `${currency} ${amount.toFixed(2)}/día`;
      }
    },
    {
      title: 'Gastado',
      key: 'cost',
      render: (_, record) => {
        const cost = record.metrics?.cost || 0;
        const budget = record.budget?.dailyBudget || 1;
        const currency = record.budget?.currency || 'USD';
        return (
          <div>
            <div>{currency} {cost.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: '#999' }}>
              {((cost / budget) * 100).toFixed(1)}% del presupuesto
            </div>
          </div>
        );
      }
    },
    {
      title: 'Impresiones',
      key: 'impressions',
      render: (_, record) => (
        <span>{(record.metrics?.impressions || 0).toLocaleString()}</span>
      )
    },
    {
      title: 'Clicks',
      key: 'clicks',
      render: (_, record) => (record.metrics?.clicks || 0)
    },
    {
      title: 'Conversiones',
      key: 'conversions',
      render: (_, record) => (record.metrics?.conversions || 0)
    },
    {
      title: 'CTR',
      key: 'ctr',
      render: (_, record) => {
        const ctr = record.metrics?.ctr || 0;
        return `${(ctr * 100).toFixed(2)}%`;
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(record._id)}
            title="Ver detalles"
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`${record._id}/edit`)}
            title="Editar"
          />
          <Button
            size="small"
            icon={<SyncOutlined />}
            onClick={() => handleSyncCampaign(record._id)}
            title="Sincronizar métricas"
          />
        </Space>
      )
    }
  ];

  return (
    <div>
      {campaignsError && (
        <Alert
          message="Error al cargar campañas"
          description={campaignsError.message}
          type="error"
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3}>Campañas de Google Ads</Title>
        </Col>
        <Col>
          <Space>
            <Select
              placeholder="Seleccionar cuenta"
              style={{ width: 300 }}
              value={selectedAccount}
              onChange={handleAccountChange}
              loading={loadingAccounts}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {mainAccounts.map(account => (
                <React.Fragment key={account._id}>
                  {/* Cuenta principal/MCC */}
                  <Option value={account._id}>
                    <strong>📊 {account.name}</strong> ({account.customerId})
                  </Option>
                  
                  {/* Subcuentas */}
                  {account.subAccounts && account.subAccounts.length > 0 && (
                    account.subAccounts.map(subAccount => (
                      <Option key={subAccount._id} value={subAccount._id}>
                        &nbsp;&nbsp;↳ {subAccount.name} ({subAccount.customerId})
                      </Option>
                    ))
                  )}
                </React.Fragment>
              ))}
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetchCampaigns()}
              loading={loadingCampaigns}
            >
              Actualizar
            </Button>
            <Button 
              icon={<SyncOutlined />} 
              onClick={handleImportCampaigns}
              loading={importing}
              disabled={!selectedAccount}
            >
              Importar de Google Ads
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => navigate('create')}
            >
              Nueva Campaña
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Mensaje informativo para cuentas MCC */}
      {!selectedAccount && allAccounts.length > 1 && (
        <Alert
          message="Cuenta de Administración (MCC)"
          description={
            <>
              <p>Tu cuenta principal es una cuenta de administración que gestiona {allAccounts.length - 1} subcuenta(s).</p>
              <p><strong>Selecciona una subcuenta</strong> del menú desplegable arriba para ver sus campañas.</p>
            </>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {campaigns.length === 0 && selectedAccount && !loadingCampaigns && (
        <Alert
          message="Sin campañas"
          description="Esta cuenta no tiene campañas aún. Usa el botón 'Importar de Google Ads' para sincronizar campañas existentes."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Campañas"
              value={pageInfo?.totalItems || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Activas"
              value={campaigns.filter(c => c.status === 'ENABLED').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Vinculadas con Marketing"
              value={campaigns.filter(c => c.marketingCampaign).length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Presupuesto Total Diario"
              value={campaigns.reduce((sum, c) => sum + (c.budget?.dailyBudget || 0), 0)}
              prefix={campaigns[0]?.budget?.currency || '$'}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Input
          placeholder="Buscar campañas..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, width: 300 }}
        />
        
        <Table
          columns={columns}
          dataSource={campaigns}
          loading={loadingCampaigns}
          rowKey="_id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1500 }}
        />
      </Card>
    </div>
  );
};

export default CampaignsList;
