import React from 'react';
import { Modal, Form } from 'antd';
import { useMutation } from '@apollo/client';
import { CREATE_NEWSLETTER, UPDATE_NEWSLETTER } from '../../apollo/newsletter';
import NewsletterForm from './newsletterForm';
import { toast } from 'react-hot-toast';

const NewsletterModal = ({ visible, newsletter, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!newsletter;

  const [createNewsletter, { loading: createLoading }] = useMutation(CREATE_NEWSLETTER);
  const [updateNewsletter, { loading: updateLoading }] = useMutation(UPDATE_NEWSLETTER);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Generate plain text from HTML if not provided
      if (!values.plainText && values.content) {
        values.plainText = values.content.replace(/<[^>]*>/g, '');
      }

      if (isEditing) {
        await updateNewsletter({
          variables: {
            id: newsletter.id,
            input: values
          }
        });
        toast.success('Newsletter updated successfully');
      } else {
        await createNewsletter({
          variables: {
            input: values
          }
        });
        toast.success('Newsletter created successfully');
      }
      
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Newsletter' : 'Create Newsletter'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose(false)}
      confirmLoading={createLoading || updateLoading}
      width={800}
    >
      <NewsletterForm
        form={form}
        initialValues={newsletter}
      />
    </Modal>
  );
};

export default NewsletterModal;
