import React from "react";
import { Modal, Form, Input, Select, Space } from "antd";
import { useMutation } from "@apollo/client";
import { toast } from "react-hot-toast";
import { UserOutlined, PhoneOutlined, GlobalOutlined, BookOutlined } from "@ant-design/icons";
import timezones from "@utils/timezones.js"; // Necesitarás crear este archivo con la lista de zonas horarias
import { UPDATE_USER_PROFILE, GET_USERS } from "../../apollo/user";


const ProfileModal = ({ visible, user, onClose }) => {
  const [form] = Form.useForm();
  const [updateProfile, { loading }] = useMutation(UPDATE_USER_PROFILE, {
    refetchQueries: user?.id ? [{ query: GET_USERS }] : [],
    awaitRefetchQueries: false
  });

  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      if (user) {
        const profile = user.profile || {};
        form.setFieldsValue({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
            phone: profile.phone || "",
            timezone: profile.timezone || "UTC",
            bio: profile.bio || "",
        });
      }
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        toast.error("Usuario no válido");
        return;
      }
      const values = await form.validateFields();
      const cleaned = Object.fromEntries(Object.entries(values).map(([k,v]) => [k, typeof v === 'string' ? v.trim() : v]));
      const { data } = await updateProfile({ variables: { id: user.id, input: cleaned } });
      const result = data?.updateUserProfile;
      if (!result) throw new Error("Respuesta inesperada");
      if (result.__typename === "ValidationError" || result.__typename === "NotFoundError" || result.__typename === "AuthenticationError") {
        throw new Error(result.message || "Error al actualizar");
      }
      toast.success("Perfil actualizado correctamente");
      onClose();
    } catch (error) {
      toast.error(error.message || "Error al actualizar el perfil");
    }
  };

  return (
    <Modal
      title="Editar Perfil"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ timezone: "UTC" }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Space style={{ width: "100%" }} size="large">
            <Form.Item name="firstName" label="Nombre" style={{ width: "100%" }} rules={[{ required: true, message: "Ingresa el nombre" }, { max: 50, message: "Máx 50 caracteres" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nombre" />
            </Form.Item>

            <Form.Item name="lastName" label="Apellidos" style={{ width: "100%" }} rules={[{ required: true, message: "Ingresa los apellidos" }, { max: 50, message: "Máx 50 caracteres" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Apellidos" />
            </Form.Item>
          </Space>

          <Form.Item name="phone" label="Teléfono" rules={[{ pattern: /^\+?[\d\s-]+$/, message: "Teléfono inválido" }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+1 234 567 8900" />
          </Form.Item>

          <Form.Item name="timezone" label="Zona horaria" rules={[{ required: true, message: "Selecciona la zona horaria" }]}
          >
            <Select showSearch placeholder="Selecciona zona horaria" optionFilterProp="children" prefix={<GlobalOutlined />}
            >
              {timezones.map(tz => (
                <Select.Option key={tz.value} value={tz.value}>
                  {tz.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="bio" label="Bio" rules={[{ max: 500, message: "Máx 500 caracteres" }]}
          >
            <Input.TextArea prefix={<BookOutlined />} placeholder="Cuéntanos sobre el usuario..." rows={4} showCount maxLength={500} />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default ProfileModal;