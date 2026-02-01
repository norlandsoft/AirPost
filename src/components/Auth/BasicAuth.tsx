import React from 'react';
import { Form, Input, Switch, Space, message } from 'antd';
import { UserOutlined, KeyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

interface BasicAuthProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

const BasicAuth: React.FC<BasicAuthProps> = ({
  data,
  onChange,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="basic-auth" style={{ padding: '16px' }}>
      <Form layout="vertical" size="middle" disabled={disabled}>
        <Form.Item label="用户名">
          <Input
            placeholder="请输入用户名"
            value={data.username || ''}
            onChange={(e) => handleChange('username', e.target.value)}
            prefix={<UserOutlined />}
            allowClear
          />
        </Form.Item>

        <Form.Item label="密码">
          <Input.Password
            placeholder="请输入密码"
            value={data.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
            prefix={<KeyOutlined />}
            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            allowClear
          />
        </Form.Item>

        <Form.Item label="添加认证头">
          <Switch
            checked={data.addHeaders !== false}
            onChange={(checked) => handleChange('addHeaders', checked)}
            checkedChildren="自动添加"
            unCheckedChildren="手动添加"
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            {data.addHeaders !== false
              ? '自动在请求头中添加 Authorization 头'
              : '需要手动在 Headers 中添加 Authorization 头'}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BasicAuth;
