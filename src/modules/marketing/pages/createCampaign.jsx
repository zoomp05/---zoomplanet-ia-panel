import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Space,
  message
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateCampaignPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('Valores del formulario:', values);
      
      // Aquí iría la lógica para crear la campaña
      // await createCampaign(values);
      
      message.success('Campaña creada exitosamente');
      
      // Redirigir o resetear el formulario
      form.resetFields();
      
    } catch (error) {
      console.error('Error al crear campaña:', error);
      message.error('Error al crear la campaña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Space>
            <Link to="/marketing/campaigns">
              <Button icon={<ArrowLeftOutlined />}>
                Volver a Campañas
              </Button>
            </Link>
            <Title level={2} style={{ margin: 0 }}>
              Crear Nueva Campaña
            </Title>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'email',
            status: 'draft'
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nombre de la Campaña"
                name="name"
                rules={[
                  { required: true, message: 'El nombre es obligatorio' },
                  { min: 3, message: 'Mínimo 3 caracteres' }
                ]}
              >
                <Input placeholder="Ej: Campaña de Black Friday 2024" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Tipo de Campaña"
                name="type"
                rules={[{ required: true, message: 'Selecciona un tipo' }]}
              >
                <Select placeholder="Selecciona el tipo">
                  <Option value="email">Email Marketing</Option>
                  <Option value="social">Redes Sociales</Option>
                  <Option value="ppc">Publicidad PPC</Option>
                  <Option value="content">Marketing de Contenido</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Descripción"
            name="description"
            rules={[{ required: true, message: 'La descripción es obligatoria' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Describe los objetivos y estrategia de la campaña..." 
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Fecha de Inicio"
                name="startDate"
                rules={[{ required: true, message: 'Selecciona la fecha de inicio' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Fecha de Fin"
                name="endDate"
                rules={[{ required: true, message: 'Selecciona la fecha de fin' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Presupuesto"
                name="budget"
                rules={[{ required: true, message: 'Ingresa el presupuesto' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Estado"
            name="status"
            rules={[{ required: true, message: 'Selecciona un estado' }]}
          >
            <Select>
              <Option value="draft">Borrador</Option>
              <Option value="scheduled">Programada</Option>
              <Option value="active">Activa</Option>
              <Option value="paused">Pausada</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: '32px' }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                Crear Campaña
              </Button>
              <Button onClick={() => form.resetFields()}>
                Limpiar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCampaignPage;
