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
  Row, 
  Col,
  Statistic,
  Alert,
  Image,
  Descriptions,
  message,
  Tooltip
} from 'antd';
import { 
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

/**
 * Página principal del módulo KYC
 * Dashboard con resumen de verificaciones pendientes, aprobadas y rechazadas
 */
const KYCDashboard = () => {
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  // Datos de ejemplo
  const mockKYCData = [
    {
      id: 'KYC-001',
      user: 'María González',
      email: 'maria@example.com',
      documentType: 'Pasaporte Mexicano',
      documentNumber: 'G1234567',
      status: 'pending',
      submittedAt: '2025-01-19 14:30:25',
      reviewedBy: null,
      reviewedAt: null,
      riskLevel: 'low',
      documents: [
        { type: 'passport', url: '/docs/passport_001.jpg', status: 'uploaded' },
        { type: 'proof_of_address', url: '/docs/address_001.pdf', status: 'uploaded' },
        { type: 'selfie', url: '/docs/selfie_001.jpg', status: 'uploaded' }
      ],
      notes: 'Documentos claros, buena calidad de imagen'
    },
    {
      id: 'KYC-002',
      user: 'Carlos Ruiz',
      email: 'carlos@example.com',
      documentType: 'Matrícula Consular',
      documentNumber: 'MC789456',
      status: 'pending',
      submittedAt: '2025-01-19 12:15:10',
      reviewedBy: null,
      reviewedAt: null,
      riskLevel: 'medium',
      documents: [
        { type: 'consular_id', url: '/docs/consular_002.jpg', status: 'uploaded' },
        { type: 'proof_of_address', url: '/docs/address_002.pdf', status: 'uploaded' },
        { type: 'work_permit', url: '/docs/permit_002.jpg', status: 'uploaded' }
      ],
      notes: 'Requiere verificación adicional del permiso de trabajo'
    },
    {
      id: 'KYC-003',
      user: 'Ana López',
      email: 'ana@example.com',
      documentType: 'Cédula Profesional',
      documentNumber: 'CP456789',
      status: 'approved',
      submittedAt: '2025-01-18 16:45:30',
      reviewedBy: 'Admin User',
      reviewedAt: '2025-01-19 09:30:15',
      riskLevel: 'low',
      documents: [
        { type: 'professional_id', url: '/docs/professional_003.jpg', status: 'verified' },
        { type: 'proof_of_address', url: '/docs/address_003.pdf', status: 'verified' },
        { type: 'selfie', url: '/docs/selfie_003.jpg', status: 'verified' }
      ],
      notes: 'Todos los documentos verificados correctamente'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      under_review: 'blue'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      under_review: 'En Revisión'
    };
    return texts[status] || status;
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red'
    };
    return colors[level] || 'default';
  };

  const getRiskLevelText = (level) => {
    const texts = {
      low: 'Bajo',
      medium: 'Medio',
      high: 'Alto'
    };
    return texts[level] || level;
  };

  const handleViewKYC = (record) => {
    setSelectedKYC(record);
    setIsModalVisible(true);
  };

  const handleApprove = (record) => {
    Modal.confirm({
      title: '¿Aprobar KYC?',
      content: `¿Estás seguro de que quieres aprobar el KYC de ${record.user}?`,
      onOk: () => {
        message.success(`KYC de ${record.user} aprobado`);
      },
    });
  };

  const handleReject = (record) => {
    Modal.confirm({
      title: '¿Rechazar KYC?',
      content: `¿Estás seguro de que quieres rechazar el KYC de ${record.user}?`,
      onOk: () => {
        message.error(`KYC de ${record.user} rechazado`);
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
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
      title: 'Documento',
      key: 'document',
      render: (_, record) => (
        <div>
          <div>{record.documentType}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.documentNumber}</div>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Riesgo',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level) => (
        <Tag color={getRiskLevelColor(level)}>
          {getRiskLevelText(level)}
        </Tag>
      ),
    },
    {
      title: 'Enviado',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 150,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver Detalles">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewKYC(record)}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Aprobar">
                <Button 
                  size="small" 
                  icon={<CheckCircleOutlined />} 
                  type="primary"
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="Rechazar">
                <Button 
                  size="small" 
                  icon={<CloseCircleOutlined />} 
                  danger
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const filteredData = mockKYCData.filter(item => {
    const matchesSearch = item.user.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = mockKYCData.filter(item => item.status === 'pending').length;
  const approvedCount = mockKYCData.filter(item => item.status === 'approved').length;
  const rejectedCount = mockKYCData.filter(item => item.status === 'rejected').length;

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>
        <SafetyCertificateOutlined style={{ marginRight: '8px' }} />
        Dashboard KYC
      </h1>

      {/* Alerta para revisiones pendientes */}
      {pendingCount > 0 && (
        <Alert
          message={`${pendingCount} verificaciones KYC pendientes de revisión`}
          description="Hay solicitudes de verificación que requieren tu atención."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
          action={
            <Button size="small" type="text">
              Revisar Ahora
            </Button>
          }
        />
      )}

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={pendingCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aprobados"
              value={approvedCount}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rechazados"
              value={rejectedCount}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tasa de Aprobación"
              value={Math.round((approvedCount / (approvedCount + rejectedCount)) * 100) || 0}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<FlagOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Buscar por usuario, email o ID"
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
              <Option value="all">Todos</Option>
              <Option value="pending">Pendientes</Option>
              <Option value="approved">Aprobados</Option>
              <Option value="rejected">Rechazados</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Tabla de KYC */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} solicitudes`,
          }}
        />
      </Card>

      {/* Modal de detalles */}
      <Modal
        title="Detalles de Verificación KYC"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Cerrar
          </Button>,
          selectedKYC?.status === 'pending' && (
            <Space key="actions">
              <Button 
                key="reject" 
                danger 
                onClick={() => handleReject(selectedKYC)}
              >
                Rechazar
              </Button>
              <Button 
                key="approve" 
                type="primary" 
                onClick={() => handleApprove(selectedKYC)}
              >
                Aprobar
              </Button>
            </Space>
          )
        ]}
      >
        {selectedKYC && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID">{selectedKYC.id}</Descriptions.Item>
              <Descriptions.Item label="Usuario">{selectedKYC.user}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedKYC.email}</Descriptions.Item>
              <Descriptions.Item label="Tipo de Documento">{selectedKYC.documentType}</Descriptions.Item>
              <Descriptions.Item label="Número">{selectedKYC.documentNumber}</Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={getStatusColor(selectedKYC.status)}>
                  {getStatusText(selectedKYC.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Nivel de Riesgo">
                <Tag color={getRiskLevelColor(selectedKYC.riskLevel)}>
                  {getRiskLevelText(selectedKYC.riskLevel)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Enviado">{selectedKYC.submittedAt}</Descriptions.Item>
              {selectedKYC.reviewedBy && (
                <>
                  <Descriptions.Item label="Revisado por">{selectedKYC.reviewedBy}</Descriptions.Item>
                  <Descriptions.Item label="Fecha de revisión">{selectedKYC.reviewedAt}</Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Notas" span={2}>{selectedKYC.notes}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: '16px' }}>
              <h4>Documentos</h4>
              <Row gutter={16}>
                {selectedKYC.documents.map((doc, index) => (
                  <Col span={8} key={index}>
                    <Card size="small" title={doc.type}>
                      <div style={{ textAlign: 'center' }}>
                        <Image
                          width={100}
                          src={doc.url}
                          placeholder="Cargando..."
                        />
                        <div style={{ marginTop: '8px' }}>
                          <Tag color={doc.status === 'verified' ? 'green' : 'orange'}>
                            {doc.status}
                          </Tag>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KYCDashboard;