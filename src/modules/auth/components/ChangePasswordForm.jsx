// src/modules/auth/components/ChangePasswordForm.jsx
import React, { useState } from 'react';
import * as ApolloClient from "@apollo/client";
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import { CHANGE_PASSWORD } from '../apollo/auth';

const { useMutation } = ApolloClient;
const { Title, Text } = Typography;

const ChangePasswordForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [changePassword] = useMutation(CHANGE_PASSWORD);

  const handleSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const { data } = await changePassword({
        variables: {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword
        }
      });

      if (data.changePassword) {
        toast.success('Contraseña cambiada con éxito');
        form.resetFields();
      } else {
        toast.error('Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>Cambiar Contraseña</Title>
        <Divider />
      </div>

      <Form
        form={form}
        name="change-password"
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="oldPassword"
          label="Contraseña Actual"
          rules={[{ required: true, message: 'Por favor ingresa tu contraseña actual' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Contraseña actual" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Nueva Contraseña"
          rules={[
            { required: true, message: 'Por favor ingresa tu nueva contraseña' },
            { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nueva contraseña" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirmar Nueva Contraseña"
          rules={[
            { required: true, message: 'Por favor confirma tu nueva contraseña' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Las contraseñas no coinciden'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirmar nueva contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Cambiar Contraseña
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordForm;
