import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, AutoComplete } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_ACCOUNT, UPDATE_ACCOUNT } from '../apollo/account';
import { toast } from 'react-hot-toast';
import { GET_USERS } from '@modules/user/apollo/user';

const AccountModal = ({ visible, account, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!account;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);

  const [createAccount, { loading: createLoading }] = useMutation(CREATE_ACCOUNT);
  const [updateAccount, { loading: updateLoading }] = useMutation(UPDATE_ACCOUNT);

  const { data: userData, loading: usersLoading } = useQuery(GET_USERS, {
    variables: { filter: { search: searchTerm } },
    skip: !searchTerm,
  });

  useEffect(() => {
    if (visible && account) {
      form.setFieldsValue(account);
      setSelectedOwner(account.owner.id);
      form.setFieldsValue({
        owner: `${account.owner.profile.firstName} ${account.owner.profile.lastName} (${account.owner.email})`
      });
    } else {
      form.resetFields();
      setSelectedOwner(null);
    }
  }, [visible, account, form]);

  const handleSearch = (value) => setSearchTerm(value);
  const handleSelect = (value, option) => setSelectedOwner(option.key);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.owner = selectedOwner;

      let inputValues = { ...values };

      if (!isEditing) {
        const randomNumber = Math.floor(Math.random() * 1000000000);
        inputValues.name = `ACC-${randomNumber}`;
        inputValues.slug = `acc-${randomNumber}`;
      }

      let response;
      if (isEditing) {
        response = await updateAccount({ variables: { id: account.id, input: inputValues } });
      } else {
        response = await createAccount({ variables: { input: inputValues } });
      }

      const result = isEditing ? response.data.updateAccount : response.data.createAccount;

      if (response.errors || result.__typename === 'ValidationError' || result.__typename === 'BAD_USER_INPUT') {
        throw new Error(result.message || 'An error occurred');
      }

      toast.success(isEditing ? 'Account updated successfully' : 'Account created successfully');
      onClose(true);
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
        <Form.Item name="owner" label="Owner" rules={[{ required: true, message: 'Please select an owner!' }]}>
          <AutoComplete
            options={(userData?.users?.edges || []).map((user) => ({
              key: user.id,
              value: `${user.profile.firstName} ${user.profile.lastName} (${user.email})`,
            }))}
            onSearch={handleSearch}
            onSelect={handleSelect}
            filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
            notFoundContent={usersLoading ? 'Loading...' : 'No users found'}
          />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="PERSONAL">Personal</Select.Option>
            <Select.Option value="TEAM">Team</Select.Option>
            <Select.Option value="ENTERPRISE">Enterprise</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="SUSPENDED">Suspended</Select.Option>
            <Select.Option value="CANCELLED">Cancelled</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="maxMembers" label="Max Members">
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item name="maxProjects" label="Max Projects">
          <InputNumber min={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccountModal;