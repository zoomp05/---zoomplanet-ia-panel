// src/components/user/UserModal.jsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Spin } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_USER, UPDATE_USER } from '../../apollo/user';
import { GET_ROLES } from '../../apollo/role';
import { toast } from 'react-hot-toast';

const { Option } = Select;

const UserModal = ({ visible, user, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!user;

  const { loading: rolesLoading, data: rolesData } = useQuery(GET_ROLES);

  const [createUser, { loading: createLoading }] = useMutation(CREATE_USER, {
    refetchQueries: ['users'],
  });

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    refetchQueries: ['users'],
  });

  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        ...user,
        role: user.role?.id || undefined,
      });
    } else {
      form.resetFields();
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEditing) {
        const { data } = await updateUser({
          variables: {
            id: user.id,
            input: { ...values, role: values.role },
          },
        });
        
        if (data?.updateUser.__typename === 'ValidationError') {
          throw new Error(data.updateUser.message);
        }
        toast.success('User updated successfully');
      } else {
        const { data } = await createUser({
          variables: { input: { ...values, role: values.role } },
        });
        
        if (data?.createUser.__typename === 'ValidationError') {
          throw new Error(data.createUser.message);
        }
        toast.success('User created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit User' : 'Create User'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createLoading || updateLoading}
    >
      <Spin spinning={rolesLoading}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please input a valid email!' },
            ]}
          >
            <Input />
          </Form.Item>

          {!isEditing && (
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input the password!' }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select>
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select role">
              {rolesData?.roles.edges.map((role) => (
                <Option key={role.id} value={role.id}>{role.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default UserModal;