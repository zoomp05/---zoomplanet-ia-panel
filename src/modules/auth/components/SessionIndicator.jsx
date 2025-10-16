import React from 'react';
import { Tag, Tooltip } from 'antd';
import { LockOutlined, ClockCircleOutlined } from '@ant-design/icons';

const SessionIndicator = () => {
  const isRemembered = localStorage.getItem('rememberMe') === 'true';
  
  if (!isRemembered) {
    return (
      <Tooltip title="Esta sesión expirará cuando cierres el navegador">
        <Tag icon={<ClockCircleOutlined />} color="orange">
          Sesión temporal
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Has elegido que te recordemos. Esta sesión persistirá.">
      <Tag icon={<LockOutlined />} color="green">
        Sesión persistente
      </Tag>
    </Tooltip>
  );
};

export default SessionIndicator;
