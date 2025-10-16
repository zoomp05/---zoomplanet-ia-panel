import React from 'react';
import { Form, Switch, Select, InputNumber, Space, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const ConditionsForm = ({ value, onChange }) => {
  return (
    <div>
      <Form.Item label="Owner Only">
        <Switch
          checked={value?.ownerOnly}
          onChange={(checked) => onChange({ ...value, ownerOnly: checked })}
        />
      </Form.Item>

      <Form.Item label="Required Roles">
        <Select
          mode="multiple"
          value={value?.requireRole}
          onChange={(roles) => onChange({ ...value, requireRole: roles })}
        >
          <Select.Option value="ADMIN">Admin</Select.Option>
          <Select.Option value="MANAGER">Manager</Select.Option>
          <Select.Option value="USER">User</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Same Account">
        <Switch
          checked={value?.sameAccount}
          onChange={(checked) => onChange({ ...value, sameAccount: checked })}
        />
      </Form.Item>

      <Form.Item label="Quantity Limit">
        <InputNumber
          value={value?.limitQuantity}
          onChange={(limit) => onChange({ ...value, limitQuantity: limit })}
        />
      </Form.Item>

      <Form.List name="customRules">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Space key={field.key} align="baseline">
                <Form.Item {...field} label="Field">
                  <Input />
                </Form.Item>
                <Form.Item {...field} label="Operator">
                  <Select>
                    <Select.Option value="equals">Equals</Select.Option>
                    <Select.Option value="notEquals">Not Equals</Select.Option>
                    <Select.Option value="contains">Contains</Select.Option>
                    <Select.Option value="greaterThan">Greater Than</Select.Option>
                    <Select.Option value="lessThan">Less Than</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item {...field} label="Value">
                  <Input />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(field.name)} />
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
              Add Custom Rule
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
};

export default ConditionsForm;