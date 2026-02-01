import React from 'react';
import { Tabs, Form, Input, Select, Space, Button, message } from 'antd';
import { UserOutlined, KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import BasicAuth from './BasicAuth';
import BearerAuth from './BearerAuth';
import OAuth2Auth from './OAuth2Auth';
import { AuthConfig } from '../../types';

interface AuthPanelProps {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
  disabled?: boolean;
}

const AuthPanel: React.FC<AuthPanelProps> = ({
  auth,
  onChange,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = React.useState(auth.type);

  const handleTypeChange = (type: AuthConfig['type']) => {
    const newAuth: AuthConfig = {
      type,
      data: {},
    };
    onChange(newAuth);
    setActiveTab(type);
  };

  const tabItems = [
    {
      key: 'none',
      label: '无认证',
      children: null,
    },
    {
      key: 'basic',
      label: 'Basic Auth',
      children: (
        <BasicAuth
          data={auth.data}
          onChange={(data) => onChange({ type: 'basic', data })}
          disabled={disabled}
        />
      ),
    },
    {
      key: 'bearer',
      label: 'Bearer Token',
      children: (
        <BearerAuth
          data={auth.data}
          onChange={(data) => onChange({ type: 'bearer', data })}
          disabled={disabled}
        />
      ),
    },
    {
      key: 'oauth2',
      label: 'OAuth 2.0',
      children: (
        <OAuth2Auth
          data={auth.data}
          onChange={(data) => onChange({ type: 'oauth2', data })}
          disabled={disabled}
        />
      ),
    },
  ];

  return (
    <div className="auth-panel">
      <div className="auth-header">
        <Space>
          <SafetyCertificateOutlined />
          <span>认证</span>
        </Space>
      </div>
      
      <div className="auth-type-selector">
        <Select
          value={auth.type}
          onChange={handleTypeChange}
          style={{ width: 200 }}
          disabled={disabled}
        >
          <Select.Option value="none">无认证</Select.Option>
          <Select.Option value="basic">Basic Auth</Select.Option>
          <Select.Option value="bearer">Bearer Token</Select.Option>
          <Select.Option value="oauth2">OAuth 2.0</Select.Option>
        </Select>
      </div>

      {auth.type !== 'none' && (
        <div className="auth-content">
          {auth.type === 'basic' && (
            <BasicAuth
              data={auth.data}
              onChange={(data) => onChange({ type: 'basic', data })}
              disabled={disabled}
            />
          )}
          {auth.type === 'bearer' && (
            <BearerAuth
              data={auth.data}
              onChange={(data) => onChange({ type: 'bearer', data })}
              disabled={disabled}
            />
          )}
          {auth.type === 'oauth2' && (
            <OAuth2Auth
              data={auth.data}
              onChange={(data) => onChange({ type: 'oauth2', data })}
              disabled={disabled}
            />
          )}
        </div>
      )}

      {auth.type === 'none' && (
        <div className="auth-empty" style={{ padding: '20px', color: '#999', textAlign: 'center' }}>
          此请求未设置认证
        </div>
      )}
    </div>
  );
};

export default AuthPanel;
