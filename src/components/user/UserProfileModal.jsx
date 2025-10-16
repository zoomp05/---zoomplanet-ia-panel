import React from "react";
import { Modal, Form, Input, Select, Space } from "antd";
import { useMutation } from "@apollo/client";
import { toast } from "react-hot-toast";
import { UserOutlined, PhoneOutlined, GlobalOutlined, BookOutlined } from "@ant-design/icons";
import timezones from "../../utils/timezones"; // Necesitarás crear este archivo con la lista de zonas horarias
import { UPDATE_USER_PROFILE } from "../../apollo/user";


const ProfileModal = ({ visible, user, onClose }) => {
  const [form] = Form.useForm();
  const [updateProfile, { loading }] = useMutation(UPDATE_USER_PROFILE);

  React.useEffect(() => {
    if (visible && user?.profile) {
      form.setFieldsValue({
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.profile.phone,
        timezone: user.profile.timezone,
        bio: user.profile.bio,
      });
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const { data } = await updateProfile({
        variables: {
          id: user.id,
          input: values,
        },
      });

      if (data?.updateUserProfile.__typename === "ValidationError" || 
          data?.updateUserProfile.__typename === "NotFoundError") {
        throw new Error(data.updateUserProfile.message);
      }

      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          timezone: "UTC",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Space style={{ width: "100%" }} size="large">
            <Form.Item
              name="firstName"
              label="First Name"
              style={{ width: "100%" }}
              rules={[
                { required: true, message: "Please input your first name!" },
                { max: 50, message: "First name cannot exceed 50 characters!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="First Name" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              style={{ width: "100%" }}
              rules={[
                { required: true, message: "Please input your last name!" },
                { max: 50, message: "Last name cannot exceed 50 characters!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Last Name" />
            </Form.Item>
          </Space>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { pattern: /^\+?[\d\s-]+$/, message: "Please enter a valid phone number!" },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+1 234 567 8900" />
          </Form.Item>

          <Form.Item
            name="timezone"
            label="Timezone"
            rules={[{ required: true, message: "Please select your timezone!" }]}
          >
            <Select
              showSearch
              placeholder="Select timezone"
              optionFilterProp="children"
              prefix={<GlobalOutlined />}
            >
              {timezones.map(tz => (
                <Select.Option key={tz.value} value={tz.value}>
                  {tz.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="bio"
            label="Bio"
            rules={[{ max: 500, message: "Bio cannot exceed 500 characters!" }]}
          >
            <Input.TextArea
              prefix={<BookOutlined />}
              placeholder="Tell us about yourself..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default ProfileModal;