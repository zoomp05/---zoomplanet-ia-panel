import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { useMutation } from "@apollo/client";
import {
  CREATE_PERMISSION,
  UPDATE_PERMISSION,
  GET_PERMISSIONS,
} from "../../apollo/permission";
import { toast } from "react-hot-toast";
import ConditionsForm from "./ConditionsForm";
import {
  RESOURCES,
  ACTIONS as PERMISSION_ACTIONS,
} from "../../constants/permissions";


const { Option } = Select;

const PermissionModal = ({ visible, permission, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!permission;

  const [createPermission, { loading: createLoading }] = useMutation(
    CREATE_PERMISSION,
    {
      refetchQueries: [
        GET_PERMISSIONS, // DocumentNode object parsed with gql
        "permissions", // Query name
      ],
    }
  );

  const [updatePermission, { loading: updateLoading }] = useMutation(
    UPDATE_PERMISSION,
    {
      refetchQueries: [
        GET_PERMISSIONS, // DocumentNode object parsed with gql
        "permissions", // Query name
      ],
    }
  );

  useEffect(() => {
    if (visible && permission) {
      form.setFieldsValue(permission);
    } else {
      form.resetFields();
    }
  }, [visible, permission, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing) {
        const { data } = await updatePermission({
          variables: {
            id: permission.id,
            input: values,
          },
        });

        if (data?.updatePermission.__typename === "ValidationError") {
          throw new Error(data.updatePermission.message);
        }

        toast.success("Permission updated successfully");
      } else {
        const { data } = await createPermission({
          variables: {
            input: values,
          },
        });

        if (data?.createPermission.__typename === "ValidationError") {
          throw new Error(data.createPermission.message);
        }

        toast.success("Permission created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title={isEditing ? "Editar Permiso" : "Crear Permiso"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createLoading || updateLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          /*rules={[
            { required: true, message: "Please input the permission name!" },
          ]}*/
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="code"
          label="Code"
          /*rules={[
            { required: true, message: "Please input the permission code!" },
          ]}*/
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          name="resource"
          label="Resource"
          rules={[{ required: true }]}
        >
          <Select>
            {Object.entries(RESOURCES).map(([key, value]) => (
              <Option key={key} value={value}>
                {key
                  .split("_")
                  .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                  .join(" ")}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="action" label="Action" rules={[{ required: true }]}>
          <Select>
            {Object.entries(PERMISSION_ACTIONS).map(([key, value]) => (
              <Option key={key} value={value}>
                {key
                  .split("_")
                  .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                  .join(" ")}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="conditions" label="Conditions">
          <ConditionsForm />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PermissionModal;
