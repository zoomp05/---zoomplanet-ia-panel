// src/modules/marketing/pages/AICampaignDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Tag,
  Progress,
  Tabs,
  List,
  Descriptions,
  Timeline,
  Alert,
  Statistic,
  Badge,
  Avatar,
  Divider,
  Tooltip,
  Modal,
  Drawer,
  Table,
  Empty,
  Spin,
  message
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  RobotOutlined,
  BulbOutlined,
  TargetOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  EyeOutlined,
  CopyOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  TagOutlined,
  TrophyOutlined,
  ReloadOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import useAICampaigns from '../hooks/useAICampaigns.js';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Página de detalles de una campaña AI específica
 */
const AICampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados locales
  const [activeTab, setActiveTab] = useState('overview');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Hook de AI Campaigns
  const {
    useCampaignBrief,
    useCampaignObjectives,
    useCampaignStrategy,
    useCampaignDocumentation,
    useCampaignMediaIdeas,
    getCampaignWorkflowStatus,
    deleteCampaignBrief,
    improveCampaignBrief
  } = useAICampaigns();

  // Queries para obtener datos de la campaña
  const { data: briefData, loading: briefLoading, refetch: refetchBrief } = useCampaignBrief(id);
  const { data: objectivesData } = useCampaignObjectives({ briefId: id });
  const { data: strategyData } = useCampaignStrategy({ briefId: id });
  const { data: documentationData } = useCampaignDocumentation({ briefId: id });
  const { data: mediaIdeasData } = useCampaignMediaIdeas({ briefId: id });

  // Estado del workflow
  const [workflowStatus, setWorkflowStatus] = useState(null);

  const campaign = briefData?.campaignBrief;
  const objectives = objectivesData?.campaignObjectives?.nodes || [];
  const strategies = strategyData?.campaignStrategies?.nodes || [];
  const documentation = documentationData?.campaignDocumentations?.nodes || [];
  const mediaIdeas = mediaIdeasData?.campaignMediaIdeas?.nodes || [];

  // Obtener estado del workflow
  useEffect(() => {
    if (id) {
      getCampaignWorkflowStatus(id).then(setWorkflowStatus);
    }
  }, [id, getCampaignWorkflowStatus]);

  // Manejar eliminación
  const handleDelete = async () => {
    try {
      await deleteCampaignBrief(id);
      message.success('Campaña eliminada correctamente');
      navigate('/marketing/ai-campaigns');
    } catch (error) {
      message.error('Error al eliminar la campaña');
    }
  };

  // Manejar mejora con IA
  const handleImprove = async () => {
    try {
      await improveCampaignBrief(id, {
        targetImprovement: 'Mejorar claridad y efectividad del mensaje'
      });
      refetchBrief();
      message.success('Campaña mejorada con IA');
    } catch (error) {
      message.error('Error al mejorar la campaña');
    }
  };

  if (briefLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty description="Campaña no encontrada" />
      </div>
    );
  }

  // Renderizar header con información básica
  const renderHeader = () => (
    <Card style={{ marginBottom: 24 }}>
      <Row justify="space-between" align="top">
        <Col span={18}>
          <Space direction="vertical" size="small">
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/marketing/ai-campaigns')}
              style={{ padding: 0, marginBottom: 8 }}
            >
              Volver a campañas
            </Button>
            
            <Space align="center">
              <Title level={2} style={{ margin: 0 }}>
                {campaign.name}
              </Title>
              {campaign.aiGenerated && (
                <Tag color="blue" icon={<RobotOutlined />}>
                  Generada con IA
                </Tag>
              )}
              <Tag color="purple">v{campaign.version?.full}</Tag>
              {renderQualityBadge(campaign.qualityScore)}
            </Space>
            
            <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 0 }}>
              {campaign.description}
            </Paragraph>
          </Space>
        </Col>
        
        <Col>
          <Space>
            <Button 
              icon={<ThunderboltOutlined />}
              onClick={handleImprove}
            >
              Mejorar con IA
            </Button>
            <Button 
              icon={<EditOutlined />}
              onClick={() => navigate(`/marketing/campaigns/edit/${id}`)}
            >
              Editar
            </Button>
            <Button 
              icon={<ShareAltOutlined />}
            >
              Compartir
            </Button>
            <Button 
              danger
              icon={<DeleteOutlined />}
              onClick={() => setShowDeleteModal(true)}
            >
              Eliminar
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  // Renderizar progreso del workflow
  const renderWorkflowProgress = () => {
    if (!workflowStatus) return null;

    const steps = [
      { key: 'brief', label: 'Brief', completed: workflowStatus.briefComplete },
      { key: 'objectives', label: 'Objetivos', completed: workflowStatus.objectivesComplete },
      { key: 'strategy', label: 'Estrategia', completed: workflowStatus.strategyComplete },
      { key: 'documentation', label: 'Documentación', completed: workflowStatus.documentationComplete },
      { key: 'mediaIdeas', label: 'Ideas de Media', completed: workflowStatus.mediaIdeasComplete }
    ];

    const completedSteps = steps.filter(s => s.completed).length;
    const progress = (completedSteps / steps.length) * 100;

    return (
      <Card title="Progreso del Workflow" style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col span={16}>
            <div style={{ marginBottom: 16 }}>
              <Progress 
                percent={Math.round(progress)} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={() => `${completedSteps}/${steps.length}`}
              />
            </div>
            <Space wrap>
              {steps.map(step => (
                <Tag 
                  key={step.key}
                  color={step.completed ? 'green' : 'default'}
                  icon={step.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                >
                  {step.label}
                </Tag>
              ))}
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary"
                block
                icon={<PlayCircleOutlined />}
                onClick={() => navigate(`/marketing/ai-workflow/${id}`)}
              >
                Continuar Workflow
              </Button>
              <Button 
                block
                icon={<EyeOutlined />}
                onClick={() => navigate(`/marketing/ai-workflow/${id}?view=true`)}
              >
                Ver Workflow
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  // Renderizar estadísticas principales
  const renderMainStats = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Presupuesto"
            value={campaign.budget || 0}
            prefix={<DollarOutlined />}
            formatter={(value) => `$${value.toLocaleString()}`}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Componentes"
            value={[objectives, strategies, documentation, mediaIdeas].reduce((sum, arr) => sum + arr.length, 0)}
            prefix={<FileTextOutlined />}
            suffix="elementos"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Versión"
            value={campaign.version?.full || '1.0.0'}
            prefix={<TagOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Creada"
            value={new Date(campaign.createdAt).toLocaleDateString()}
            prefix={<CalendarOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );

  // Renderizar badge de calidad
  const renderQualityBadge = (score) => {
    const configs = {
      EXCELLENT: { color: 'success', text: 'Excelente' },
      GOOD: { color: 'processing', text: 'Bueno' },
      FAIR: { color: 'warning', text: 'Regular' },
      POOR: { color: 'error', text: 'Pobre' }
    };
    
    const config = configs[score] || { color: 'default', text: 'N/A' };
    
    return (
      <Badge status={config.color} text={config.text} />
    );
  };

  // Renderizar información de IA
  const renderAIInfo = () => {
    if (!campaign.aiGenerated || !campaign.aiGenerationInfo) {
      return (
        <Card>
          <Empty description="Esta campaña no fue generada con IA" />
        </Card>
      );
    }

    const aiInfo = campaign.aiGenerationInfo;

    return (
      <Card title="Información de Generación IA">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Modelo">{aiInfo.model}</Descriptions.Item>
          <Descriptions.Item label="Versión">{aiInfo.version}</Descriptions.Item>
          <Descriptions.Item label="Tiempo de Procesamiento">
            {aiInfo.processingTime}ms
          </Descriptions.Item>
          <Descriptions.Item label="Costo">
            ${aiInfo.cost?.toFixed(4)}
          </Descriptions.Item>
          <Descriptions.Item label="Tokens Utilizados">
            {aiInfo.tokensUsed?.toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de Generación">
            {new Date(aiInfo.generatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {aiInfo.improvements && aiInfo.improvements.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>Mejoras Aplicadas</Title>
            <Timeline>
              {aiInfo.improvements.map((improvement, index) => (
                <Timeline.Item 
                  key={index}
                  color="green"
                  dot={<ThunderboltOutlined />}
                >
                  <Text strong>{improvement.type}</Text>
                  <br />
                  <Text type="secondary">{improvement.description}</Text>
                  <br />
                  <Text style={{ fontSize: 12 }}>
                    {new Date(improvement.appliedAt).toLocaleString()}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Card>
    );
  };

  // Renderizar componentes del workflow
  const renderWorkflowComponents = () => (
    <Card title="Componentes del Workflow">
      <Row gutter={16}>
        <Col span={12}>
          <Card size="small" title="Objetivos" extra={<Badge count={objectives.length} />}>
            <List
              size="small"
              dataSource={objectives.slice(0, 3)}
              renderItem={(obj) => (
                <List.Item>
                  <TargetOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <Text ellipsis>{obj.description}</Text>
                </List.Item>
              )}
            />
            {objectives.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Button type="link" size="small">
                  Ver todos ({objectives.length})
                </Button>
              </div>
            )}
          </Card>
        </Col>
        
        <Col span={12}>
          <Card size="small" title="Estrategias" extra={<Badge count={strategies.length} />}>
            <List
              size="small"
              dataSource={strategies.slice(0, 3)}
              renderItem={(strategy) => (
                <List.Item>
                  <BulbOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  <Text ellipsis>{strategy.description}</Text>
                </List.Item>
              )}
            />
            {strategies.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Button type="link" size="small">
                  Ver todas ({strategies.length})
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card size="small" title="Documentación" extra={<Badge count={documentation.length} />}>
            <List
              size="small"
              dataSource={documentation.slice(0, 3)}
              renderItem={(doc) => (
                <List.Item>
                  <FileTextOutlined style={{ marginRight: 8, color: '#faad14' }} />
                  <Text ellipsis>{doc.title}</Text>
                </List.Item>
              )}
            />
            {documentation.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Button type="link" size="small">
                  Ver todos ({documentation.length})
                </Button>
              </div>
            )}
          </Card>
        </Col>
        
        <Col span={12}>
          <Card size="small" title="Ideas de Media" extra={<Badge count={mediaIdeas.length} />}>
            <List
              size="small"
              dataSource={mediaIdeas.slice(0, 3)}
              renderItem={(idea) => (
                <List.Item>
                  <StarOutlined style={{ marginRight: 8, color: '#f759ab' }} />
                  <Text ellipsis>{idea.title}</Text>
                </List.Item>
              )}
            />
            {mediaIdeas.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Button type="link" size="small">
                  Ver todas ({mediaIdeas.length})
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  );

  // Renderizar historial de versiones
  const renderVersionHistory = () => (
    <Drawer
      title="Historial de Versiones"
      placement="right"
      width={600}
      open={showVersionHistory}
      onClose={() => setShowVersionHistory(false)}
    >
      <Timeline>
        <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
          <Text strong>v{campaign.version?.full} (Actual)</Text>
          <br />
          <Text type="secondary">{new Date(campaign.updatedAt).toLocaleString()}</Text>
          <br />
          <Text>Versión actual de la campaña</Text>
        </Timeline.Item>
        
        {/* Aquí se pueden agregar versiones anteriores desde el historial */}
        <Timeline.Item color="blue">
          <Text strong>v{campaign.version?.major}.{campaign.version?.minor}.0</Text>
          <br />
          <Text type="secondary">{new Date(campaign.createdAt).toLocaleString()}</Text>
          <br />
          <Text>Versión inicial creada</Text>
          {campaign.aiGenerated && (
            <Tag color="blue" icon={<RobotOutlined />} style={{ marginTop: 4 }}>
              Generada con IA
            </Tag>
          )}
        </Timeline.Item>
      </Timeline>
    </Drawer>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      {renderHeader()}

      {/* Progreso del Workflow */}
      {renderWorkflowProgress()}

      {/* Estadísticas principales */}
      {renderMainStats()}

      {/* Tabs con contenido detallado */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Resumen" key="overview">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Descriptions title="Información General" bordered column={2}>
                <Descriptions.Item label="Nombre">{campaign.name}</Descriptions.Item>
                <Descriptions.Item label="Calidad">
                  {renderQualityBadge(campaign.qualityScore)}
                </Descriptions.Item>
                <Descriptions.Item label="Presupuesto" span={2}>
                  ${campaign.budget?.toLocaleString() || 'No especificado'}
                </Descriptions.Item>
                <Descriptions.Item label="Timeline" span={2}>
                  {campaign.timeline || 'No especificado'}
                </Descriptions.Item>
                <Descriptions.Item label="Audiencia Objetivo" span={2}>
                  {campaign.targetAudience}
                </Descriptions.Item>
                <Descriptions.Item label="Descripción" span={2}>
                  {campaign.description}
                </Descriptions.Item>
              </Descriptions>

              {campaign.keyMessages && campaign.keyMessages.length > 0 && (
                <div>
                  <Title level={5}>Mensajes Clave</Title>
                  <Space wrap>
                    {campaign.keyMessages.map((message, index) => (
                      <Tag key={index} color="blue">{message}</Tag>
                    ))}
                  </Space>
                </div>
              )}

              {campaign.successMetrics && campaign.successMetrics.length > 0 && (
                <div>
                  <Title level={5}>Métricas de Éxito</Title>
                  <List
                    dataSource={campaign.successMetrics}
                    renderItem={(metric) => (
                      <List.Item>
                        <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        {metric}
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Space>
          </TabPane>

          <TabPane tab="Componentes" key="components">
            {renderWorkflowComponents()}
          </TabPane>

          <TabPane tab="IA" key="ai-info">
            {renderAIInfo()}
          </TabPane>

          <TabPane tab="Actividad" key="activity">
            <Card title="Actividad Reciente">
              <Timeline>
                <Timeline.Item color="green">
                  <Text strong>Campaña creada</Text>
                  <br />
                  <Text type="secondary">{new Date(campaign.createdAt).toLocaleString()}</Text>
                </Timeline.Item>
                
                {campaign.updatedAt !== campaign.createdAt && (
                  <Timeline.Item color="blue">
                    <Text strong>Última actualización</Text>
                    <br />
                    <Text type="secondary">{new Date(campaign.updatedAt).toLocaleString()}</Text>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Modal
        title="¿Eliminar campaña?"
        open={showDeleteModal}
        onOk={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        okText="Eliminar"
        cancelText="Cancelar"
        okType="danger"
      >
        <p>Esta acción no se puede deshacer. Se eliminarán todos los componentes asociados.</p>
      </Modal>

      {/* Drawer de historial de versiones */}
      {renderVersionHistory()}

      {/* Botón flotante para ver historial */}
      <Button
        type="primary"
        shape="circle"
        icon={<HistoryOutlined />}
        size="large"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={() => setShowVersionHistory(true)}
      />
    </div>
  );
};

export default AICampaignDetail;
