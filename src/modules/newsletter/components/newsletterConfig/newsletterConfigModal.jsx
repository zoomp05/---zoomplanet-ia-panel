import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Switch, Space, Select, Button } from "antd";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_NEWSLETTER_CONFIG,
  UPDATE_NEWSLETTER_CONFIG,
  TEST_SMTP_CONNECTION,
} from "../../apollo/newsletterConfig";
import { GET_ACCOUNTS } from "../../../../apollo/Account";
import { GET_USERS } from "../../../../apollo/user";

import { toast } from "react-hot-toast";

const NewsletterConfigModal = ({ visible, config, onClose }) => {
  const [form] = Form.useForm();
  const isEditing = !!config;
  const [entityType, setEntityType] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [testing, setTesting] = useState(false);

  const [testSmtp] = useMutation(TEST_SMTP_CONNECTION);

  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_NEWSLETTER_CONFIG
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_NEWSLETTER_CONFIG
  );

  const { data: accountsData } = useQuery(GET_ACCOUNTS, {
    skip: entityType !== "Account",
  });
  const { data: usersData } = useQuery(GET_USERS, {
    skip: entityType !== "User",
  });

  useEffect(() => {
    if (visible) {
      if (config) {
        const formValues = {
          defaultFromEmail: config.defaultFromEmail,
          defaultFromName: config.defaultFromName,
          "smtpConfig.host": config.smtpConfig?.host,
          "smtpConfig.port": config.smtpConfig?.port,
          "smtpConfig.secure": config.smtpConfig?.secure,
          "smtpConfig.auth.user": config.smtpConfig?.auth?.user,
          "smtpConfig.auth.pass": config.smtpConfig?.auth?.pass,
          "rateLimits.maxPerMinute": config.rateLimits?.maxPerMinute,
          "rateLimits.maxPerHour": config.rateLimits?.maxPerHour,
          "rateLimits.maxPerDay": config.rateLimits?.maxPerDay,
          isActive: config.isActive,
          isDefault: config.isDefault,
          entityType: config.entityType,
          entityId: config.entityId,
          baseUrl: config.baseUrl,
        };

        form.setFieldsValue(formValues);
        setEntityType(config.entityType || null);

        // Set selected entity
        if (config.entityType === "Account") {
          setSelectedAccountId(config.entityId);
        } else if (config.entityType === "User") {
          setSelectedUserId(config.entityId);
        }
      } else {
        form.resetFields();
        setEntityType(null);
        setSelectedAccountId(null);
        setSelectedUserId(null);
      }
    }
  }, [visible, config, form]);

  const handleEntityTypeChange = (value) => {
    setEntityType(value);
    // Preserve previous selection
    if (value === "Account") {
      form.setFieldValue("entityId", selectedAccountId);
    } else if (value === "User") {
      form.setFieldValue("entityId", selectedUserId);
    }
  };

  const handleEntitySelect = (value) => {
    if (entityType === "Account") {
      setSelectedAccountId(value);
    } else if (entityType === "User") {
      setSelectedUserId(value);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const input = {
        defaultFromEmail: values.defaultFromEmail,
        defaultFromName: values.defaultFromName,
        smtpConfig: {
          host: values["smtpConfig.host"],
          port: values["smtpConfig.port"],
          secure: values["smtpConfig.secure"],
          auth: {
            user: values["smtpConfig.auth.user"],
            pass: values["smtpConfig.auth.pass"],
          },
        },
        rateLimits: {
          maxPerMinute: values["rateLimits.maxPerMinute"],
          maxPerHour: values["rateLimits.maxPerHour"],
          maxPerDay: values["rateLimits.maxPerDay"],
        },
        isActive: values.isActive,
        isDefault: values.isDefault,
        entityType: values.entityType,
        entityId: values.entityId,
        baseUrl: values.baseUrl,
      };

      let response;
      if (isEditing) {
        response = await updateConfig({
          variables: {
            id: config.id,
            input,
          },
        });
      } else {
        response = await createConfig({
          variables: {
            input,
          },
        });
      }

      const result = isEditing
        ? response.data?.updateNewsletterConfig
        : response.data?.createNewsletterConfig;

      if (response.errors) {
        throw new Error(response.errors[0]?.message || "An error occurred");
      }

      if (result?.__typename === "ValidationError") {
        throw new Error(result.message || "Validation error");
      }

      if (result?.__typename === "NewsletterConfig") {
        toast.success(
          isEditing
            ? "Config updated successfully"
            : "Config created successfully"
        );
        onClose(true);
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  const accountOptions =
    accountsData?.accounts?.edges?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const userOptions =
    usersData?.users?.edges?.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    })) || [];

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const values = await form.validateFields([
        "smtpConfig.host",
        "smtpConfig.port",
        "smtpConfig.secure",
        "smtpConfig.auth.user",
        "smtpConfig.auth.pass",
      ]);

      const { data } = await testSmtp({
        variables: {
          input: {
            host: values["smtpConfig.host"],
            port: values["smtpConfig.port"],
            secure: values["smtpConfig.secure"],
            auth: {
              user: values["smtpConfig.auth.user"],
              pass: values["smtpConfig.auth.pass"],
            },
            // Agregar configuración TLS
            tls: {
              rejectUnauthorized: false,
              minVersion: "TLSv1.2",
              ciphers: "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256"
            }
          },
        },
      });

      if (data.testSmtpConnection.success) {
        toast.success("SMTP connection test successful");
      } else {
        toast.error(
          data.testSmtpConnection.message || "SMTP connection test failed"
        );
      }
    } catch (error) {
      console.error('SMTP Test Error:', error);
      toast.error(error.message || "Error testing SMTP connection");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Newsletter Config" : "Create Newsletter Config"}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={createLoading || updateLoading}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Space>
            <Form.Item
              name="defaultFromEmail"
              label="From Email"
              rules={[
                { required: true, message: "Please input the from email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="defaultFromName"
              label="From Name"
              rules={[
                { required: true, message: "Please input the from name!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Space>

          <Space direction="vertical" style={{ width: "100%" }}>
            <h3>SMTP Configuration</h3>
            <Space>
              <Form.Item
                name="smtpConfig.host"
                label="Host"
                rules={[{ required: true, message: "Please input SMTP host!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="smtpConfig.port"
                label="Port"
                rules={[{ required: true, message: "Please input SMTP port!" }]}
              >
                <InputNumber min={1} max={65535} />
              </Form.Item>

              <Form.Item
                name="smtpConfig.secure"
                label="Secure"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Space>

            <Space>
              <Form.Item
                name="smtpConfig.auth.user"
                label="Username"
                rules={[
                  { required: true, message: "Please input SMTP username!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="smtpConfig.auth.pass"
                label="SMTP Password"
                rules={[
                  { required: true, message: "Please input SMTP password!" },
                ]}
              >
                <Input.Password visibilityToggle={true} />
              </Form.Item>
            </Space>

              <Space> 
                <Button
                  type="default"
                  onClick={handleTestConnection}
                  loading={testing}
                  disabled={createLoading || updateLoading}
                >
                  Test Connection
                </Button>
              </Space>
            
          </Space>

          <Space direction="vertical" style={{ width: "100%" }}>
            <h3>Rate Limits</h3>
            <Space>
              <Form.Item
                name="rateLimits.maxPerMinute"
                label="Max Per Minute"
                rules={[
                  { required: true, message: "Please input max per minute!" },
                ]}
              >
                <InputNumber min={1} />
              </Form.Item>

              <Form.Item
                name="rateLimits.maxPerHour"
                label="Max Per Hour"
                rules={[
                  { required: true, message: "Please input max per hour!" },
                ]}
              >
                <InputNumber min={1} />
              </Form.Item>
            </Space>
          </Space>

          <Space>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="isDefault" label="Default" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>

          <Space direction="vertical" style={{ width: "100%" }}>
            <h3>Tracking Configuration</h3>
            <Form.Item
              name="baseUrl"
              label="Pixel Base URL"
              tooltip="Base URL for tracking pixel and click tracking (e.g., https://yourdomain.com)"
              rules={[
                { required: true, message: "Please input the base URL!" },
                { type: "url", message: "Please enter a valid URL!" }
              ]}
            >
              <Input placeholder="https://yourdomain.com" />
            </Form.Item>
          </Space>

        </Space>

        <Space direction="vertical" style={{ width: "100%" }}>
          <h3>Entity Relations</h3>
          <Space>
            <Form.Item name="entityType" label="Entity Type">
              <Select
                style={{ width: 200 }}
                onChange={handleEntityTypeChange}
                allowClear
                value={entityType}
                options={[
                  { value: "Account", label: "Account" },
                  { value: "User", label: "User" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="entityId"
              label="Entity"
              dependencies={["entityType"]}
            >
              <Select
                style={{ width: 300 }}
                allowClear
                disabled={!entityType}
                value={
                  entityType === "Account" ? selectedAccountId : selectedUserId
                }
                options={
                  entityType === "Account" ? accountOptions : userOptions
                }
                onChange={handleEntitySelect}
              />
            </Form.Item>
          </Space>
        </Space>
      </Form>
    </Modal>
  );
};

export default NewsletterConfigModal;
