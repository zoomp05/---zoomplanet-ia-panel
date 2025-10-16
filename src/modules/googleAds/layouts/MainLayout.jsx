/**
 * Layout Principal del módulo GoogleAds
 * 
 * Layout específico para todas las páginas del módulo Google Ads
 */

import React from 'react';
import { Outlet } from 'react-router';
import { Layout, Breadcrumb } from 'antd';
import { GoogleOutlined, HomeOutlined } from '@ant-design/icons';

const { Content } = Layout;

/**
 * Componente MainLayout para Google Ads
 */
const GoogleAdsMainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '0 24px', marginTop: 16 }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <GoogleOutlined />
            <span>Google Ads</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        
        <div style={{ 
          background: '#fff', 
          padding: 24, 
          minHeight: 'calc(100vh - 140px)',
          borderRadius: 8
        }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default GoogleAdsMainLayout;
