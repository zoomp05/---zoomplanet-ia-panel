import React, { useState } from 'react';
import { Table, Card, Button, Space, Tag, Input, Select, Tooltip, Progress, Modal } from 'antd';
import {
  CloudServerOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';

const { Search } = Input;
const { Option } = Select;

/**
 * Lista de cuentas de hosting
 * Permite gestionar, filtrar y realizar acciones sobre las cuentas
 */
const AccountsList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Datos de ejemplo
  const accounts = [
    {
      key: '1',
      id: 'HOST-001',
      domain: 'example.com',
      client: 'John Doe',
      plan: 'Business',
      status: 'active',
      cpuUsage: 45,
      ramUsage: 62,
      storageUsage: 78,
      bandwidthUsage: 34,
      monthlyFee: 89.99,
      nextBilling: '2025-11-21',
      createdAt: '2024-01-15',
    },
    {
      key: '2',
      id: 'HOST-002',
      domain: 'mywebsite.ca',
      client: 'Jane Smith',
      plan: 'Professional',
      status: 'active',
      cpuUsage: 32,
      ramUsage: 48,
      storageUsage: 56,
      bandwidthUsage: 45,
      monthlyFee: 59.99,
      nextBilling: '2025-11-15',
      createdAt: '2024-02-20',
    },
    {
      key: '3',
      id: 'HOST-003',
      domain: 'startup.io',
      client: 'Tech Startup Inc.',
      plan: 'Starter',
      status: 'suspended',
      cpuUsage: 0,
      ramUsage: 0,
      storageUsage: 45,
      bandwidthUsage: 0,
      monthlyFee: 29.99,
      nextBilling: '2025-10-25',
      createdAt: '2024-03-10',
    },
    {
      key: '4',
      id: 'HOST-004',
      domain: 'ecommerce.shop',
      client: 'Shop Online Ltd.',
      plan: 'Enterprise',
      status: 'active',
      cpuUsage: 67,
      ramUsage: 73,
      storageUsage: 89,
      bandwidthUsage: 78,
      monthlyFee: 199.99,
      nextBilling: '2025-11-30',
      createdAt: '2023-12-01',
    },
    {
      key: '5',
      id: 'HOST-005',
      domain: 'blog-personal.com',
      client: 'Maria Garcia',
      plan: 'Starter',
      status: 'active',
      cpuUsage: 12,
      ramUsage: 23,
      storageUsage: 34,
      bandwidthUsage: 18,
      monthlyFee: 29.99,
      nextBilling: '2025-11-18',
      createdAt: '2024-05-22',
    },
    {
      key: '6',
      id: 'HOST-006',
      domain: 'agency-digital.ca',
      client: 'Digital Agency Co.',
      plan: 'Business',
      status: 'pending',
      cpuUsage: 0,
      ramUsage: 0,
      storageUsage: 5,
      bandwidthUsage: 0,
      monthlyFee: 89.99,
      nextBilling: '2025-11-25',
      createdAt: '2025-10-20',
    },
  ];

  // Columnas de la tabla
  const columns = [
    {
      title: 'ID Cuenta',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 120,
      render: (id) => <strong>{id}</strong>,
    },
    {
      title: 'Dominio',
      dataIndex: 'domain',
      key: 'domain',
      width: 200,
      render: (domain) => (
        <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer">
          {domain}
        </a>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client',
      width: 180,
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      width: 130,
      render: (plan) => {
        const colors = {
          'Starter': 'default',
          'Professional': 'blue',
          'Business': 'cyan',
          'Enterprise': 'purple',
        };
        return <Tag color={colors[plan]}>{plan}</Tag>;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Activo', value: 'active' },
        { text: 'Suspendido', value: 'suspended' },
        { text: 'Pendiente', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusConfig = {
          active: { color: 'success', text: 'Activo', icon: <PlayCircleOutlined /> },
          suspended: { color: 'error', text: 'Suspendido', icon: <StopOutlined /> },
          pending: { color: 'warning', text: 'Pendiente', icon: <SettingOutlined /> },
        };
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Uso de Recursos',
      key: 'resources',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Tooltip title={`CPU: ${record.cpuUsage}%`}>
            <Progress percent={record.cpuUsage} size="small" status={record.cpuUsage > 80 ? 'exception' : 'normal'} />
          </Tooltip>
          <Tooltip title={`RAM: ${record.ramUsage}%`}>
            <Progress percent={record.ramUsage} size="small" status={record.ramUsage > 80 ? 'exception' : 'normal'} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Storage',
      dataIndex: 'storageUsage',
      key: 'storageUsage',
      width: 120,
      render: (usage) => (
        <Progress 
          type="circle" 
          percent={usage} 
          width={50} 
          status={usage > 80 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: 'Mensual',
      dataIndex: 'monthlyFee',
      key: 'monthlyFee',
      width: 100,
      render: (fee) => `$${fee.toFixed(2)}`,
    },
    {
      title: 'Próxima Factura',
      dataIndex: 'nextBilling',
      key: 'nextBilling',
      width: 140,
      sorter: (a, b) => new Date(a.nextBilling) - new Date(b.nextBilling),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button 
              type="link" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => navigate(`${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => navigate(`${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Configuración">
            <Button 
              type="link" 
              size="small" 
              icon={<SettingOutlined />}
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title="Suspender">
              <Button 
                type="link" 
                size="small" 
                danger
                icon={<StopOutlined />}
                onClick={() => handleSuspend(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Activar">
              <Button 
                type="link" 
                size="small" 
                icon={<PlayCircleOutlined />}
                onClick={() => handleActivate(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Handlers
  const handleSuspend = (record) => {
    Modal.confirm({
      title: '¿Suspender cuenta?',
      content: `¿Estás seguro de suspender la cuenta ${record.id} (${record.domain})?`,
      okText: 'Suspender',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        console.log('Suspendiendo:', record.id);
        // TODO: Implementar suspensión
      },
    });
  };

  const handleActivate = (record) => {
    Modal.confirm({
      title: '¿Activar cuenta?',
      content: `¿Estás seguro de activar la cuenta ${record.id} (${record.domain})?`,
      okText: 'Activar',
      cancelText: 'Cancelar',
      onOk() {
        console.log('Activando:', record.id);
        // TODO: Implementar activación
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // Filtros
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchText === '' || 
      account.domain.toLowerCase().includes(searchText.toLowerCase()) ||
      account.client.toLowerCase().includes(searchText.toLowerCase()) ||
      account.id.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>
            <CloudServerOutlined /> Cuentas de Hosting
          </h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('new')}
          >
            Nueva Cuenta
          </Button>
        </div>

        {/* Filtros */}
        <Space style={{ marginBottom: '16px', width: '100%' }} size="middle">
          <Search
            placeholder="Buscar por dominio, cliente o ID..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">Todos los estados</Option>
            <Option value="active">Activos</Option>
            <Option value="suspended">Suspendidos</Option>
            <Option value="pending">Pendientes</Option>
          </Select>
        </Space>

        {/* Acciones masivas */}
        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: '16px', padding: '8px', background: '#e6f7ff', borderRadius: '4px' }}>
            <Space>
              <span>{selectedRowKeys.length} cuentas seleccionadas</span>
              <Button size="small">Suspender seleccionadas</Button>
              <Button size="small" danger>Eliminar seleccionadas</Button>
            </Space>
          </div>
        )}

        {/* Tabla */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredAccounts}
          scroll={{ x: 1500 }}
          pagination={{
            total: filteredAccounts.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} cuentas`,
          }}
        />
      </Card>
    </div>
  );
};

export default AccountsList;
