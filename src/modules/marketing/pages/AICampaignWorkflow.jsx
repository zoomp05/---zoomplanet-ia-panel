// src/modules/marketing/pages/AICampaignWorkflow.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Card,
  Steps,
  Button,
  Typography,
  Row,
  Col,
  Progress,
  Space,
  Spin,
  Alert,
  Drawer,
  Tabs,
  Tag,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber
} from 'antd';
import {
  RobotOutlined,
  BulbOutlined,
  TargetOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  StarOutlined
} from '@ant-design/icons';
import useAICampaigns from '../hooks/useAICampaigns.js';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Componente principal del workflow de creación de campañas con IA
 */
const AICampaignWorkflow = () => {
  const navigate = useNavigate();
  const { briefId } = useParams();
  const [form] = Form.useForm();

  // Estados locales
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowMode, setWorkflowMode] = useState('step-by-step'); // 'step-by-step' | 'full-generation'
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [aiOptions, setAiOptions] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    additionalInstructions: ''
  });

  // Hook de AI Campaigns
  const {
    loading,
    generationProgress,
    useCampaignWorkflow,
    generateCampaignBrief,
    generateCampaignObjectives,
    generateCampaignStrategy,
    generateCampaignDocumentation,
    generateMediaIdeas,
    generateFullCampaign,
    generateCampaignStep,
    improveContent,
    resetGenerationProgress
  } = useAICampaigns();

  // Datos del workflow
  const { data: workflowData, loading: workflowLoading, refetch: refetchWorkflow } = useCampaignWorkflow(briefId);

  // Definir pasos del workflow
  const workflowSteps = [
    {
      title: 'Brief de Campaña',
      description: 'Información base y contexto',
      icon: <BulbOutlined />,
      key: 'brief',
      generationType: 'CAMPAIGN_BRIEF'
    },
    {
      title: 'Objetivos',
      description: 'KPIs y métricas de éxito',
      icon: <TargetOutlined />,
      key: 'objectives',
      generationType: 'CAMPAIGN_OBJECTIVES'
    },
    {
      title: 'Estrategia',
      description: 'Canales y tácticas',
      icon: <BarChartOutlined />,
      key: 'strategy',
      generationType: 'CAMPAIGN_STRATEGY'
    },
    {
      title: 'Documentación',
      description: 'Plan de ejecución',
      icon: <FileTextOutlined />,
      key: 'documentation',
      generationType: 'CAMPAIGN_DOCUMENTATION'
    },
    {
      title: 'Ideas de Contenido',
      description: 'Contenido creativo',
      icon: <PlayCircleOutlined />,
      key: 'mediaIdeas',
      generationType: 'MEDIA_IDEAS'
    }
  ];

  // Estado de completitud del workflow
  const completionStatus = workflowData?.campaignWorkflow?.completionStatus || {
    briefComplete: false,
    objectivesComplete: false,
    strategyComplete: false,
    documentationComplete: false,
    mediaIdeasComplete: false,
    overallProgress: 0
  };

  // Efecto para actualizar el paso actual basado en el progreso
  useEffect(() => {
    if (completionStatus) {
      const completed = [
        completionStatus.briefComplete,
        completionStatus.objectivesComplete,
        completionStatus.strategyComplete,
        completionStatus.documentationComplete,
        completionStatus.mediaIdeasComplete
      ];
      
      const lastCompletedIndex = completed.lastIndexOf(true);
      const nextStep = lastCompletedIndex + 1;
      
      if (nextStep < workflowSteps.length && nextStep !== currentStep) {
        setCurrentStep(nextStep);
      }
    }
  }, [completionStatus, currentStep]);

  // Manejar generación paso a paso
  const handleStepGeneration = async (stepIndex) => {
    if (!briefId) {
      message.error('Brief ID no encontrado');
      return;
    }

    try {
      const step = workflowSteps[stepIndex];
      
      switch (step.generationType) {
        case 'CAMPAIGN_OBJECTIVES':
          await generateCampaignObjectives(briefId, 'AWARENESS', aiOptions);
          break;
        case 'CAMPAIGN_STRATEGY':
          await generateCampaignStrategy(briefId, aiOptions);
          break;
        case 'CAMPAIGN_DOCUMENTATION':
          await generateCampaignDocumentation(briefId, aiOptions);
          break;
        case 'MEDIA_IDEAS':
          await generateMediaIdeas(briefId, 'SOCIAL_POSTS', 3, aiOptions);
          break;
        default:
          await generateCampaignStep(briefId, step.generationType, aiOptions);
      }
      
      // Refrescar datos del workflow
      await refetchWorkflow();
      
      // Avanzar al siguiente paso
      if (stepIndex < workflowSteps.length - 1) {
        setCurrentStep(stepIndex + 1);
      }
    } catch (error) {
      console.error('Error in step generation:', error);
    }
  };

  // Manejar generación completa
  const handleFullGeneration = async (briefInput) => {
    try {
      const result = await generateFullCampaign(briefInput, aiOptions);
      
      if (result.success) {
        // Refrescar datos del workflow
        await refetchWorkflow();
        message.success('Campaña completa generada exitosamente');
      }
    } catch (error) {
      console.error('Error in full campaign generation:', error);
    }
  };

  // Manejar mejora de contenido
  const handleContentImprovement = async (documentId, documentType) => {
    Modal.confirm({
      title: 'Mejorar Contenido',
      content: (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            improvementType: 'CLARITY',
            feedback: '',
            suggestions: []
          }}
        >
          <Form.Item
            name="improvementType"
            label="Tipo de Mejora"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="CLARITY">Claridad</Option>
              <Option value="COMPLETENESS">Completitud</Option>
              <Option value="RELEVANCE">Relevancia</Option>
              <Option value="CREATIVITY">Creatividad</Option>
              <Option value="TECHNICAL_ACCURACY">Precisión Técnica</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="feedback"
            label="Comentarios de Mejora"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} placeholder="Describe qué aspectos específicos quieres mejorar..." />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await form.validateFields();
          const improvements = [{
            type: values.improvementType,
            feedback: values.feedback,
            suggestions: values.suggestions || []
          }];
          
          await improveContent(documentId, documentType, improvements, aiOptions);
          await refetchWorkflow();
        } catch (error) {
          console.error('Error improving content:', error);
        }
      }
    });
  };

  // Renderizar preview del contenido
  const renderContentPreview = (content, type) => {
    if (!content) return <Text type="secondary">No hay contenido disponible</Text>;

    switch (type) {
      case 'brief':
        return (
          <div>
            <Title level={4}>{content.name}</Title>
            <Paragraph>{content.description}</Paragraph>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Audiencia Objetivo:</Text>
                <Paragraph>{content.targetAudience}</Paragraph>
              </Col>
              <Col span={12}>
                <Text strong>Presupuesto:</Text>
                <Paragraph>${content.budget?.toLocaleString()}</Paragraph>
              </Col>
            </Row>
            {content.keyMessages && (
              <div>
                <Text strong>Mensajes Clave:</Text>
                <div style={{ marginTop: 8 }}>
                  {content.keyMessages.map((message, index) => (
                    <Tag key={index} color="blue">{message}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'objectives':
        return (
          <div>
            <Title level={5}>Objetivos Primarios</Title>
            {content.primary?.map((obj, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <Text strong>{obj.type}: </Text>
                <Text>{obj.description}</Text>
                <br />
                <Text type="secondary">Prioridad: {obj.priority}</Text>
              </Card>
            ))}
            
            <Title level={5} style={{ marginTop: 16 }}>KPIs</Title>
            {content.kpis?.map((kpi, index) => (
              <Tag key={index} color="green">{kpi.name}: {kpi.targetValue} {kpi.unit}</Tag>
            ))}
          </div>
        );

      case 'strategy':
        return (
          <div>
            <Title level={5}>Enfoque Estratégico</Title>
            <Paragraph>{content.approach}</Paragraph>
            
            <Title level={5}>Canales</Title>
            {content.channels?.map((channel, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <Text strong>{channel.channel}</Text>
                <Paragraph>{channel.description}</Paragraph>
                <Text type="secondary">Presupuesto: ${channel.budget?.toLocaleString()}</Text>
              </Card>
            ))}
          </div>
        );

      case 'documentation':
        return (
          <div>
            <Title level={5}>Plan de Ejecución</Title>
            <Paragraph>{content.executionPlan}</Paragraph>
            
            <Title level={5}>Calendario de Contenido</Title>
            {content.contentCalendar?.slice(0, 5).map((item, index) => (
              <Card key={index} size="small" style={{ marginBottom: 4 }}>
                <Row justify="space-between">
                  <Col><Text strong>{item.title}</Text></Col>
                  <Col><Text type="secondary">{item.date}</Text></Col>
                </Row>
                <Text>{item.description}</Text>
              </Card>
            ))}
          </div>
        );

      case 'mediaIdeas':
        return (
          <div>
            {content.map((idea, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <Row justify="space-between" align="top">
                  <Col span={16}>
                    <Title level={5}>{idea.title}</Title>
                    <Paragraph>{idea.description}</Paragraph>
                    <Space>
                      <Tag color="purple">{idea.contentType}</Tag>
                      {idea.qualityScore && (
                        <Tag color="gold">
                          <StarOutlined /> {idea.qualityScore}
                        </Tag>
                      )}
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Button 
                      size="small" 
                      icon={<EyeOutlined />}
                      onClick={() => setSelectedContent({...idea, type: 'mediaIdea'})}
                    >
                      Ver Detalle
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        );

      default:
        return <pre>{JSON.stringify(content, null, 2)}</pre>;
    }
  };

  // Renderizar barra de progreso del paso actual
  const renderStepProgress = () => {
    if (!loading || !generationProgress.step) return null;

    return (
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text strong>
                <RobotOutlined spin style={{ marginRight: 8, color: '#1890ff' }} />
                {generationProgress.step}
              </Text>
            </Col>
            <Col>
              <Text type="secondary">{generationProgress.progress}%</Text>
            </Col>
          </Row>
          <Progress 
            percent={generationProgress.progress} 
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <Text type="secondary">{generationProgress.message}</Text>
        </Space>
      </Card>
    );
  };

  // Renderizar controles del workflow
  const renderWorkflowControls = () => {
    const currentStepData = workflowSteps[currentStep];
    const isStepCompleted = completionStatus[`${currentStepData?.key}Complete`];
    
    return (
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4}>
              {currentStepData?.icon} {currentStepData?.title}
            </Title>
            <Text type="secondary">{currentStepData?.description}</Text>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Configurar IA">
                <Button 
                  icon={<SettingOutlined />} 
                  onClick={() => setShowSettings(true)}
                />
              </Tooltip>
              {isStepCompleted && (
                <Tooltip title="Mejorar contenido">
                  <Button 
                    icon={<ThunderboltOutlined />}
                    type="primary"
                    ghost
                    onClick={() => {
                      const workflow = workflowData?.campaignWorkflow;
                      const currentContent = workflow?.[currentStepData.key];
                      if (currentContent) {
                        handleContentImprovement(currentContent.id, currentStepData.generationType);
                      }
                    }}
                  >
                    Mejorar con IA
                  </Button>
                </Tooltip>
              )}
            </Space>
          </Col>
        </Row>

        {isStepCompleted ? (
          <Alert
            message="Paso Completado"
            description="Este componente ha sido generado exitosamente. Puedes revisarlo, mejorarlo o continuar al siguiente paso."
            type="success"
            action={
              <Space>
                <Button 
                  size="small" 
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedContent({
                      ...workflowData?.campaignWorkflow?.[currentStepData.key],
                      type: currentStepData.key
                    });
                    setShowPreview(true);
                  }}
                >
                  Ver Contenido
                </Button>
                {currentStep < workflowSteps.length - 1 && (
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Siguiente Paso
                  </Button>
                )}
              </Space>
            }
          />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Listo para Generar"
              description={`Usa IA para generar ${currentStepData?.title.toLowerCase()} basándose en la información anterior.`}
              type="info"
            />
            <Button
              type="primary"
              icon={<RobotOutlined />}
              loading={loading}
              onClick={() => handleStepGeneration(currentStep)}
              size="large"
              style={{ width: '100%' }}
            >
              Generar con IA
            </Button>
          </Space>
        )}
      </Card>
    );
  };

  if (workflowLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Cargando workflow de campaña...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/marketing/campaigns')}
            >
              Volver
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Workflow de Campaña IA
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            <Text type="secondary">
              Progreso: {Math.round(completionStatus.overallProgress)}%
            </Text>
            <Progress
              type="circle"
              size={60}
              percent={Math.round(completionStatus.overallProgress)}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Space>
        </Col>
      </Row>

      {/* Progress Bar */}
      {renderStepProgress()}

      {/* Steps Navigation */}
      <Card style={{ marginBottom: 24 }}>
        <Steps 
          current={currentStep} 
          onChange={setCurrentStep}
          size="small"
        >
          {workflowSteps.map((step, index) => {
            const isCompleted = completionStatus[`${step.key}Complete`];
            return (
              <Step
                key={step.key}
                title={step.title}
                description={step.description}
                icon={isCompleted ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : step.icon}
                status={isCompleted ? 'finish' : (index === currentStep ? 'process' : 'wait')}
              />
            );
          })}
        </Steps>
      </Card>

      {/* Main Content */}
      <Row gutter={24}>
        {/* Controls Column */}
        <Col span={14}>
          {renderWorkflowControls()}
        </Col>

        {/* Preview Column */}
        <Col span={10}>
          <Card 
            title="Vista Previa del Contenido"
            extra={
              <Button 
                size="small" 
                icon={<EyeOutlined />}
                onClick={() => setShowPreview(true)}
              >
                Ver Completo
              </Button>
            }
          >
            {workflowData?.campaignWorkflow ? (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {renderContentPreview(
                  workflowData.campaignWorkflow[workflowSteps[currentStep]?.key],
                  workflowSteps[currentStep]?.key
                )}
              </div>
            ) : (
              <Text type="secondary">No hay contenido disponible</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Content Preview Drawer */}
      <Drawer
        title="Vista Completa del Contenido"
        placement="right"
        width={720}
        open={showPreview}
        onClose={() => setShowPreview(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />}>Editar</Button>
            <Button icon={<HistoryOutlined />}>Versiones</Button>
          </Space>
        }
      >
        {selectedContent && (
          <div>
            {renderContentPreview(selectedContent, selectedContent.type)}
          </div>
        )}
      </Drawer>

      {/* AI Settings Modal */}
      <Modal
        title="Configuración de IA"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        onOk={() => setShowSettings(false)}
        width={600}
      >
        <Form
          layout="vertical"
          initialValues={aiOptions}
          onValuesChange={(_, values) => setAiOptions(values)}
        >
          <Form.Item
            name="model"
            label="Modelo de IA"
          >
            <Select>
              <Option value="gpt-4">GPT-4 (Más preciso)</Option>
              <Option value="gpt-3.5-turbo">GPT-3.5 Turbo (Más rápido)</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="temperature"
            label="Creatividad (Temperature)"
            tooltip="Valores más altos = más creatividad, valores más bajos = más consistencia"
          >
            <InputNumber
              min={0}
              max={1}
              step={0.1}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="maxTokens"
            label="Máximo de Tokens"
          >
            <InputNumber
              min={500}
              max={4000}
              step={100}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="additionalInstructions"
            label="Instrucciones Adicionales"
          >
            <TextArea
              rows={4}
              placeholder="Instrucciones específicas para la generación de contenido..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AICampaignWorkflow;
