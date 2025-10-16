import React from 'react';
import { Form, Input, Select, Switch, Space } from 'antd';

const StepConfig = ({ action, onChange }) => {
  switch (action?.code) {
    case 'OPEN_PLAN_PAGE':
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name={['config', 'route']} label="Ruta">
            <Input />
          </Form.Item>
          <Form.Item name={['config', 'cancelRoute']} label="Ruta de Cancelación">
            <Input />
          </Form.Item>
        </Space>
      );

    case 'CHECK_USER_AUTH':
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name={['config', 'authMethods']} label="Métodos de Autenticación">
            <Select mode="multiple">
              <Select.Option value="email">Email</Select.Option>
              <Select.Option value="google">Google</Select.Option>
              <Select.Option value="facebook">Facebook</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={['config', 'returnUrl']} label="URL de Retorno">
            <Input />
          </Form.Item>
        </Space>
      );

    case 'QUICK_REGISTER':
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name={['config', 'allowedMethods']} label="Métodos Permitidos">
            <Select mode="multiple">
              <Select.Option value="email">Email</Select.Option>
              <Select.Option value="google">Google</Select.Option>
              <Select.Option value="facebook">Facebook</Select.Option>
            </Select>
          </Form.Item>
        </Space>
      );

    case 'HANDLE_AUTH_CANCEL':
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name={['config', 'redirectRoute']} label="Ruta de Redirección">
            <Input />
          </Form.Item>
          <Form.Item name={['config', 'showMessage']} label="Mostrar Mensaje" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>
      );

    default:
      return null;
  }
};

export default StepConfig;
