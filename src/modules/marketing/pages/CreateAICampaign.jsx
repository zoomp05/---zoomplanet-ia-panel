// src/modules/marketing/pages/CreateAICampaign.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Row,
  Col,
  Typography,
  Space,
  Steps,
  Radio,
  Divider,
  Alert,
  Tooltip,
  Switch,
  Tag,
  Progress,
  Modal
} from 'antd';
import {
  ArrowLeftOutlined,
  RobotOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useMarketingCampaignManager } from '../hooks/useMarketingCampaigns.js';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

/**
 * Componente para crear campañas con IA - Entrada del workflow
 */
const CreateAICampaign = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Estados locales
  const [creationMode, setCreationMode] = useState('step-by-step'); // 'step-by-step' | 'full-generation' | 'manual'
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [aiOptions, setAiOptions] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    additionalInstructions: ''
  });

  // Hook de Marketing Campaigns
  const {
    isLoading,
    createAICampaign
  } = useMarketingCampaignManager();

  // Estados auxiliares para generación AI (stubs provisionales)
  const [generationProgress, setGenerationProgress] = useState({ step: null, progress: 0, message: '' });

  const resetGenerationProgress = () => setGenerationProgress({ step: null, progress: 0, message: '' });

  // Stubs de funciones IA (reemplazar cuando se integre flujo real)
  const generateFullCampaign = async (campaignInput, aiOptions) => {
    setGenerationProgress({ step: 'Generando campaña completa', progress: 100, message: 'Proceso completado (stub)' });
    return { success: false, results: [] }; // Ajustar cuando exista backend
  };
  const generateCampaignBrief = async (campaignInput, aiOptions) => {
    setGenerationProgress({ step: 'Generando brief', progress: 100, message: 'Brief generado (stub)' });
    return { success: false, data: null }; // Ajustar al integrar
  };
  const createCampaignBrief = async (campaignInput) => {
    // Usa createAICampaign como placeholder para crear registro base
    try {
      const created = await createAICampaign({
        title: campaignInput.name,
        context: campaignInput.description,
        goal: 'AWARENESS',
        industry: 'GENERAL'
      });
      return created || { id: null };
    } catch {
      return { id: null };
    }
  };

  // Campos del formulario base
  const baseFormFields = [
    {
      name: 'name',
      label: 'Nombre de la Campaña',
      rules: [{ required: true, message: 'El nombre es requerido' }],
      component: <Input placeholder="Ej: Lanzamiento Producto Q1 2024" />
    },
    {
      name: 'description',
      label: 'Descripción General',
      rules: [{ required: true, message: 'La descripción es requerida' }],
      component: <TextArea rows={4} placeholder="Describe brevemente los objetivos y contexto de la campaña..." />
    },
    {
      name: 'targetAudience',
      label: 'Audiencia Objetivo',
      rules: [{ required: true, message: 'La audiencia objetivo es requerida' }],
      component: <TextArea rows={3} placeholder="Describe tu audiencia objetivo: demografía, intereses, comportamientos..." />
    },
    {
      name: 'budget',
      label: 'Presupuesto Total (USD)',
      rules: [{ required: true, message: 'El presupuesto es requerido' }],
      component: <InputNumber
        style={{ width: '100%' }}
        min={1000}
        max={10000000}
        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={value => value.replace(/\$\s?|(,*)/g, '')}
        placeholder="50000"
      />
    },
    {
      name: 'timeline',
      label: 'Duración de la Campaña',
      rules: [{ required: true, message: 'La duración es requerida' }],
      component: <Select placeholder="Selecciona la duración">
        <Option value="1 mes">1 mes</Option>
        <Option value="2 meses">2 meses</Option>
        <Option value="3 meses">3 meses</Option>
        <Option value="6 meses">6 meses</Option>
        <Option value="1 año">1 año</Option>
        <Option value="Personalizado">Personalizado</Option>
      </Select>
    }
  ];

  // Manejar envío del formulario
  const handleSubmit = async (values) => {
    try {
      resetGenerationProgress();

      // Preparar input para la campaña
      const campaignInput = {
        ...values,
        keyMessages: values.keyMessages ? values.keyMessages.split(',').map(msg => msg.trim()) : [],
        constraints: values.constraints ? values.constraints.split(',').map(c => c.trim()) : [],
        successMetrics: values.successMetrics ? values.successMetrics.split(',').map(m => m.trim()) : [],
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : ['ai-generated'],
        account: '507f1f77bcf86cd799439011', // Mock account ID
        project: '507f1f77bcf86cd799439012'  // Mock project ID
      };

      let result;

      switch (creationMode) {
        case 'full-generation':
          // Generar campaña completa con IA
          result = await generateFullCampaign(campaignInput, aiOptions);
          if (result.success && result.results.length > 0) {
            const briefData = result.results.find(r => r.data && typeof r.data === 'object');
            if (briefData?.data?.id) {
              navigate(`/marketing/ai-workflow/${briefData.data.id}`);
              return;
            }
          }
          break;

        case 'step-by-step':
          // Generar solo el brief inicial
          result = await generateCampaignBrief(campaignInput, aiOptions);
          if (result.success && result.data?.id) {
            navigate(`/marketing/ai-workflow/${result.data.id}`);
            return;
          }
          break;

        case 'manual':
          // Crear brief manualmente
          result = await createCampaignBrief(campaignInput);
          if (result?.id) {
            navigate(`/marketing/ai-workflow/${result.id}`);
            return;
          }
          break;

        default:
          throw new Error('Modo de creación no válido');
      }

      // Si llegamos aquí, algo salió mal
      throw new Error('No se pudo crear la campaña correctamente');

    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  // Renderizar barra de progreso para generación completa
  const renderGenerationProgress = () => {
    if (!isLoading || !generationProgress.step) return null;

    return (
      <Card style={{ marginBottom: 24 }}>
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

  // Renderizar opciones de creación
  const renderCreationModes = () => {
    const modes = [
      {
        value: 'step-by-step',
        title: 'Paso a Paso con IA',
        description: 'Guía interactiva donde generas cada componente de la campaña individualmente',
        icon: <BulbOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
        pros: ['Control total del proceso', 'Revisión en cada paso', 'Personalización detallada'],
        recommended: true,
        estimatedTime: '15-20 min'
      },
      {
        value: 'full-generation',
        title: 'Generación Completa IA',
        description: 'La IA genera automáticamente toda la campaña basándose en tu información inicial',
        icon: <ThunderboltOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
        pros: ['Más rápido', 'Coherencia garantizada', 'Menos intervención manual'],
        recommended: false,
        estimatedTime: '2-5 min'
      },
      {
        value: 'manual',
        title: 'Creación Manual',
        description: 'Crea el brief inicial manualmente y usa IA para componentes específicos más tarde',
        icon: <SettingOutlined style={{ fontSize: 24, color: '#faad14' }} />,
        pros: ['Control total', 'Flexibilidad máxima', 'Uso opcional de IA'],
        recommended: false,
        estimatedTime: '30+ min'
      }
    ];

    return (
      <Card title="Selecciona el Método de Creación" style={{ marginBottom: 24 }}>
        <Radio.Group 
          value={creationMode} 
          onChange={(e) => setCreationMode(e.target.value)}
          style={{ width: '100%' }}
        >
          <Row gutter={16}>
            {modes.map((mode) => (
              <Col span={8} key={mode.value}>
                <Card
                  hoverable
                  className={creationMode === mode.value ? 'selected-card' : ''}
                  style={{
                    border: creationMode === mode.value ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    position: 'relative'
                  }}
                  onClick={() => setCreationMode(mode.value)}
                >
                  {mode.recommended && (
                    <Tag color="gold" style={{ position: 'absolute', top: 8, right: 8 }}>
                      Recomendado
                    </Tag>
                  )}
                  
                  <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
                    <Radio value={mode.value} style={{ display: 'none' }} />
                    {mode.icon}
                    <Title level={5}>{mode.title}</Title>
                    <Paragraph style={{ fontSize: 12, margin: 0 }}>
                      {mode.description}
                    </Paragraph>
                    
                    <div style={{ marginTop: 12 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Tiempo estimado: {mode.estimatedTime}
                      </Text>
                    </div>
                    
                    <div style={{ marginTop: 8 }}>
                      {mode.pros.map((pro, index) => (
                        <div key={index} style={{ fontSize: 11, color: '#52c41a' }}>
                          <CheckCircleOutlined style={{ marginRight: 4 }} />
                          {pro}
                        </div>
                      ))}
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </Card>
    );
  };

  // Renderizar información del proceso
  const renderProcessInfo = () => {
    const processSteps = {
      'step-by-step': [
        'Generar brief inicial con IA',
        'Revisar y ajustar objetivos',
        'Desarrollar estrategia paso a paso',
        'Crear documentación de ejecución',
        'Generar ideas de contenido'
      ],
      'full-generation': [
        'Procesar información inicial',
        'Generar brief completo',
        'Crear objetivos y KPIs',
        'Desarrollar estrategia integral',
        'Producir todo el contenido'
      ],
      'manual': [
        'Crear brief manualmente',
        'Usar IA para componentes específicos',
        'Personalizar cada sección',
        'Validar consistencia',
        'Generar contenido final'
      ]
    };

    return (
      <Card 
        title={`Proceso: ${creationMode === 'step-by-step' ? 'Paso a Paso' : creationMode === 'full-generation' ? 'Generación Completa' : 'Manual'}`}
        style={{ marginBottom: 24 }}
      >
        <Steps
          direction="vertical"
          size="small"
          current={-1}
        >
          {processSteps[creationMode]?.map((step, index) => (
            <Step
              key={index}
              title={step}
              status="wait"
            />
          ))}
        </Steps>
      </Card>
    );
  };

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
              Crear Nueva Campaña con IA
            </Title>
          </Space>
        </Col>
        <Col>
          <Tooltip title="Configurar opciones de IA">
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setShowAdvancedSettings(true)}
            >
              Configuración IA
            </Button>
          </Tooltip>
        </Col>
      </Row>

      {/* Progress Bar durante generación */}
      {renderGenerationProgress()}

      <Row gutter={24}>
        {/* Formulario Principal */}
        <Col span={16}>
          {/* Selección de Método */}
          {renderCreationModes()}

          {/* Alert informativo */}
          <Alert
            message={`Método Seleccionado: ${
              creationMode === 'step-by-step' ? 'Paso a Paso con IA' :
              creationMode === 'full-generation' ? 'Generación Completa IA' : 'Creación Manual'
            }`}
            description={
              creationMode === 'step-by-step' 
                ? 'Serás guiado a través de cada paso del proceso de creación de la campaña.'
                : creationMode === 'full-generation'
                ? 'La IA generará automáticamente todos los componentes de la campaña.'
                : 'Tendrás control total sobre cada aspecto de la campaña.'
            }
            type="info"
            style={{ marginBottom: 24 }}
            showIcon
          />

          {/* Formulario Base */}
          <Card title="Información Base de la Campaña">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                model: 'gpt-4',
                temperature: 0.7,
                maxTokens: 2000
              }}
            >
              <Row gutter={16}>
                {baseFormFields.map((field) => (
                  <Col span={field.name === 'description' ? 24 : 12} key={field.name}>
                    <Form.Item
                      name={field.name}
                      label={field.label}
                      rules={field.rules}
                    >
                      {field.component}
                    </Form.Item>
                  </Col>
                ))}
              </Row>

              <Divider />

              {/* Campos Opcionales */}
              <Title level={5}>
                Información Adicional (Opcional)
                <Tooltip title="Esta información ayudará a la IA a generar contenido más específico">
                  <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                </Tooltip>
              </Title>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="keyMessages"
                    label="Mensajes Clave"
                    tooltip="Separa múltiples mensajes con comas"
                  >
                    <TextArea 
                      rows={3} 
                      placeholder="Innovación, Calidad, Resultados"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="toneOfVoice"
                    label="Tono de Voz"
                  >
                    <Select placeholder="Selecciona el tono">
                      <Option value="Profesional">Profesional</Option>
                      <Option value="Amigable">Amigable</Option>
                      <Option value="Técnico">Técnico</Option>
                      <Option value="Creativo">Creativo</Option>
                      <Option value="Autoritativo">Autoritativo</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="constraints"
                    label="Restricciones"
                    tooltip="Limitaciones o consideraciones especiales"
                  >
                    <TextArea 
                      rows={2} 
                      placeholder="Presupuesto limitado, Temporada alta, Regulaciones"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="successMetrics"
                    label="Métricas de Éxito"
                    tooltip="¿Cómo medirás el éxito de esta campaña?"
                  >
                    <TextArea 
                      rows={2} 
                      placeholder="Awareness +20%, Leads +30%, ROI 3:1"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Botón de Envío */}
              <Row justify="center" style={{ marginTop: 32 }}>
                <Col>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={isLoading}
                    icon={
                      creationMode === 'manual' ? <PlayCircleOutlined /> : <RobotOutlined />
                    }
                    style={{ width: 200 }}
                  >
                    {creationMode === 'step-by-step' && 'Comenzar Workflow'}
                    {creationMode === 'full-generation' && 'Generar Campaña'}
                    {creationMode === 'manual' && 'Crear Campaña'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* Panel Lateral */}
        <Col span={8}>
          {renderProcessInfo()}

          {/* Tips y Consejos */}
          <Card title="💡 Tips para Mejores Resultados" size="small">
            <Space direction="vertical" size="small">
              <Text style={{ fontSize: 12 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                Sé específico en la descripción de tu audiencia
              </Text>
              <Text style={{ fontSize: 12 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                Define métricas de éxito claras y medibles
              </Text>
              <Text style={{ fontSize: 12 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                Incluye restricciones o consideraciones especiales
              </Text>
              <Text style={{ fontSize: 12 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                El tono de voz afecta todo el contenido generado
              </Text>
            </Space>
          </Card>

          {/* Estimación de Costos */}
          {creationMode !== 'manual' && (
            <Card title="📊 Estimación de Costos IA" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row justify="space-between">
                  <Text style={{ fontSize: 12 }}>Brief Generation:</Text>
                  <Text style={{ fontSize: 12 }}>~$0.15</Text>
                </Row>
                {creationMode === 'full-generation' && (
                  <>
                    <Row justify="space-between">
                      <Text style={{ fontSize: 12 }}>Full Campaign:</Text>
                      <Text style={{ fontSize: 12 }}>~$2.50</Text>
                    </Row>
                    <Divider style={{ margin: '8px 0' }} />
                    <Row justify="space-between">
                      <Text strong style={{ fontSize: 12 }}>Total Estimado:</Text>
                      <Text strong style={{ fontSize: 12, color: '#1890ff' }}>~$2.65</Text>
                    </Row>
                  </>
                )}
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal de Configuración Avanzada de IA */}
      <Modal
        title="Configuración Avanzada de IA"
        open={showAdvancedSettings}
        onCancel={() => setShowAdvancedSettings(false)}
        onOk={() => setShowAdvancedSettings(false)}
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
            tooltip="GPT-4 es más preciso pero más lento, GPT-3.5 es más rápido pero menos preciso"
          >
            <Select>
              <Option value="gpt-4">
                GPT-4 (Recomendado)
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                  Más preciso, ~$0.03/request adicional
                </Text>
              </Option>
              <Option value="gpt-3.5-turbo">
                GPT-3.5 Turbo
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                  Más rápido, menor costo
                </Text>
              </Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="temperature"
            label={`Creatividad: ${aiOptions.temperature}`}
            tooltip="0 = Muy consistente, 1 = Muy creativo"
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
            tooltip="Limita la longitud de la respuesta"
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
            tooltip="Guías específicas para la generación de contenido"
          >
            <TextArea
              rows={4}
              placeholder="Ej: Enfócate en marketing B2B, incluye métricas técnicas, usa un tono profesional..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .selected-card {
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
        }
      `}</style>
    </div>
  );
};

export default CreateAICampaign;
