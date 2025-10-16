import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Space } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CONTACT_GROUP, UPDATE_CONTACT_GROUP } from '../../apollo/contactGroup';
import { GET_CONTACTS } from '../../apollo/contact';
import { toast } from 'react-hot-toast';

const ContactGroupModal = ({ visible, group, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!group;

  const [createGroup, { loading: createLoading }] = useMutation(CREATE_CONTACT_GROUP);
  const [updateGroup, { loading: updateLoading }] = useMutation(UPDATE_CONTACT_GROUP);
  const { data: contactsData, loading: loadingContacts } = useQuery(GET_CONTACTS);

  useEffect(() => {
    if (visible && group) {
      form.setFieldsValue({
        name: group.name,
        description: group.description,
        contacts: group.contacts?.map(c => c.id)
      });
    } else {
      form.resetFields();
    }
  }, [visible, group, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const input = {
        ...values,
        contacts: values.contacts || []
      };
      
      if (isEditing) {
        const { data } = await updateGroup({
          variables: { id: group.id, input }
        });

        if (data.updateContactGroup.__typename === 'ValidationError') {
          throw new Error(data.updateContactGroup.message);
        }
        
        toast.success('Group updated successfully');
      } else {
        const { data } = await createGroup({
          variables: { input }
        });

        if (data.createContactGroup.__typename === 'ValidationError') {
          throw new Error(data.createContactGroup.message);
        }

        toast.success('Group created successfully');
      }
      
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Contact Group' : 'Create Contact Group'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose(false)}
      confirmLoading={createLoading || updateLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="contacts"
          label="Contacts"
        >
          <Select
            mode="multiple"
            loading={loadingContacts}
            placeholder="Select contacts"
            optionFilterProp="label"
            options={contactsData?.contacts?.edges?.map(contact => ({
              value: contact.id,
              label: `${contact.name} (${contact.email})`
            }))}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContactGroupModal;