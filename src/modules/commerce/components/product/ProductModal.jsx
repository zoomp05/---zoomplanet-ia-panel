import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Space, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../apollo/product';
import { toast } from 'react-hot-toast';

const ProductModal = ({ visible, product, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!product;

  const [createProduct, { loading: createLoading }] = useMutation(CREATE_PRODUCT);
  const [updateProduct, { loading: updateLoading }] = useMutation(UPDATE_PRODUCT);

  useEffect(() => {
    if (visible && product) {
      form.setFieldsValue({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        type: product.type,
        description: product.description,
        features: product.features,
        pricing: product.pricing,
      });
    } else {
      form.resetFields();
    }
  }, [visible, product, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Clean data before sending
      const cleanedValues = {
        ...values,
        pricing: values.pricing?.map(({ interval, amount, currency }) => ({
          interval,
          amount,
          currency
        })),
        features: values.features?.map(({ name, description, value }) => ({
          name,
          description,
          value
        }))
      };
      
      if (isEditing) {
        await updateProduct({
          variables: {
            id: product.id,
            input: cleanedValues,
          },
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct({
          variables: {
            input: cleanedValues,
          },
        });
        toast.success('Product created successfully');
      }
      
      onClose(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Product' : 'Create Product'}
      open={visible}
      onCancel={() => onClose()}
      onOk={handleSubmit}
      confirmLoading={createLoading || updateLoading}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="sku"
          label="SKU"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="PLAN">Plan</Select.Option>
            <Select.Option value="PROJECT">Project</Select.Option>
            <Select.Option value="PHYSIC">Physical</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.List name="features">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Feature name" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                  >
                    <Input placeholder="Description" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Feature
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.List name="pricing">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'interval']}
                    rules={[{ required: true }]}
                  >
                    <Select style={{ width: 120 }}>
                      <Select.Option value="ONE_TIME">One Time</Select.Option>
                      <Select.Option value="MONTHLY">Monthly</Select.Option>
                      <Select.Option value="ANNUAL">Annual</Select.Option>
                      <Select.Option value="BIENNIAL">Biennial</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'amount']}
                    rules={[{ required: true }]}
                  >
                    <InputNumber placeholder="Amount" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'currency']}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Currency" style={{ width: 80 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Pricing
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ProductModal;