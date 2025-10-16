import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Space, Modal, Divider, Tag } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FLOW_ACTIONS, GET_FLOW_CONTEXTS, CREATE_FLOW_ACTION, CREATE_FLOW_CONTEXT } from '../apollo/flow.js';
// Removemos la importación de getRegisteredActions
import StepConfig from './steps/StepConfig';

const FlowEditor = ({ initialValues, onSubmit }) => {
  const [form] = Form.useForm();
  const { data: actionsData } = useQuery(GET_FLOW_ACTIONS);
  const { data: contextsData } = useQuery(GET_FLOW_CONTEXTS);
  const [createFlowAction] = useMutation(CREATE_FLOW_ACTION);
  const [createFlowContext] = useMutation(CREATE_FLOW_CONTEXT);

  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isContextModalVisible, setIsContextModalVisible] = useState(false);

  // Removemos el useEffect y el estado para registeredActions
  
  // Modificamos allActions para solo usar datos de BD
  const allActions = React.useMemo(() => {
    return actionsData?.flowActions || [];
  }, [actionsData]);

  const handleCreateAction = async (values) => {
    try {
      const result = await createFlowAction({ 
        variables: { 
          input: {
            ...values,
            config: JSON.stringify(values.config || {})
          } 
        },
        refetchQueries: [{ query: GET_FLOW_ACTIONS }]
      });
      setIsActionModalVisible(false);
      // Opcional: Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error creating action:', error);
      // Opcional: Mostrar mensaje de error
    }
  };

  const handleCreateContext = async (values) => {
    await createFlowContext({ variables: { input: values } });
    setIsContextModalVisible(false);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Card title="Información General">
        <Form.Item 
          name="name" 
          label="Nombre"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item 
          name="description" 
          label="Descripción"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          name="contextId"
          label="Contexto"
          rules={[{ required: true }]}
        >
          <Select
            dropdownRender={menu => (
              <>
                {menu}
                <Button type="link" onClick={() => setIsContextModalVisible(true)}>
                  Crear Contexto
                </Button>
              </>
            )}
          >
            {contextsData?.flowContexts.map(context => (
              <Select.Option key={context._id} value={context._id}>
                {context.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Card>

      <Card title="Pasos del Flujo" style={{ marginTop: 16 }}>
        <Form.List name="steps">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Nombre requerido' }]}
                      >
                        <Input placeholder="Nombre del paso" />
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'actionId']}
                        rules={[{ required: true, message: 'Acción requerida' }]}
                      >
                        <Select
                          style={{ width: 300 }}
                          dropdownRender={menu => (
                            <>
                              {menu}
                              <Divider style={{ margin: '8px 0' }} />
                              <Button 
                                type="link" 
                                onClick={() => setIsActionModalVisible(true)}
                                icon={<PlusOutlined />}
                              >
                                Crear Nueva Acción
                              </Button>
                            </>
                          )}
                        >
                          {allActions.map(action => (
                            <Select.Option 
                              key={action._id || action.code} 
                              value={action._id || action.code}
                            >
                              <Space>
                                <span>{action.name}</span>
                                <Tag color="blue">{action.code}</Tag>
                              </Space>
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>

                    <Form.Item
                      {...restField}
                      name={[name, 'config']}
                    >
                      <StepConfig 
                        action={allActions.find(
                          a => (a._id || a.code) === form.getFieldValue(['steps', name, 'actionId'])
                        )}
                      />
                    </Form.Item>
                  </Space>
                </Card>
              ))}
              
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Agregar Paso
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Card>

      <Form.Item style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit">
          Guardar Flujo
        </Button>
      </Form.Item>

      {/* Modal para crear acción */}
      <Modal
        title="Crear Acción"
        open={isActionModalVisible}
        onCancel={() => setIsActionModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form 
          onFinish={handleCreateAction}
          layout="vertical"
        >
          <Form.Item name="code" label="Código" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="method" label="Método" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Crear
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para crear contexto */}
      <Modal
        title="Crear Contexto"
        open={isContextModalVisible}
        onCancel={() => setIsContextModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form 
          onFinish={handleCreateContext}
          layout="vertical"
        >
          <Form.Item name="code" label="Código" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
             </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
};

export default FlowEditor;
