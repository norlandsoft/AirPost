import React from 'react';
import { Form, Input, Switch, Space, Button, message } from 'antd';
import { KeyOutlined, CopyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

interface BearerAuthProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

const BearerAuth: React.FC<BearerAuthProps> = ({
  data,
  onChange,
  disabled = false,
}) => {
  const [showToken, setShowToken] = React.useState(false);

  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleCopyToken = () => {
    const token = data.token || '';
    if (token) {
      navigator.clipboard.writeText(token);
      message.success('Token 已复制到剪贴板');
    } else {
      message.warning('Token 为空');
    }
  };

  return (
    <div className="bearer-auth" style={{ padding: '16px' }}>
      <Form layout="vertical" size="middle" disabled={disabled}>
        <Form.Item
          label={
            <Space>
              <span>Token</span>
              <span style={{ color: '#999', fontWeight: 'normal' }}>(Bearer Token)</span>
            </Space>
          }
        >
          <Input.Password
            placeholder="请输入 Bearer Token"
            value={data.token || ''}
            onChange={(e) => handleChange('token', e.target.value)}
            prefix={<KeyOutlined />}
            suffix={
              <Button
                type="text"
                size="small"
                icon={showToken ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowToken(!showToken)}
              />
            }
            allowClear
            visibilityToggle={false}
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
              ? '自动在请求头中添加 Authorization: Bearer &lt;token&gt; 头'
              : '需要手动在 Headers 中添加 Authorization 头'}
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            icon={<CopyOutlined />}
            onClick={handleCopyToken}
            disabled={!data.token}
          >
            复制 Token
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BearerAuth;
