import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Modal,
  Badge,
  Tooltip,
  message,
  Progress
} from 'antd';
import {
  GlobalOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;

/**
 * Lista de dominios
 * Gestión completa de dominios registrados, DNS, SSL, etc.
 */
const DomainsList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Datos de ejemplo - TODO: Reemplazar con GraphQL
  const domains = [
    {
      key: '1',
      domainName: 'example.com',
      tld: '.com',
      registrar: 'GoDaddy',
      registeredAt: '2023-01-15',
      expiresAt: '2026-01-15',
      autoRenew: true,
      status: 'active',
      sslStatus: 'valid',
      sslExpiresAt: '2025-12-15',
      hostingAccount: 'HOST-001',
      dnsRecords: 12,
      whoisPrivacy: true
    },
    {
      key: '2',
      domainName: 'mywebsite.ca',
      tld: '.ca',
      registrar: 'Namecheap',
      registeredAt: '2024-02-20',
      expiresAt: '2025-02-20',
      autoRenew: false,
      status: 'active',
      sslStatus: 'valid',
      sslExpiresAt: '2026-01-10',
      hostingAccount: 'HOST-002',
      dnsRecords: 8,
      whoisPrivacy: true
    },
    {
      key: '3',
      domainName: 'startup.io',
      tld: '.io',
      registrar: 'Hover',
      registeredAt: '2023-03-10',
      expiresAt: '2025-11-10',
      autoRenew: true,
      status: 'expiring_soon',
      sslStatus: 'expired',
      sslExpiresAt: '2025-09-01',
      hostingAccount: null,
      dnsRecords: 15,
      whoisPrivacy: false
    },
    {
      key: '4',
      domainName: 'ecommerce.shop',
      tld: '.shop',
      registrar: 'Google Domains',
      registeredAt: '2023-12-01',
      expiresAt: '2026-12-01',
      autoRenew: true,
      status: 'active',
      sslStatus: 'valid',
      sslExpiresAt: '2026-03-15',
      hostingAccount: 'HOST-004',
      dnsRecords: 20,
      whoisPrivacy: true
    },
    {
      key: '5',
      domainName: 'blog-personal.com',
      tld: '.com',
      registrar: 'Namecheap',
      registeredAt: '2024-05-22',
      expiresAt: '2026-05-22',
      autoRenew: false,
      status: 'active',
      sslStatus: 'pending',
      sslExpiresAt: null,
      hostingAccount: 'HOST-005',
      dnsRecords: 5,
      whoisPrivacy: true
    },
    {
      key: '6',
      domainName: 'oldsite.net',
      tld: '.net',
      registrar: 'GoDaddy',
      registeredAt: '2020-08-10',
      expiresAt: '2025-10-25',
      autoRenew: false,
      status: 'expiring_soon',
      sslStatus: 'none',
      sslExpiresAt: null,
      hostingAccount: null,
      dnsRecords: 3,
      whoisPrivacy: false
    }
  ];

  // Calcular días hasta expiración
  const getDaysUntilExpiry = (expiresAt) => {
    return moment(expiresAt).diff(moment(), 'days');
  };

  // Renderizar estado del dominio
  const renderDomainStatus = (status, expiresAt) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiresAt);
    
    const statusConfig = {
      active: { color: 'success', text: 'Activo', icon: <CheckCircleOutlined /> },
      expiring_soon: { color: 'warning', text: `Expira en ${daysUntilExpiry} días`, icon: <ClockCircleOutlined /> },
      expired: { color: 'error', text: 'Expirado', icon: <WarningOutlined /> },
      pending_transfer: { color: 'processing', text: 'Transferencia Pendiente', icon: <ClockCircleOutlined /> },
      locked: { color: 'default', text: 'Bloqueado', icon: <WarningOutlined /> }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <Badge status={config.color} text={config.text} />
    );
  };

  // Renderizar estado SSL
  const renderSSLStatus = (sslStatus, sslExpiresAt) => {
    const statusConfig = {
      valid: { color: 'success', text: 'SSL Válido' },
      expired: { color: 'error', text: 'SSL Expirado' },
      pending: { color: 'processing', text: 'SSL Pendiente' },
      none: { color: 'default', text: 'Sin SSL' }
    };
    
    const config = statusConfig[sslStatus];
    const daysUntilExpiry = sslExpiresAt ? getDaysUntilExpiry(sslExpiresAt) : null;
    
    return (
      <Tooltip title={sslExpiresAt ? `Expira: ${sslExpiresAt}` : 'No configurado'}>
        <Tag color={config.color} icon={<SafetyCertificateOutlined />}>
          {config.text}
          {daysUntilExpiry !== null && daysUntilExpiry < 30 && ` (${daysUntilExpiry}d)`}
        </Tag>
      </Tooltip>
    );
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Dominio',
      dataIndex: 'domainName',
      key: 'domainName',
      fixed: 'left',
      width: 200,
      render: (name, record) => (
        <div>
          <div>
            <a onClick={() => navigate(`/admin/hosting/domains/${record.key}`)}>
              <strong>{name}</strong>
            </a>
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            <Tag size="small">{record.tld}</Tag>
            {record.whoisPrivacy && (
              <Tag size="small" color="blue">WHOIS Privacy</Tag>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Registrador',
      dataIndex: 'registrar',
      key: 'registrar',
      width: 130,
    },
    {
      title: 'Estado',
      key: 'status',
      width: 180,
      filters: [
        { text: 'Activo', value: 'active' },
        { text: 'Expirando Pronto', value: 'expiring_soon' },
        { text: 'Expirado', value: 'expired' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => renderDomainStatus(record.status, record.expiresAt)
    },
    {
      title: 'SSL',
      key: 'ssl',
      width: 150,
      render: (_, record) => renderSSLStatus(record.sslStatus, record.sslExpiresAt)
    },
    {
      title: 'Cuenta Hosting',
      dataIndex: 'hostingAccount',
      key: 'hostingAccount',
      width: 130,
      render: (accountId) => accountId ? (
        <Button 
          type="link" 
          size="small"
          onClick={() => navigate(`/admin/hosting/accounts/${accountId}`)}
        >
          {accountId}
        </Button>
      ) : (
        <span style={{ color: '#8c8c8c' }}>Sin asignar</span>
      )
    },
    {
      title: 'Registrado',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 120,
      sorter: (a, b) => moment(a.registeredAt).unix() - moment(b.registeredAt).unix(),
    },
    {
      title: 'Expira',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 120,
      sorter: (a, b) => moment(a.expiresAt).unix() - moment(b.expiresAt).unix(),
      render: (date, record) => {
        const daysLeft = getDaysUntilExpiry(date);
        const isExpiringSoon = daysLeft < 30;
        
        return (
          <div>
            <div style={{ color: isExpiringSoon ? '#faad14' : 'inherit' }}>
              {date}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              ({daysLeft} días)
            </div>
          </div>
        );
      }
    },
    {
      title: 'Auto-Renovar',
      dataIndex: 'autoRenew',
      key: 'autoRenew',
      width: 120,
      render: (autoRenew) => (
        <Tag color={autoRenew ? 'success' : 'default'}>
          {autoRenew ? 'Sí' : 'No'}
        </Tag>
      )
    },
    {
      title: 'DNS',
      dataIndex: 'dnsRecords',
      key: 'dnsRecords',
      width: 80,
      render: (count) => (
        <Tag color="blue">{count} records</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="DNS Manager">
            <Button 
              type="link" 
              size="small"
              onClick={() => navigate(`/admin/hosting/domains/${record.key}/dns`)}
            >
              DNS
            </Button>
          </Tooltip>
          <Tooltip title="Configuración SSL">
            <Button 
              type="link" 
              size="small"
              icon={<SafetyCertificateOutlined />}
            >
              SSL
            </Button>
          </Tooltip>
          <Tooltip title="Configuración">
            <Button 
              type="link" 
              size="small"
              icon={<SettingOutlined />}
              onClick={() => navigate(`/admin/hosting/domains/${record.key}`)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Handlers
  const handleRegisterDomain = () => {
    navigate('/admin/hosting/domains/register');
  };

  const handleTransferDomain = () => {
    Modal.info({
      title: 'Transferir Dominio',
      content: 'Funcionalidad de transferencia de dominio próximamente...',
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // Filtros
  const filteredDomains = domains.filter(domain => {
    const matchesSearch = searchText === '' || 
      domain.domainName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || domain.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: domains.length,
    active: domains.filter(d => d.status === 'active').length,
    expiringSoon: domains.filter(d => d.status === 'expiring_soon').length,
    withSSL: domains.filter(d => d.sslStatus === 'valid').length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>
            <GlobalOutlined /> Gestión de Dominios
          </h2>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleRegisterDomain}
            >
              Registrar Dominio
            </Button>
            <Button onClick={handleTransferDomain}>
              Transferir Dominio
            </Button>
          </Space>
        </div>

        {/* Estadísticas rápidas */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '16px', 
          padding: '16px', 
          background: '#f5f5f5', 
          borderRadius: '4px' 
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Total Dominios</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{stats.active}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Activos</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>{stats.expiringSoon}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Expirando Pronto</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>{stats.withSSL}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Con SSL Válido</div>
          </div>
        </div>

        {/* Filtros */}
        <Space style={{ marginBottom: '16px', width: '100%' }} size="middle">
          <Search
            placeholder="Buscar dominio..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            style={{ width: 180 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">Todos los estados</Option>
            <Option value="active">Activos</Option>
            <Option value="expiring_soon">Expirando Pronto</Option>
            <Option value="expired">Expirados</Option>
          </Select>
          <Button icon={<ReloadOutlined />}>Actualizar</Button>
        </Space>

        {/* Acciones masivas */}
        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: '16px', padding: '8px', background: '#e6f7ff', borderRadius: '4px' }}>
            <Space>
              <span>{selectedRowKeys.length} dominios seleccionados</span>
              <Button size="small">Renovar seleccionados</Button>
              <Button size="small">Activar Auto-Renovar</Button>
              <Button size="small">Configurar DNS</Button>
            </Space>
          </div>
        )}

        {/* Tabla */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredDomains}
          scroll={{ x: 1500 }}
          pagination={{
            total: filteredDomains.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} dominios`,
          }}
        />
      </Card>
    </div>
  );
};

export default DomainsList;
