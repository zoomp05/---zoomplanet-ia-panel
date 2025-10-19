import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Input, 
  Select, 
  Modal, 
  Form, 
  message,
  Tooltip,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  WalletOutlined, 
  SearchOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
  PlusOutlined,
  ExportOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

/**
 * Página de gestión de wallets
 * Permite administrar todas las wallets de usuarios
 */
const WalletManagement = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentWallet, setCurrentWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Datos de ejemplo
  const mockWallets = [
    {
      id: 'WAL-001',
      address: '0x1234...abcd',
      user: 'María González',
      email: 'maria@example.com',
      balance: 1250.75,
      balanceCAD: 1563.44,
      status: 'active',
      kycStatus: 'verified',
      transactions: 34,
      lastActivity: '2025-01-19 14:30:25',
      createdAt: '2024-12-15 10:20:00'
    },
    {
      id: 'WAL-002',
      address: '0x5678...efgh',
      user: 'Carlos Ruiz',
      email: 'carlos@example.com',
      balance: 2890.50,
      balanceCAD: 3613.13,
      status: 'active',
      kycStatus: 'pending',
      transactions: 67,
      lastActivity: '2025-01-19 12:45:10',
      createdAt: '2024-11-28 16:45:30'
    },
    {
      id: 'WAL-003',
      address: '0x9012...ijkl',
      user: 'Ana López',
      email: 'ana@example.com',
      balance: 0.00,
      balanceCAD: 0.00,
      status: 'suspended',
      kycStatus: 'rejected',
      transactions: 12,
      lastActivity: '2025-01-17 09:15:45',
      createdAt: '2024-10-05 14:20:15'
    }
  ];

  const columns = [
    {
      title: 'ID Wallet',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
      width: 120,
      render: (address) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {address}
        </span>
      ),
    },
    {
      title: 'Usuario',
      key: 'user',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.user}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Balance',
      key: 'balance',
      align: 'right',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.balance.toFixed(2)} MIG</div>
          <div style={{ fontSize: '12px', color: '#666' }}>${record.balanceCAD.toFixed(2)} CAD</div>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          active: { color: 'green', text: 'Activa' },
          suspended: { color: 'red', text: 'Suspendida' },
          pending: { color: 'orange', text: 'Pendiente' },
        };
        return (
          <Tag color={config[status]?.color}>
            {config[status]?.text}
          </Tag>
        );
      },
    },
    {
      title: 'KYC',
      dataIndex: 'kycStatus',
      key: 'kycStatus',
      render: (status) => {
        const config = {
          verified: { color: 'green', text: 'Verificado' },
          pending: { color: 'orange', text: 'Pendiente' },
          rejected: { color: 'red', text: 'Rechazado' },
        };
        return (
          <Tag color={config[status]?.color}>
            {config[status]?.text}
          </Tag>
        );
      },
    },
    {
      title: 'Transacciones',
      dataIndex: 'transactions',
      key: 'transactions',
      align: 'center',
    },
    {
      title: 'Última Actividad',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      width: 150,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver Detalles">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewWallet(record)}
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title="Suspender">
              <Button 
                size="small" 
                icon={<LockOutlined />} 
                danger
                onClick={() => handleSuspendWallet(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Activar">
              <Button 
                size="small" 
                icon={<UnlockOutlined />} 
                type="primary"
                onClick={() => handleActivateWallet(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Funciones de manejo
  const handleViewWallet = (wallet) => {
    setCurrentWallet(wallet);
    setIsModalVisible(true);
  };

  const handleSuspendWallet = (wallet) => {
    Modal.confirm({
      title: '¿Suspender Wallet?',
      content: `¿Estás seguro de que quieres suspender la wallet de ${wallet.user}?`,
      onOk: () => {
        message.success(`Wallet de ${wallet.user} suspendida`);
      },
    });
  };

  const handleActivateWallet = (wallet) => {
    Modal.confirm({
      title: '¿Activar Wallet?',
      content: `¿Estás seguro de que quieres activar la wallet de ${wallet.user}?`,
      onOk: () => {
        message.success(`Wallet de ${wallet.user} activada`);
      },
    });
  };

  const filteredWallets = mockWallets.filter(wallet => {
    const matchesSearch = wallet.user.toLowerCase().includes(searchText.toLowerCase()) ||
                         wallet.email.toLowerCase().includes(searchText.toLowerCase()) ||
                         wallet.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wallet.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>
          <WalletOutlined style={{ marginRight: '8px' }} />
          Gestión de Wallets
        </h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Crear Wallet Manual
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Total Wallets" value={mockWallets.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="Activas" 
              value={mockWallets.filter(w => w.status === 'active').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="Balance Total" 
              value={mockWallets.reduce((sum, w) => sum + w.balance, 0)}
              suffix="MIG"
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="Valor Total" 
              value={mockWallets.reduce((sum, w) => sum + w.balanceCAD, 0)}
              prefix="$"
              suffix="CAD"
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros y búsqueda */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Buscar por usuario, email o ID de wallet"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">Todos los estados</Option>
              <Option value="active">Activas</Option>
              <Option value="suspended">Suspendidas</Option>
              <Option value="pending">Pendientes</Option>
            </Select>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />}>
              Actualizar
            </Button>
          </Col>
          <Col>
            <Button icon={<ExportOutlined />}>
              Exportar
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabla de wallets */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredWallets}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredWallets.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} wallets`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal de detalles */}
      <Modal
        title="Detalles de Wallet"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        {currentWallet && (
          <div>
            <p><strong>ID:</strong> {currentWallet.id}</p>
            <p><strong>Dirección:</strong> {currentWallet.address}</p>
            <p><strong>Usuario:</strong> {currentWallet.user}</p>
            <p><strong>Email:</strong> {currentWallet.email}</p>
            <p><strong>Balance:</strong> {currentWallet.balance} MIG (${currentWallet.balanceCAD} CAD)</p>
            <p><strong>Estado:</strong> {currentWallet.status}</p>
            <p><strong>KYC:</strong> {currentWallet.kycStatus}</p>
            <p><strong>Transacciones:</strong> {currentWallet.transactions}</p>
            <p><strong>Última Actividad:</strong> {currentWallet.lastActivity}</p>
            <p><strong>Creada:</strong> {currentWallet.createdAt}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WalletManagement;