import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Spin } from "antd";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_ROLE, UPDATE_ROLE } from "../../apollo/role";
import { toast } from "react-hot-toast";
import { GET_ROLES } from "../../apollo/role";
import { GET_PERMISSIONS } from "../../apollo/permission";

const { Option } = Select;

const RoleModal = ({ visible, role, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!role;
  const [searchPermission, setSearchPermission] = useState("");

  const { loading: permissionsLoading, error: permissionsError, data: permissionsData, refetch: refetchPermissions} = useQuery(GET_PERMISSIONS, {
    variables: {
      filter: { search: searchPermission },
    },
  });

  const [createRole, { loading: createLoading }] = useMutation(CREATE_ROLE, {
    refetchQueries: [GET_ROLES, "roles"],
  });
  const [updateRole, { loading: updateLoading }] = useMutation(UPDATE_ROLE, {
    refetchQueries: [GET_ROLES, "roles"],
  });

  useEffect(() => {
    if (visible) {
      refetchPermissions();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && role) {
      console.log(" PErmisos ", role.permissions);
      form.setFieldsValue({
        ...role,
        isSystem: !!role.isSystem,
        permissions: role.permissions?.map((p) => p.code) || [],
      });
    } else {
      form.resetFields();
    }
  }, [visible, role, form]);

  const handlePermissionChange = (value) => {
    form.setFieldsValue({ permissions: value }); // Update form data with selected permissions
  };

  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Combinar permisos existentes con los nuevos
      const combinedPermissionIds = [
        // Ids de los permisos originales del rol
        ...(role?.permissions?.map(p => p.id) || []),
        // Ids de los nuevos permisos seleccionados
        ...(values.permissions
          ? allPermissions
              .filter(permission => values.permissions.includes(permission.code))
              .map(permission => permission.id)
          : [])
      ];
  
      // Eliminar ids duplicados
      const uniquePermissionIds = [...new Set(combinedPermissionIds)];
  
      if (isEditing) {
        const { data } = await updateRole({
          variables: {
            id: role.id,
            input: { 
              ...values, 
              permissions: uniquePermissionIds,
            }, 
          },
        });
        if (data?.updateRole.__typename === "ValidationError") {
          throw new Error(data.updateRole.message);
        }
        toast.success("Role updated successfully");
      } else {
        const { data } = await createRole({
          variables: {
            input: { 
              ...values, 
              permissions: uniquePermissionIds,
            },
          }, 
        });
        if (data?.createRole.__typename === "ValidationError") {
          throw new Error(data.createRole.message);
        }
        toast.success("Role created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  /*const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditing) {
        const { data } = await updateRole({
          variables: {
            id: role.id,
            input: { ...values, permissions: values.permissions || [] }, // Handle empty permissions
          },
        });
        if (data?.updateRole.__typename === "ValidationError") {
          throw new Error(data.updateRole.message);
        }
        toast.success("Role updated successfully");
      } else {
        const { data } = await createRole({
          variables: {
            input: { ...values, permissions: values.permissions || [] },
          }, // Handle empty permissions
        });
        if (data?.createRole.__typename === "ValidationError") {
          throw new Error(data.createRole.message);
        }
        toast.success("Role created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };*/

  // Filter permissions based on search input
  /*const filteredPermissions = permissionsData?.permissions?.edges.filter((permission) =>
      permission.name.toLowerCase().includes(searchPermission.toLowerCase())
    ) || [];
*/
    const allPermissions = permissionsData?.permissions?.edges || [];

  return (
    <Modal
      title={isEditing ? "Edit Role" : "Create Role"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={createLoading || updateLoading}
    >
      <Spin spinning={permissionsLoading}>
        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Permissions" name="permissions">
            <Select
              mode="multiple"
              placeholder="Select permissions"
              showSearch
              onSearch={(value) => setSearchPermission(value)}
              filterOption={false}
              notFoundContent={
                permissionsLoading ? (
                  <Spin size="small" />
                ) : (
                  "No permissions found"
                )
              }
              onChange={handlePermissionChange} // Add onChange handler
            >
              {allPermissions.map((permission) => (
                <Option key={permission.id} value={permission.code}>
                  {permission.code}
                </Option>
              ))}
            </Select>
            {permissionsError && (
              <div>Error loading permissions: {permissionsError.message}</div>
            )}
          </Form.Item>
          <Form.Item label="Is System Role?" name="isSystem">
            <Select placeholder="Select">
              {" "}
              {/* Could also use a Switch or Checkbox here */}
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Scope" name="scope">
            <Select
              placeholder="Select scope"
              onChange={(value) =>
                handleFiltersChange({ scope: value === "ALL" ? null : value })
              } // Convert 'ALL' back to null if needed
            >
              <Option value="ALL">All</Option>
              <Option value="GLOBAL">GLOBAL</Option>
              <Option value="ACCOUNT">ACCOUNT</Option>
              <Option value="PROJECT">PROJECT</Option>
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default RoleModal;
