// src/components/user/UserModal.jsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Spin } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_USER, UPDATE_USER, GET_USERS } from '../../apollo/user';
import { GET_ROLES } from '../../apollo/role';
import { toast } from 'react-hot-toast';

const { Option } = Select;

const UserModal = ({ visible, user, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!user;

  const { loading: rolesLoading, data: rolesData } = useQuery(GET_ROLES);

  const refetchUsers = [{ query: GET_USERS }];

  const [createUser, { loading: createLoading }] = useMutation(CREATE_USER, {
    refetchQueries: refetchUsers,
    awaitRefetchQueries: true,
  });

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    refetchQueries: refetchUsers,
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (visible && user) {
      // normalize: if user.roles is array use first role id for form select
      const roleId = Array.isArray(user.roles) ? (user.roles[0]?.id || undefined) : (user.role?.id || undefined);
      form.setFieldsValue({
        ...user,
        role: roleId,
      });
    } else {
      form.resetFields();
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { role, ...rest } = values;
      const rolesPayload = role ? [role] : [];

      if (isEditing) {
        const inputPayload = { ...rest, roles: rolesPayload };
        const { data } = await updateUser({
          variables: {
            id: user.id,
            input: inputPayload,
          },
        });
        
        if (data?.updateUser.__typename === 'ValidationError') {
          throw new Error(data.updateUser.message);
        }
        toast.success('User updated successfully');
      } else {
        const inputPayload = { ...rest, roles: rolesPayload };
        const { data } = await createUser({
          variables: { input: inputPayload },
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