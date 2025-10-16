import React, { useMemo } from 'react';
import { Tabs, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import AuthConfig from '../../auth/pages/AuthConfig.jsx';
import NewsletterConfigsPage from '../../newsletter/pages/newsletterConfig.jsx';

const { Title } = Typography;

const AdminSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeKey = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('section') || 'auth';
  }, [location.search]);

  const onChange = (key) => {
    const basePath = location.pathname.split('?')[0];
    navigate(`${basePath}?section=${key}`);
  };

  const items = [
    {
      key: 'auth',
      label: 'Auth',
      children: <AuthConfig />,
    },
    {
      key: 'newsletter',
      label: 'Newsletter',
      children: <NewsletterConfigsPage />,
    },
    {
      key: 'smtp',
      label: 'SMTP',
      children: (
        <div>
          <Title level={5}>Configuración SMTP</Title>
          <p>Pendiente de integrar panel de SMTP del módulo Base.</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>Configuración</Title>
      <Tabs items={items} activeKey={activeKey} onChange={onChange} />
    </div>
  );
};

export default AdminSettings;
