import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Progress, 
  Tag, 
  Button, 
  Space, 
  Select,
  DatePicker,
  Statistic,
  Alert
} from 'antd';
import {
  ThunderboltOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  WarningOutlined,
  LineChartOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Página de Resources - Monitoreo global de recursos
 * Muestra el uso agregado de CPU, RAM, Storage y Bandwidth de todas las cuentas
 */
const Resources = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');
  const [sortBy, setSortBy] = useState('cpu');

  // Datos de ejemplo - TODO: Reemplazar con GraphQL
  const globalStats = {
    totalAccounts: 24,
    activeAccounts: 21,
    avgCpu: 42,
    avgRam: 58,
    avgStorage: 65,
    avgBandwidth: 45,
    criticalAccounts: 3,
    warningAccounts: 7
  };

  const accountsData = [
    {
      key: '1',
      accountId: 'HOST-001',
      domain: 'example.com',
      plan: 'Business',
      cpu: { current: 87, limit: 100, status: 'critical' },
      ram: { current: 7.2, limit: 8, status: 'warning' },
      storage: { current: 92, limit: 100, status: 'critical' },
      bandwidth: { current: 1850, limit: 2000, status: 'warning' }
    },
    {
      key: '2',
      accountId: 'HOST-002',
      domain: 'mywebsite.ca',
      plan: 'Professional',
      cpu: { current: 32, limit: 100, status: 'normal' },
      ram: { current: 2.8, limit: 4, status: 'normal' },
      storage: { current: 45, limit: 50, status: 'warning' },
      bandwidth: { current: 678, limit: 1000, status: 'normal' }
    },
    {
      key: '3',
      accountId: 'HOST-004',
      domain: 'ecommerce.shop',
      plan: 'Enterprise',
      cpu: { current: 73, limit: 100, status: 'normal' },
      ram: { current: 14.5, limit: 16, status: 'warning' },
      storage: { current: 445, limit: 500, status: 'warning' },
      bandwidth: { current: 8900, limit: 10000, status: 'warning' }
    },
    {
      key: '4',
      accountId: 'HOST-005',
      domain: 'blog-personal.com',
      plan: 'Starter',
      cpu: { current: 12, limit: 100, status: 'normal' },
      ram: { current: 0.9, limit: 2, status: 'normal' },
      storage: { current: 8.5, limit: 25, status: 'normal' },
      bandwidth: { current: 125, limit: 500, status: 'normal' }
    },
  ];

  // Función para determinar el estado visual
  const getResourceStatus = (current, limit) => {
    const percentage = typeof current === 'number' && typeof limit === 'number'
      ? (current / limit) * 100
      : current;
    
    if (percentage >= 90) return 'exception';
    if (percentage >= 80) return 'normal'; // Se muestra amarillo en Progress
    return 'normal';
  };

  const getResourceColor = (status) => {
    const colors = {
      critical: 'red',
      warning: 'orange',
      normal: 'green'
    };
    return colors[status] || 'blue';
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Cuenta',
      dataIndex: 'accountId',
      key: 'accountId',
      render: (id, record) => (
        <div>
          <div><strong>{id}</strong></div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.domain}</div>
        </div>
      ),
      fixed: 'left',
      width: 180,
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      width: 120,
      render: (plan) => <Tag color="blue">{plan}</Tag>
    },
    {
      title: 'CPU',
      key: 'cpu',
      width: 150,
      sorter: (a, b) => a.cpu.current - b.cpu.current,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span>{record.cpu.current}%</span>
            <Tag color={getResourceColor(record.cpu.status)} style={{ margin: 0 }}>
              {record.cpu.status}
            </Tag>
          </div>
          <Progress 
            percent={record.cpu.current} 
            size="small"
            status={getResourceStatus(record.cpu.current, 100)}
            showInfo={false}
          />
        </div>
      )
    },
    {
      title: 'RAM',
      key: 'ram',
      width: 150,
      sorter: (a, b) => (a.ram.current / a.ram.limit) - (b.ram.current / b.ram.limit),
      render: (_, record) => {
        const percentage = Math.round((record.ram.current / record.ram.limit) * 100);
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>{record.ram.current} / {record.ram.limit} GB</span>
              <Tag color={getResourceColor(record.ram.status)} style={{ margin: 0 }}>
                {percentage}%
              </Tag>
            </div>
            <Progress 
              percent={percentage} 
              size="small"
              status={getResourceStatus(percentage, 100)}
              showInfo={false}
            />
          </div>
        );
      }
    },
    {
      title: 'Storage',
      key: 'storage',
      width: 150,
      sorter: (a, b) => (a.storage.current / a.storage.limit) - (b.storage.current / b.storage.limit),
      render: (_, record) => {
        const percentage = Math.round((record.storage.current / record.storage.limit) * 100);
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>{record.storage.current} / {record.storage.limit} GB</span>
              <Tag color={getResourceColor(record.storage.status)} style={{ margin: 0 }}>
                {percentage}%
              </Tag>
            </div>
            <Progress 
              percent={percentage} 
              size="small"
              status={getResourceStatus(percentage, 100)}
              showInfo={false}
            />
          </div>
        );
      }
    },
    {
      title: 'Bandwidth',
      key: 'bandwidth',
      width: 150,
      sorter: (a, b) => (a.bandwidth.current / a.bandwidth.limit) - (b.bandwidth.current / b.bandwidth.limit),
      render: (_, record) => {
        const percentage = Math.round((record.bandwidth.current / record.bandwidth.limit) * 100);
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>{record.bandwidth.current} / {record.bandwidth.limit} GB</span>
              <Tag color={getResourceColor(record.bandwidth.status)} style={{ margin: 0 }}>
                {percentage}%
              </Tag>
            </div>
            <Progress 
              percent={percentage} 
              size="small"
              status={getResourceStatus(percentage, 100)}
              showInfo={false}
            />
          </div>
        );
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => navigate(`/admin/hosting/accounts/${record.accountId}`)}
        >
          Ver Detalles
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>
          <LineChartOutlined /> Monitoreo de Recursos
        </h1>
        <Space>
          <RangePicker />
          <Select 
            defaultValue={sortBy} 
            style={{ width: 150 }}
            onChange={setSortBy}
          >
            <Option value="cpu">Ordenar por CPU</Option>
            <Option value="ram">Ordenar por RAM</Option>
            <Option value="storage">Ordenar por Storage</Option>
            <Option value="bandwidth">Ordenar por Bandwidth</Option>
          </Select>
          <Button>Exportar Reporte</Button>
        </Space>
      </div>

      {/* Alertas */}
      {globalStats.criticalAccounts > 0 && (
        <Alert
          message={`${globalStats.criticalAccounts} cuentas en estado crítico`}
          description="Algunas cuentas están excediendo el 90% de sus recursos asignados"
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Estadísticas globales */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cuentas Activas"
              value={globalStats.activeAccounts}
              suffix={`/ ${globalStats.totalAccounts}`}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CPU Promedio"
              value={globalStats.avgCpu}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: globalStats.avgCpu > 80 ? '#cf1322' : '#3f8600' }}
            />
            <Progress 
              percent={globalStats.avgCpu} 
              size="small" 
              showInfo={false}
              status={globalStats.avgCpu > 80 ? 'exception' : 'normal'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="RAM Promedio"
              value={globalStats.avgRam}
              suffix="%"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: globalStats.avgRam > 80 ? '#cf1322' : '#3f8600' }}
            />
            <Progress 
              percent={globalStats.avgRam} 
              size="small" 
              showInfo={false}
              status={globalStats.avgRam > 80 ? 'exception' : 'normal'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Storage Promedio"
              value={globalStats.avgStorage}
              suffix="%"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: globalStats.avgStorage > 80 ? '#cf1322' : '#3f8600' }}
            />
            <Progress 
              percent={globalStats.avgStorage} 
              size="small" 
              showInfo={false}
              status={globalStats.avgStorage > 80 ? 'exception' : 'normal'}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráficas agregadas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Uso de CPU - Todas las Cuentas" size="small">
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              📊 Gráfica de líneas - Uso de CPU agregado (últimos {timeRange})
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Uso de RAM - Todas las Cuentas" size="small">
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              📊 Gráfica de líneas - Uso de RAM agregado (últimos {timeRange})
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabla de cuentas */}
      <Card 
        title={
          <Space>
            <span>Uso por Cuenta</span>
            <Tag color="red">{globalStats.criticalAccounts} críticas</Tag>
            <Tag color="orange">{globalStats.warningAccounts} advertencias</Tag>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={accountsData}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} cuentas`,
            showSizeChanger: true,
          }}
        />
      </Card>
    </div>
  );
};

export default Resources;
