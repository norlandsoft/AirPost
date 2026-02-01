import React, { useState } from 'react';
import { Form, Input, Select, Space, Button, Checkbox, message, Divider, Collapse } from 'antd';
import { KeyOutlined, GlobalOutlined, LockOutlined, SyncOutlined, CopyOutlined } from '@ant-design/icons';
import { AuthConfig } from '../../types';

interface OAuth2AuthProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

const { Option } = Select;
const { Panel } = Collapse;

const OAuth2Auth: React.FC<OAuth2AuthProps> = ({
  data,
  onChange,
  disabled = false,
}) => {
  const [grantType, setGrantType] = useState(data.grantType || 'authorization_code');
  const [generatingToken, setGeneratingToken] = useState(false);

  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  // 复制授权 URL
  const copyAuthUrl = () => {
    const authUrl = buildAuthUrl();
    if (authUrl) {
      navigator.clipboard.writeText(authUrl);
      message.success('授权 URL 已复制到剪贴板');
    }
  };

  // 构建授权 URL
  const buildAuthUrl = (): string => {
    const baseUrl = data.authUrl || '';
    if (!baseUrl) return '';

    const params = new URLSearchParams();
    params.set('client_id', data.clientId || '');
    params.set('redirect_uri', data.redirectUri || 'http://localhost:3000/callback');
    params.set('response_type', 'code');
    params.set('scope', data.scope || '');

    if (data.state) {
      params.set('state', data.state);
    }

    // 如果需要 PKCE
    if (data.usePkce) {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      updateData('codeVerifier', codeVerifier);
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  };

  // 生成随机字符串
  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 生成 PKCE code verifier
  const generateCodeVerifier = (): string => {
    return generateRandomString(128);
  };

  // 生成 PKCE code challenge
  const generateCodeChallenge = (verifier: string): string => {
    // 简化实现，实际应使用 SHA-256
    return verifier;
  };

  // 打开授权页面
  const openAuthPage = () => {
    const authUrl = buildAuthUrl();
    if (authUrl) {
      window.open(authUrl, '_blank', 'width=600,height=700');
      message.info('请在新窗口中完成授权，然后粘贴返回的授权码');
    } else {
      message.warning('请先填写授权 URL 和 Client ID');
    }
  };

  // 刷新 Token
  const refreshToken = async () => {
    if (!data.refreshToken) {
      message.warning('请先获取访问令牌');
      return;
    }

    setGeneratingToken(true);
    try {
      // 模拟刷新 token
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Token 已刷新');
      updateData('accessToken', 'new_access_token_' + Date.now());
      updateData('expiresAt', Date.now() + 3600000);
    } catch (error) {
      message.error('刷新 Token 失败');
    } finally {
      setGeneratingToken(false);
    }
  };

  // 处理 Token 回调 (简化版，实际需要服务器配合)
  const handleTokenCallback = () => {
    const code = data.authorizationCode;
    if (!code) {
      message.warning('请输入授权码');
      return;
    }

    setGeneratingToken(true);
    try {
      // 模拟交换 token
      // 实际实现中，这里应该调用后端 API 来交换 token
      setTimeout(() => {
        updateData('accessToken', 'mock_access_token_' + Date.now());
        updateData('refreshToken', 'mock_refresh_token_' + Date.now());
        updateData('expiresAt', Date.now() + 3600000);
        message.success('Token 获取成功');
        setGeneratingToken(false);
      }, 1500);
    } catch (error) {
      message.error('获取 Token 失败');
      setGeneratingToken(false);
    }
  };

  return (
    <div className="oauth2-auth">
      <Collapse defaultActiveKey={['config']} ghost>
        <Panel header="OAuth2 配置" key="config">
          <Form layout="vertical" size="small">
            {/* Grant Type */}
            <Form.Item label="授权类型 (Grant Type)">
              <Select
                value={grantType}
                onChange={(value) => {
                  setGrantType(value);
                  updateData('grantType', value);
                }}
                disabled={disabled}
              >
                <Option value="authorization_code">Authorization Code</Option>
                <Option value="implicit">Implicit (不推荐)</Option>
                <Option value="client_credentials">Client Credentials</Option>
                <Option value="password">Password (不推荐)</Option>
              </Select>
            </Form.Item>

            {/* Auth URL */}
            <Form.Item label="授权 URL (Auth URL)">
              <Input
                placeholder="https://example.com/oauth/authorize"
                value={data.authUrl}
                onChange={(e) => updateData('authUrl', e.target.value)}
                prefix={<GlobalOutlined />}
                disabled={disabled}
              />
            </Form.Item>

            {/* Access Token URL */}
            <Form.Item label="Token URL">
              <Input
                placeholder="https://example.com/oauth/token"
                value={data.accessTokenUrl}
                onChange={(e) => updateData('accessTokenUrl', e.target.value)}
                prefix={<KeyOutlined />}
                disabled={disabled}
              />
            </Form.Item>

            {/* Client ID */}
            <Form.Item label="Client ID">
              <Input
                placeholder="你的 Client ID"
                value={data.clientId}
                onChange={(e) => updateData('clientId', e.target.value)}
                prefix={<LockOutlined />}
                disabled={disabled}
              />
            </Form.Item>

            {/* Client Secret */}
            <Form.Item label="Client Secret">
              <Input.Password
                placeholder="你的 Client Secret"
                value={data.clientSecret}
                onChange={(e) => updateData('clientSecret', e.target.value)}
                prefix={<LockOutlined />}
                disabled={disabled}
              />
            </Form.Item>

            {/* Redirect URI */}
            <Form.Item label="回调 URL (Redirect URI)">
              <Input
                placeholder="http://localhost:3000/callback"
                value={data.redirectUri}
                onChange={(e) => updateData('redirectUri', e.target.value)}
                prefix={<GlobalOutlined />}
                disabled={disabled}
              />
            </Form.Item>

            {/* Scope */}
            <Form.Item label="Scope">
              <Input
                placeholder="read:user write:repo"
                value={data.scope}
                onChange={(e) => updateData('scope', e.target.value)}
                disabled={disabled}
              />
            </Form.Item>

            {/* State */}
            <Form.Item label="State">
              <Input
                placeholder="随机 state 值"
                value={data.state}
                onChange={(e) => updateData('state', e.target.value)}
                disabled={disabled}
              />
            </Form.Item>

            {/* PKCE */}
            <Form.Item>
              <Checkbox
                checked={data.usePkce}
                onChange={(e) => updateData('usePkce', e.target.checked)}
                disabled={disabled}
              >
                使用 PKCE (推荐)
              </Checkbox>
            </Form.Item>
          </Form>
        </Panel>

        <Panel header="获取 Token" key="token">
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Authorization Code */}
            {grantType === 'authorization_code' && (
              <>
                <Form.Item label="授权码 (Authorization Code)" style={{ marginBottom: 8 }}>
                  <Input.TextArea
                    placeholder="从回调 URL 中获取的授权码"
                    value={data.authorizationCode}
                    onChange={(e) => updateData('authorizationCode', e.target.value)}
                    rows={3}
                    disabled={disabled}
                  />
                </Form.Item>

                <Space wrap>
                  <Button
                    type="primary"
                    icon={<GlobalOutlined />}
                    onClick={openAuthPage}
                    disabled={disabled || !data.authUrl || !data.clientId}
                  >
                    打开授权页面
                  </Button>

                  <Button
                    icon={<SyncOutlined spin={generatingToken} />}
                    onClick={handleTokenCallback}
                    disabled={disabled || !data.authorizationCode || generatingToken}
                  >
                    交换 Token
                  </Button>

                  <Button
                    icon={<CopyOutlined />}
                    onClick={copyAuthUrl}
                    disabled={!data.authUrl}
                  >
                    复制授权 URL
                  </Button>
                </Space>
              </>
            )}

            {/* Client Credentials */}
            {grantType === 'client_credentials' && (
              <Button
                type="primary"
                icon={<SyncOutlined spin={generatingToken} />}
                onClick={refreshToken}
                disabled={disabled || !data.accessTokenUrl || !data.clientId || !data.clientSecret}
              >
                获取访问 Token
              </Button>
            )}

            {/* Password */}
            {grantType === 'password' && (
              <>
                <Form.Item label="用户名" style={{ marginBottom: 8 }}>
                  <Input
                    placeholder="用户名字"
                    value={data.username}
                    onChange={(e) => updateData('username', e.target.value)}
                    disabled={disabled}
                  />
                </Form.Item>

                <Form.Item label="密码" style={{ marginBottom: 8 }}>
                  <Input.Password
                    placeholder="密码"
                    value={data.password}
                    onChange={(e) => updateData('password', e.target.value)}
                    disabled={disabled}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  icon={<SyncOutlined spin={generatingToken} />}
                  onClick={refreshToken}
                  disabled={disabled}
                >
                  获取 Token
                </Button>
              </>
            )}
          </Space>
        </Panel>

        <Panel header="当前 Token" key="current">
          {data.accessToken ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <strong>访问 Token:</strong>
                <Input.TextArea
                  value={data.accessToken}
                  rows={2}
                  readOnly
                  style={{ marginTop: 8, fontFamily: 'monospace' }}
                />
              </div>

              {data.refreshToken && (
                <div>
                  <strong>刷新 Token:</strong>
                  <Input.Password
                    value={data.refreshToken}
                    readOnly
                    style={{ marginTop: 8 }}
                  />
                </div>
              )}

              {data.expiresAt && (
                <div>
                  <strong>过期时间:</strong>
                  <p style={{ marginTop: 4 }}>
                    {new Date(data.expiresAt).toLocaleString()}
                    {' '}({Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000))}秒后过期)
                  </p>
                </div>
              )}

              <Space>
                <Button
                  size="small"
                  icon={<SyncOutlined spin={generatingToken} />}
                  onClick={refreshToken}
                  disabled={disabled || !data.refreshToken}
                >
                  刷新 Token
                </Button>

                <Button
                  size="small"
                  danger
                  onClick={() => {
                    updateData('accessToken', undefined);
                    updateData('refreshToken', undefined);
                    updateData('expiresAt', undefined);
                    message.success('Token 已清除');
                  }}
                >
                  清除 Token
                </Button>
              </Space>
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
              暂未获取 Token，请先完成授权流程
            </div>
          )}
        </Panel>
      </Collapse>
    </div>
  );
};

export default OAuth2Auth;
