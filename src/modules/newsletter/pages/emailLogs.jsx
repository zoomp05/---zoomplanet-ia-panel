import React from 'react';
import { Typography, Space } from 'antd';
import EmailLogList from '../components/emailLog/emailLogList';

const { Title } = Typography;

const EmailLogsPage = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Email Logs</Title>
      <EmailLogList />
    </Space>
  );
};

export default EmailLogsPage;
