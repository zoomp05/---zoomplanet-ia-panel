import React, { useEffect } from 'react';
import { Modal, Form } from 'antd';
import { useMutation } from '@apollo/client';
import { UPDATE_NEWSLETTER_CONFIG } from '../../apollo/newsletterConfig';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const FooterSignatureModal = ({ visible, config, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!config;

  const [updateConfig, { loading: updateLoading }] = useMutation(UPDATE_NEWSLETTER_CONFIG);

  useEffect(() => {
    if (visible && config) {
      form.setFieldsValue({
        signature: config.signature,
        footer: config.footer
      });
    } else {
      form.resetFields();
    }
  }, [visible, config, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await updateConfig({
        variables: {
          id: config.id,
          input: values
        }
      });
      toast.success('Footer and signature updated successfully');

      onClose(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Footer and Signature' : 'Create Footer and Signature'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose(false)}
      confirmLoading={updateLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="signature"
          label="Signature"
          rules={[{ required: true }]}
        >
          <ReactQuill theme="snow" />
        </Form.Item>

        <Form.Item
          name="footer"
          label="Footer"
          rules={[{ required: true }]}
        >
          <ReactQuill theme="snow" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FooterSignatureModal;
