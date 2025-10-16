import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  DatePicker,
  Select,
  InputNumber,
  Modal,
} from "antd";
import { useParams } from 'react-router';
import { useMutation, useQuery } from "@apollo/client";
import { EyeOutlined, CodeOutlined } from "@ant-design/icons";
import {
  GET_NEWSLETTER,
  CREATE_NEWSLETTER,
  UPDATE_NEWSLETTER,
} from "../../apollo/newsletter";
import { toast } from "react-hot-toast";
import { LeftOutlined } from "@ant-design/icons";
import "./styles.css";
import HTMLEditor from "../../../editor/Editor";
import { useModuleNavigation } from '@hooks/useModuleNavigation';

const NewsletterForm = ({ form: parentForm, initialValues }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const { id } = useParams();
  const { navigateContextual } = useModuleNavigation();
  const [form] = Form.useForm();
  const isEditing = !!id;
  const activeForm = parentForm || form;

  const initialContentRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const [editorContent, setEditorContent] = useState(
    initialValues?.content || ""
  );
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const { data: newsletterData, loading: loadingNewsletter } = useQuery(
    GET_NEWSLETTER,
    {
      variables: { id },
      skip: !isEditing,
    }
  );

  const [createNewsletter, { loading: createLoading }] =
    useMutation(CREATE_NEWSLETTER);
  const [updateNewsletter, { loading: updateLoading }] =
    useMutation(UPDATE_NEWSLETTER);

  const getPreviewContent = () => {
    const values = form.getFieldsValue();
    return {
      subject: values.subject || "No subject",
      content: values.content || "No content",
    };
  };

  useEffect(() => {
    console.log("Newsletter data:", newsletterData?.newsletter); // Debug log

    if (newsletterData?.newsletter && !isEditorReady) {
      initialContentRef.current = newsletterData.newsletter.content;
      console.log("Initial content ref  -- :", initialContentRef.current); // Debug log
      activeForm.setFieldsValue({
        name: newsletterData.newsletter.name,
        subject: newsletterData.newsletter.subject,
        content: newsletterData.newsletter.content,
        plainText: newsletterData.newsletter.plainText || "",
        status: newsletterData.newsletter.status,
        schedule: {
          startDate: newsletterData.newsletter.schedule?.startDate
            ? moment(newsletterData.newsletter.schedule.startDate)
            : null,
          endDate: newsletterData.newsletter.schedule?.endDate
            ? moment(newsletterData.newsletter.schedule.endDate)
            : null,
          interval: newsletterData.newsletter.schedule?.interval || null,
          timezone: newsletterData.newsletter.schedule?.timezone || "UTC"
        },
      });
      setEditorContent(newsletterData.newsletter.content);
      setIsEditorReady(true);
      console.log("Form values to set:", activeForm); // Debug log
    }
  }, [newsletterData]);

  const handleSubmit = async (values) => {
    try {
      const currentContent = activeForm.getFieldValue("content");
      const formattedValues = {
        ...values,
        content: currentContent || "",
        plainText: values.plainText?.trim() || "",
        schedule: {
          ...values.schedule,
          startDate: values.schedule?.startDate?.toISOString(),
          endDate: values.schedule?.endDate?.toISOString(),
        },
      };

      console.log("Submitting values:", formattedValues); // Para debugging

      if (isEditing) {
        await updateNewsletter({
          variables: { id, input: formattedValues },
        });
        toast.success("Newsletter updated successfully");
      } else {
        const { data } = await createNewsletter({
          variables: { input: formattedValues },
        });
        toast.success("Newsletter created successfully");
        navigateContextual(`newsletter/edit/${data.createNewsletter.id}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleHtmlEdit = () => {
    setShowHtmlModal(true);
  };

  const handleHtmlSave = (htmlContent) => {
    form.setFieldsValue({ content: htmlContent });
    setShowHtmlModal(false);
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  return (
    <>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={<LeftOutlined />}
            onClick={() => navigateContextual("newsletter")}
          >
            Back to List
          </Button>
          <Button onClick={() => setPreviewVisible(true)}>Preview</Button>
        </Space>

        <Form
          form={activeForm}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            ...initialValues,
            content: editorContent,
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Card title="Basic Information">
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Card>

            <Card title="Content">
            

              {(isEditorReady || !isEditing) && (
                <HTMLEditor
                  defaultValue={initialContentRef.current}
                  onChange={(content) => {
                    activeForm.setFieldsValue({ content });
                    //setEditorContent(content);
                    // Nunca pasar un estado reactivo a un componente controlado
                    // Buscar anularlo o lanzar un error o advertencia
                  }}
                />
              )}

              <Form.Item
                name="plainText"
                label="Plain Text Version"
                tooltip="Optional plain text version of the email. If not provided, the HTML content will be automatically converted to plain text."
              >
                <Input.TextArea
                  rows={6}
                  placeholder="Enter a plain text version of your email content..."
                />
              </Form.Item>
            </Card>

            <Card title="Schedule">
              <Space>
                <Form.Item name={["schedule", "startDate"]} label="Start Date">
                  <DatePicker showTime />
                </Form.Item>

                <Form.Item name={["schedule", "endDate"]} label="End Date">
                  <DatePicker showTime />
                </Form.Item>

                <Form.Item
                  name={["schedule", "interval"]}
                  label="Interval (minutes)"
                >
                  <InputNumber min={1} />
                </Form.Item>
              </Space>
            </Card>

            <Card title="Status">
              <Form.Item name="status" label="Status">
                <Select
                  options={[
                    { value: "DRAFT", label: "Draft" },
                    { value: "SCHEDULED", label: "Scheduled" },
                    { value: "SENDING", label: "Sending" },
                    { value: "COMPLETED", label: "Completed" },
                    { value: "FAILED", label: "Failed" },
                  ]}
                />
              </Form.Item>
            </Card>

            <Space>
              <Button onClick={() => navigateContextual("newsletter")}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading || updateLoading}
              >
                {isEditing ? "Update" : "Create"} Newsletter
              </Button>

              <Button onClick={() => setPreviewVisible(true)}>Preview</Button>
            </Space>
          </Space>
        </Form>
      </Space>
      <Modal
        title="Newsletter Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={null}
      >
        <div style={{ padding: "20px" }}>
          <h2>{getPreviewContent().subject}</h2>
          <div
            dangerouslySetInnerHTML={{
              __html: getPreviewContent().content,
            }}
          />
        </div>
      </Modal>

      {/* HTML Editor Modal */}
      <Modal
        title="Edit HTML"
        open={showHtmlModal}
        onOk={() => handleHtmlSave(form.getFieldValue("content"))}
        onCancel={() => setShowHtmlModal(false)}
        width={800}
      >
        <Input.TextArea
          rows={20}
          value={form.getFieldValue("content")}
          onChange={(e) => form.setFieldsValue({ content: e.target.value })}
        />
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Preview"
        open={showPreviewModal}
        onCancel={() => setShowPreviewModal(false)}
        width={800}
        footer={null}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: form.getFieldValue("content"),
          }}
          style={{
            padding: "20px",
            backgroundColor: "#fff",
            minHeight: "400px",
            border: "1px solid #f0f0f0",
            borderRadius: "4px",
          }}
        />
        <a href="#" onClick={() => setShowHtmlModal(true)}>
          Edit HTML
        </a>
      </Modal>
    </>
  );
};

export default NewsletterForm;
