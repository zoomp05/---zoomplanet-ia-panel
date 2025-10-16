import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, AutoComplete } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_ACCOUNT, UPDATE_ACCOUNT } from '../../apollo/Account';
import { toast } from 'react-hot-toast';
import { GET_USERS } from '../../apollo/User'; // Importa la consulta de usuarios

const AccountModal = ({ visible, account, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!account;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);

  const [createAccount, { loading: createLoading }] = useMutation(CREATE_ACCOUNT);
  const [updateAccount, { loading: updateLoading }] = useMutation(UPDATE_ACCOUNT);

  const { data: userData, loading: usersLoading } = useQuery(GET_USERS, {
    variables: { filter: { search: searchTerm } }, // Pasa el término de búsqueda a la consulta
    skip: !searchTerm, // Solo ejecuta la consulta si hay un término de búsqueda
  });

  useEffect(() => {
    if (visible && account) {
      form.setFieldsValue(account);
      setSelectedOwner(account.owner.id);
      // Establecer el valor inicial del campo owner
      form.setFieldsValue({
        owner: `${account.owner.profile.firstName} ${account.owner.profile.lastName} (${account.owner.email})`
      });
    } else {
      form.resetFields();
      setSelectedOwner(null);
    }
  }, [visible, account, form]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleSelect = (value, option) => {
    setSelectedOwner(option.key);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.owner = selectedOwner; // Asigna el ID del propietario seleccionado

      let inputValues = { ...values };

      if (!isEditing) {
        // Genera nombre y slug solo para nuevas cuentas
        const randomNumber = Math.floor(Math.random() * 1000000000);
        inputValues.name = `ACC-${randomNumber}`;
        inputValues.slug = `acc-${randomNumber}`;
      }

      let response;
      if (isEditing) {
        response = await updateAccount({
          variables: {
            id: account.id,
            input: inputValues,
          },
        });
      } else {
        response = await createAccount({
          variables: {
            input: inputValues,
          },
        });
      }

      const result = isEditing ? response.data.updateAccount : response.data.createAccount;

      if (response.errors || result.__typename === 'ValidationError' || result.__typename === 'BAD_USER_INPUT') {
        throw new Error(result.message || 'An error occurred');
      }

      if (isEditing) {
        toast.success('Account updated successfully');
      } else {
        toast.success('Account created successfully');
      }

      onClose(true); // Pasa true para refrescar la lista
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Account' : 'Create Account'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createLoading || updateLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="owner" // Asegúrate de que coincida con tu esquema GraphQL
          label="Owner"
          rules={[{ required: true, message: 'Please select an owner!' }]}
        >
          <AutoComplete
            options={(userData?.users?.edges || []).map((user) => ({
              key: user.id, // Usa el ID como clave
              value: `${user.profile.firstName} ${user.profile.lastName} (${user.email})`, // Muestra el nombre y el email
            }))}
            onSearch={handleSearch}
            onSelect={handleSelect}
            filterOption={(inputValue, option) =>
              option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
            notFoundContent={usersLoading ? 'Loading...' : 'No users found'}
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="PERSONAL">Personal</Select.Option>
            <Select.Option value="TEAM">Team</Select.Option>
            <Select.Option value="ENTERPRISE">Enterprise</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="SUSPENDED">Suspended</Select.Option>
            <Select.Option value="CANCELLED">Cancelled</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="maxMembers"
          label="Max Members"
        >
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item
          name="maxProjects"
          label="Max Projects"
        >
          <InputNumber min={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccountModal;