import React, { useState, useCallback } from 'react';
import { Form, Input, Select, Button, Space, Tabs, message, Spin } from 'antd';
import {
  SendOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  CodeOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import KeyValueEditor from './KeyValueEditor';
import { AuthPanel } from '../Auth';
import { ApiRequest, KeyValuePair, HttpMethod, BodyType, AuthConfig } from '../../types';
import { sendRequest } from '../../services/http';
import { addHistoryItem } from '../../services/storage';
import { useShortcuts, defaultShortcuts } from '../../hooks/useShortcuts';
import './RequestPanel.css';

const { Option } = Select;
const { TextArea } = Input;

interface RequestPanelProps {
  request?: ApiRequest | null;
  onSave?: (request: ApiRequest) => void;
  onResponse?: (response: any) => void;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
const BODY_TYPES: { label: string; value: BodyType }[] = [
  { label: 'None', value: 'none' },
  { label: 'JSON', value: 'json' },
  { label: 'form-data', value: 'form-data' },
  { label: 'x-www-form-urlencoded', value: 'x-www-form-urlencoded' },
  { label: 'Raw', value: 'raw' },
];

const RequestPanel: React.FC<RequestPanelProps> = ({
  request: initialRequest,
  onSave,
  onResponse,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<HttpMethod>(initialRequest?.method || 'GET');
  const [url, setUrl] = useState(initialRequest?.url || '');
  const [headers, setHeaders] = useState<KeyValuePair[]>(
    initialRequest?.headers || []
  );
  const [params, setParams] = useState<KeyValuePair[]>(
    initialRequest?.params || []
  );
  const [body, setBody] = useState(initialRequest?.body || '');
  const [bodyType, setBodyType] = useState<BodyType>(
    initialRequest?.bodyType || 'none'
  );
  const [requestName, setRequestName] = useState(initialRequest?.name || 'New Request');
  const [auth, setAuth] = useState<AuthConfig>(
    initialRequest?.auth || { type: 'none', data: {} }
  );
  const [preRequestScript, setPreRequestScript] = useState(
    initialRequest?.preRequestScript || ''
  );
  const [testScript, setTestScript] = useState(
    initialRequest?.testScript || ''
  );

  // 获取当前请求对象
  const getCurrentRequest = (): ApiRequest => {
    return {
      id: initialRequest?.id || `req_${Date.now()}`,
      name: requestName,
      method,
      url,
      headers,
      params,
      body,
      bodyType,
      auth,
      preRequestScript,
      testScript,
      collectionId: initialRequest?.collectionId,
      createdAt: initialRequest?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  };

  // 发送请求
  const handleSendRequest = useCallback(async () => {
    try {
      const values = await form.validateFields(['url']);
      
      if (!url.trim()) {
        message.warning('Please enter a request URL');
        return;
      }

      setLoading(true);
      message.loading({ content: 'Sending request...', key: 'sending' });

      const request = getCurrentRequest();
      const response = await sendRequest(request);

      // 记录到历史
      addHistoryItem({
        id: `history_${Date.now()}`,
        request,
        response,
        createdAt: Date.now(),
      });

      message.success({ content: `Request completed (${response.time}ms)`, key: 'sending' });

      // 回调响应数据
      if (onResponse) {
        onResponse(response);
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.warning('Please check the form');
      } else {
        message.error({ content: 'Request failed', key: 'sending' });
      }
      console.error('Request error:', error);
    } finally {
      setLoading(false);
    }
  }, [url, form, onResponse]);

  // 保存请求
  const handleSave = useCallback(() => {
    const request = getCurrentRequest();
    if (onSave) {
      onSave(request);
    }
    message.success('Saved successfully');
  }, [onSave]);

  // 注册快捷键
  useShortcuts(defaultShortcuts(handleSendRequest, handleSave));

  // JSON 格式化
  const formatJson = () => {
    try {
      const parsed = JSON.parse(body || '{}');
      setBody(JSON.stringify(parsed, null, 2));
    } catch {
      message.warning('Invalid JSON format');
    }
  };

  // 获取方法颜色
  const getMethodColor = (m: HttpMethod): string => {
    const colors: Record<HttpMethod, string> = {
      GET: '#61affe',
      POST: '#49cc90',
      PUT: '#fca130',
      DELETE: '#f93e3e',
      PATCH: '#50e3c2',
      HEAD: '#9012fe',
      OPTIONS: '#0d5aa7',
    };
    return colors[m] || '#8c8c8c';
  };

  return (
    <div className="request-panel-container">
      {/* Request Header */}
      <div className="request-header">
        <Input
          placeholder="Request Name"
          value={requestName}
          onChange={(e) => setRequestName(e.target.value)}
          className="request-name-input"
          variant="borderless"
          size="large"
        />

        {/* URL Bar */}
        <div className="url-bar">
          <Select
            value={method}
            onChange={setMethod}
            className="method-select"
            disabled={loading}
            dropdownMatchSelectWidth={false}
          >
            {HTTP_METHODS.map((m) => (
              <Option key={m} value={m}>
                <span style={{ 
                  fontWeight: 600,
                  color: getMethodColor(m),
                }}>
                  {m}
                </span>
              </Option>
            ))}
          </Select>
          
          <Input
            placeholder="Enter request URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="url-input"
            size="large"
          />
          
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendRequest}
            loading={loading}
            className="send-button"
            size="large"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Request Tabs */}
      <div className="request-tabs-container">
        <Tabs
          defaultActiveKey="params"
          className="request-tabs"
          items={[
            {
              key: 'params',
              label: (
                <span>
                  <RocketOutlined />
                  Params
                </span>
              ),
              children: (
                <div className="tab-content">
                  <KeyValueEditor
                    title="Query Parameters"
                    data={params}
                    onChange={setParams}
                    keyPlaceholder="Parameter key"
                    valuePlaceholder="Parameter value"
                  />
                </div>
              ),
            },
            {
              key: 'headers',
              label: (
                <span>
                  <SafetyCertificateOutlined />
                  Headers
                </span>
              ),
              children: (
                <div className="tab-content">
                  <KeyValueEditor
                    title="Request Headers"
                    data={headers}
                    onChange={setHeaders}
                    keyPlaceholder="Header name"
                    valuePlaceholder="Header value"
                  />
                </div>
              ),
            },
            {
              key: 'body',
              label: 'Body',
              children: (
                <div className="tab-content body-editor">
                  <Select
                    value={bodyType}
                    onChange={setBodyType}
                    className="body-type-select"
                    disabled={loading}
                    size="large"
                  >
                    {BODY_TYPES.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>

                  {bodyType !== 'none' && (
                    <>
                      <div className="body-actions">
                        <Button size="small" onClick={formatJson}>
                          Format JSON
                        </Button>
                      </div>
                      <TextArea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={
                          bodyType === 'json'
                            ? '{"key": "value"}'
                            : bodyType === 'form-data'
                            ? 'field1=value1&field2=value2'
                            : 'Request body content'
                        }
                        className="body-textarea"
                        disabled={loading}
                      />
                    </>
                  )}

                  {bodyType === 'none' && (
                    <div className="body-empty">
                      <span>This request has no body</span>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'auth',
              label: (
                <span>
                  <SafetyCertificateOutlined />
                  Auth
                </span>
              ),
              children: (
                <div className="tab-content">
                  <AuthPanel
                    auth={auth}
                    onChange={setAuth}
                    disabled={loading}
                  />
                </div>
              ),
            },
            {
              key: 'pre-request',
              label: (
                <span>
                  <CodeOutlined />
                  Pre-request
                </span>
              ),
              children: (
                <div className="tab-content script-editor">
                  <div className="script-header">
                    <span>Pre-request Script</span>
                    <span className="script-hint">在请求发送前执行，可用于设置动态变量</span>
                  </div>
                  <TextArea
                    value={preRequestScript}
                    onChange={(e) => setPreRequestScript(e.target.value)}
                    placeholder={`// 设置动态变量
pm.environment.set("timestamp", pm.variables.replaceIn('{{$timestamp}}'));
pm.environment.set("randomId", pm.variables.replaceIn('{{$guid}}'));

// 获取当前时间戳
const now = Date.now();
pm.environment.set("requestTime", String(now));`}
                    className="script-textarea"
                    disabled={loading}
                    autoSize={{ minRows: 10, maxRows: 20 }}
                  />
                  <div className="script-examples">
                    <Button 
                      size="small" 
                      type="link"
                      onClick={() => setPreRequestScript(`// 设置环境变量
pm.environment.set("variableName", "value");

// 获取环境变量
const value = pm.environment.get("variableName");

// 设置全局变量
pm.globals.set("globalVar", "value");

// 使用内置变量
pm.environment.set("timestamp", pm.variables.replaceIn('{{$timestamp}}'));
pm.environment.set("guid", pm.variables.replaceIn('{{$guid}}'));
pm.environment.set("randomInt", pm.variables.replaceIn('{{$randomInt}}'));

// 获取请求信息
const url = pm.request.url;
const method = pm.request.method;

// 控制台输出
console.log("Request URL:", url);
console.log("Request Method:", method);`)}
                    >
                      常用示例
                    </Button>
                  </div>
                </div>
              ),
            },
            {
              key: 'tests',
              label: (
                <span>
                  <ExperimentOutlined />
                  Tests
                </span>
              ),
              children: (
                <div className="tab-content script-editor">
                  <div className="script-header">
                    <span>Test Script</span>
                    <span className="script-hint">在收到响应后执行，可用于断言验证</span>
                  </div>
                  <TextArea
                    value={testScript}
                    onChange={(e) => setTestScript(e.target.value)}
                    placeholder={`// 状态码断言
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Status code is 201", () => {
    pm.expect(pm.response.code).to.equal(201);
});

// 响应体断言
pm.test("Response body contains data", () => {
    pm.expect(pm.response.json()).to.have.property('data');
});

pm.test("Response time is less than 500ms", () => {
    pm.expect(pm.response.time).to.be.below(500);
});

// 自定义测试
pm.test("Response has success status", () => {
    const responseJson = pm.response.json();
    pm.expect(responseJson.success).to.be.true;
});`}
                    className="script-textarea"
                    disabled={loading}
                    autoSize={{ minRows: 10, maxRows: 20 }}
                  />
                  <div className="script-examples">
                    <Button 
                      size="small" 
                      type="link"
                      onClick={() => setTestScript(`// 状态码断言
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
    pm.expect(pm.response.code).to.equal(200);
});

pm.test("Successful response", () => {
    pm.expect(pm.response.code).to.be.above(199).and.to.be.below(300);
});

// 响应体断言
pm.test("Response has data property", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.not.be.empty;
});

pm.test("Response is JSON", () => {
    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});

// 响应时间断言
pm.test("Response time is reasonable", () => {
    pm.expect(pm.response.time).to.be.below(1000);
});

// 自定义断言
pm.test("Response success flag is true", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
});

// 数组断言
pm.test("Users array exists and has items", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData.users).to.be.an('array');
    pm.expect(jsonData.users.length).to.be.above(0);
});`)}
                    >
                      常用示例
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default RequestPanel;
