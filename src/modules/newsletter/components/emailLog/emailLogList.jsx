import React, { useState } from 'react';
import { Table, Space, Tag, Input, Select, DatePicker, Card, Statistic, Row, Col } from 'antd';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

const GET_EMAIL_LOGS = gql`
  query GetEmailLogs($filter: EmailLogFilter, $limit: Int, $offset: Int) {
    emailLogs(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        id
        newsletter {
          id
          name
          subject
        }
        contact {
          id
          email
          name
        }
        status
        sentAt
        openedAt
        clickedAt
        error
        metadata {
          ip
          userAgent
        }
      }
      pageInfo {
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
        totalItems
      }
      totalCount
    }
    emailStats(filter: $filter) {
      totalSent
      totalOpened
      totalClicked
      totalBounced
      totalComplained
      openRate
      clickRate
    }
  }
`;

const EmailLogList = () => {
  const [filter, setFilter] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const { loading, data } = useQuery(GET_EMAIL_LOGS, {
    variables: {
      filter,
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize
    }
  });

  const columns = [
    {
      title: 'Newsletter',
      dataIndex: ['newsletter', 'name'],
      key: 'newsletter',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small>{record.newsletter.subject}</small>
        </div>
      ),
    },
    {
      title: 'Contact',
      dataIndex: ['contact', 'email'],
      key: 'contact',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small>{record.contact.name}</small>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          SENT: 'green',
          OPENED: 'blue',
          CLICKED: 'purple',
          BOUNCED: 'red',
          COMPLAINED: 'orange',
          FAILED: 'red'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Sent At',
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Opened At',
      dataIndex: 'openedAt',
      key: 'openedAt',
      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: 'Clicked At',
      dataIndex: 'clickedAt',
      key: 'clickedAt',
      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (error) => error || '-',
    }
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
  };

  const handleFilterChange = (values) => {
    setFilter(prev => ({
      ...prev,
      ...values
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Stats Cards */}
      {data?.emailStats && (
        <Row gutter={16}>
          <Col span={4}>
            <Card>
              <Statistic
                title="Total Sent"
                value={data.emailStats.totalSent}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Open Rate"
                value={data.emailStats.openRate}
                suffix="%"
                precision={2}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Click Rate"
                value={data.emailStats.clickRate}
                suffix="%"
                precision={2}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Bounced"
                value={data.emailStats.totalBounced}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Complained"
                value={data.emailStats.totalComplained}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Space wrap>
        <Select
          allowClear
          placeholder="Filter by Status"
          style={{ width: 200 }}
          onChange={(value) => handleFilterChange({ status: value })}
        >
          <Option value="SENT">Sent</Option>
          <Option value="OPENED">Opened</Option>
          <Option value="CLICKED">Clicked</Option>
          <Option value="BOUNCED">Bounced</Option>
          <Option value="COMPLAINED">Complained</Option>
          <Option value="FAILED">Failed</Option>
        </Select>

        <RangePicker
          showTime
          onChange={(dates) => {
            if (dates) {
              handleFilterChange({
                startDate: dates[0].toISOString(),
                endDate: dates[1].toISOString()
              });
            } else {
              handleFilterChange({
                startDate: null,
                endDate: null
              });
            }
          }}
        />
      </Space>

      {/* Email Logs Table */}
      <Table
        loading={loading}
        columns={columns}
        dataSource={data?.emailLogs.edges}
        rowKey="id"
        pagination={{
          ...pagination,
          total: data?.emailLogs.totalCount,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} logs`
        }}
        onChange={handleTableChange}
      />
    </Space>
  );
};

export default EmailLogList;
