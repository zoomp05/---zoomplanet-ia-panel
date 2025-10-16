import React, { useState } from "react";
import { Table, Space, Button, Tag, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { DELETE_NEWSLETTER_CONFIG } from "../../apollo/newsletterConfig";
import NewsletterConfigModal from "./newsletterConfigModal";
import FooterSignatureModal from "./footerSignatureModal";
import { toast } from "react-hot-toast";

const NewsletterConfigList = ({ loading, configs, onEdit, onRefresh }) => {
  const [deletingId, setDeletingId] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [footerModalVisible, setFooterModalVisible] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const [deleteConfig] = useMutation(DELETE_NEWSLETTER_CONFIG, {
    onCompleted: onRefresh,
  });

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const { data } = await deleteConfig({ variables: { id } });
      if (data.deleteNewsletterConfig.__typename === "NewsletterConfig") {
        toast.success("Config deleted successfully");
      } else {
        throw new Error(data.deleteNewsletterConfig.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setModalVisible(true);
  };

  const handleEditFooter = (config) => {
    setSelectedConfig(config);
    setFooterModalVisible(true);
  };

  const handleFooterModalClose = (refresh = false) => {
    setFooterModalVisible(false);
    setSelectedConfig(null);
    if (refresh) {
      //refetch();
      onRefresh();
    }
  };

  const handleModalClose = (refresh = false) => {
    setModalVisible(false);
    setSelectedConfig(null);
    if (refresh) {
      //refetch();
      onRefresh();
    }
  };

  const columns = [
    {
      title: "From Email",
      dataIndex: "defaultFromEmail",
      key: "defaultFromEmail",
    },
    {
      title: "From Name",
      dataIndex: "defaultFromName",
      key: "defaultFromName",
    },
    {
      title: "SMTP Host",
      dataIndex: ["smtpConfig", "host"],
      key: "host",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Default",
      dataIndex: "isDefault",
      key: "isDefault",
      render: (isDefault) =>
        isDefault ? <Tag color="blue">Default</Tag> : null,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />

          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditFooter(record)}
          >
            Edit Footer
          </Button>

          <Popconfirm
            title="Are you sure you want to delete this config?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deletingId === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        loading={loading}
        dataSource={configs}
        columns={columns}
        rowKey="id"
      />
      <NewsletterConfigModal
        visible={modalVisible}
        config={selectedConfig}
        onClose={handleModalClose}
      />

      <FooterSignatureModal
        visible={footerModalVisible}
        config={selectedConfig}
        onClose={handleFooterModalClose}
      />
    </>
  );
};

export default NewsletterConfigList;
