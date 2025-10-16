import React, { useState } from "react";
import { Table, Space, Button, Tag, Input } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CAMPAIGNS, SOFT_DELETE_CAMPAIGN } from "../../apollo/campaign";
import CampaignModal from "./campaignModal";
import { toast } from "react-hot-toast";
import { DatePicker } from 'antd';
import moment from 'moment';

const getStatusColor = (status) => {
  const colors = {
    DRAFT: "default",
    ACTIVE: "processing",
    PAUSED: "warning",
    COMPLETED: "success",
    FAILED: "error",
  };
  return colors[status] || "default";
};

const CampaignList = ({ onEdit }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [filter, setFilter] = useState({ search: "" });
  const { data, loading, refetch } = useQuery(GET_CAMPAIGNS, {
    variables: { filter },
  });

  const [softDelete] = useMutation(SOFT_DELETE_CAMPAIGN);

  const handleDelete = async (id) => {
    try {
      await softDelete({ variables: { id } });
      toast.success("Campaign deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Stats",
      key: "stats",
      render: (_, record) => (
        <Space size="small">
          <Tag>Sent: {record.stats.totalSent}</Tag>
          <Tag>Opened: {record.stats.opened}</Tag>
          <Tag>Clicked: {record.stats.clicked}</Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleModalClose = (refresh = false) => {
    setModalVisible(false);
    setSelectedCampaign(null);
    if (refresh) {
      refetch();
    }
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setModalVisible(true);
  };

  const dateFormat = 'YYYY/MM/DD';

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Create Campaign
        </Button>
        <Input.Search
          placeholder="Search campaigns..."
          onSearch={(value) => setFilter({ ...filter, search: value })}
          style={{ width: 300 }}
        />
      </Space>
      <DatePicker defaultValue={moment('2015/01/01', dateFormat)} format={dateFormat} />
      <Table
        loading={loading}
        dataSource={data?.campaigns?.edges || []}
        columns={columns}
        rowKey="id"
        pagination={{
          total: data?.campaigns?.totalCount,
          showSizeChanger: true,
        }}
      />

      <CampaignModal
        visible={modalVisible}
        campaign={selectedCampaign}
        onClose={handleModalClose}
      />
    </Space>
  );
};

export default CampaignList;
