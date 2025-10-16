// Componente actualizado de ChangePasswordModal
import React, { useState } from "react";
import { Modal, Form, Input, Button, Progress, Space } from "antd";
import { useMutation } from "@apollo/client";
import { CHANGE_USER_PASSWORD } from "../../apollo/user";
import { toast } from "react-hot-toast";
import { KeyOutlined, SyncOutlined } from "@ant-design/icons";
import { passwordConfigs } from "../../utils/passwordValidator";
import { generateSecurePassword } from "../../utils/passwordGenerator";

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 10) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  };

  const getColorForStrength = (strength) => {
    if (strength <= 20) return "#ff4d4f";
    if (strength <= 40) return "#faad14";
    if (strength <= 60) return "#fadb14";
    if (strength <= 80) return "#52c41a";
    return "#237804";
  };

  const strength = calculateStrength(password || "");

  return (
    <div style={{ marginBottom: 16 }}>
      <Progress
        percent={strength}
        strokeColor={getColorForStrength(strength)}
        size="small"
        format={(percent) => {
          if (percent <= 20) return "Very Weak";
          if (percent <= 40) return "Weak";
          if (percent <= 60) return "Medium";
          if (percent <= 80) return "Strong";
          return "Very Strong";
        }}
      />
    </div>
  );
};

const ChangePasswordModal = ({
  visible,
  user,
  onClose,
  passwordLevel = "low",
}) => {
  const [form] = Form.useForm();
  const [currentPassword, setCurrentPassword] = useState("");
  const [changePassword, { loading }] = useMutation(CHANGE_USER_PASSWORD);
  const config = passwordConfigs[passwordLevel];

  const generatePassword = () => {
    const generatedPassword = generateSecurePassword(
      passwordLevel === "high" ? 16 : passwordLevel === "medium" ? 12 : 10
    );
    form.setFieldsValue({
      newPassword: generatedPassword,
      confirmPassword: generatedPassword,
    });
    setCurrentPassword(generatedPassword);
  };

  const validatePasswordField = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Please input the new password!"));
    }

    if (!value.match(config.regex)) {
      return Promise.reject(new Error(config.message));
    }

    return Promise.resolve();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const { data } = await changePassword({
        variables: {
          id: user.id,
          input: {
            newPassword: values.newPassword,
          },
        },
      });

      if (data?.changeUserPassword.__typename === "ValidationError") {
        throw new Error(data.changeUserPassword.message);
      }

      toast.success("Password changed successfully");
      form.resetFields();
      setCurrentPassword("");
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <Modal
      title="Change Password"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            icon={<SyncOutlined />}
            onClick={generatePassword}
            style={{ marginBottom: 16 }}
          >
            Generate Secure Password
          </Button>

          <Form.Item
            name="newPassword"
            label="New Password"
            //rules={passwordRules[passwordLevel]}
            rules={[{ required: true }, { validator: validatePasswordField }]}
          >
            <Input.Password
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Form.Item>

          <PasswordStrengthIndicator password={currentPassword} />

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm the password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
