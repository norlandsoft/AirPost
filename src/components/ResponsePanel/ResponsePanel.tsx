import React, { useState } from 'react';
import { Tabs, Tag, Space, Button, Tooltip, Empty, Descriptions, Collapse, Result } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CopyOutlined,
  DownloadOutlined,
  ExpandOutlined,
  RocketOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import ReactJson from 'react-json-view';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { ApiResponse, TestResult } from '../../types';
import './ResponsePanel.css';

interface ResponsePanelProps {
  response: ApiResponse | null;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ response }) => {
  const [activeTab, setActiveTab] = useState('body');

  if (!response) {
    return (
      <div className="response-panel-container empty">
        <div className="empty-state">
          <div className="empty-state-icon">
            <RocketOutlined />
          </div>
          <div className="empty-state-title">No Response Yet</div>
          <div className="empty-state-description">
            Send a request to see the response here
          </div>
        </div>
      </div>
    );
  }

  // 格式化响应大小
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // 格式化时间
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // 获取状态类型
  const getStatusType = (status: number): 'success' | 'redirect' | 'client-error' | 'server-error' => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'redirect';
    if (status >= 400 && status < 500) return 'client-error';
    return 'server-error';
  };

  // 获取状态图标
  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircleOutlined />;
    if (status >= 400) return <CloseCircleOutlined />;
    return <ClockCircleOutlined />;
  };

  // 复制响应内容
  const handleCopy = () => {
    const content = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data, null, 2);
    navigator.clipboard.writeText(content);
  };

  // 下载响应内容
  const handleDownload = () => {
    const content = typeof response.data === 'string'
      ? response.data
      : JSON.stringify(response.data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 渲染响应体
  const renderBody = () => {
    if (!response.data) {
      return <div className="response-empty">Empty response body</div>;
    }

    // 如果是字符串，尝试语法高亮
    if (typeof response.data === 'string') {
      try {
        // 尝试 JSON 格式化
        const parsed = JSON.parse(response.data);
        return (
          <ReactJson
            src={parsed}
            theme="rjv-default"
            collapsed={2}
            enableClipboard={true}
            displayDataTypes={false}
            style={{ background: 'transparent' }}
          />
        );
      } catch {
        // 非 JSON 字符串，使用高亮
        const highlighted = hljs.highlight(response.data, { language: 'json' }).value;
        return (
          <pre className="response-content">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        );
      }
    }

    // 对象类型
    return (
      <ReactJson
        src={response.data}
        theme="rjv-default"
        collapsed={2}
        enableClipboard={true}
        displayDataTypes={false}
        style={{ background: 'transparent' }}
      />
    );
  };

  // 渲染 Headers
  const renderHeaders = () => {
    const headers = Object.entries(response.headers);
    if (headers.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-title">No Headers</div>
          <div className="empty-state-description">This response has no headers</div>
        </div>
      );
    }

    return (
      <div className="response-headers">
        {headers.map(([key, value]) => (
          <div key={key} className="header-row">
            <div className="header-key">{key}</div>
            <div className="header-value">{value}</div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染测试结果
  const renderTestResults = () => {
    const testResults = response.testResults || [];
    
    if (testResults.length === 0) {
      return (
        <div className="test-results-empty">
          <Result
            icon={<ExperimentOutlined style={{ color: '#999' }} />}
            title="No Tests Run"
            subTitle="Add test scripts to your request to validate responses"
          />
        </div>
      );
    }

    const passedCount = testResults.filter(t => t.status === 'passed').length;
    const failedCount = testResults.filter(t => t.status === 'failed').length;

    return (
      <div className="test-results">
        <div className="test-summary">
          <div className={`test-summary-item passed`}>
            <CheckCircleOutlined />
            <span>{passedCount} Passed</span>
          </div>
          <div className={`test-summary-item ${failedCount > 0 ? 'failed' : ''}`}>
            <CloseCircleOutlined />
            <span>{failedCount} Failed</span>
          </div>
        </div>

        <Collapse defaultActiveKey={['tests']} ghost>
          <Collapse.Panel 
            key="tests" 
            header={`Test Results (${testResults.length})`}
          >
            <div className="test-list">
              {testResults.map((test, index) => (
                <div 
                  key={index} 
                  className={`test-item ${test.status}`}
                >
                  <div className="test-icon">
                    {test.status === 'passed' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    )}
                  </div>
                  <div className="test-content">
                    <div className="test-name">{test.name}</div>
                    {test.status === 'failed' && test.message && (
                      <div className="test-message">{test.message}</div>
                    )}
                  </div>
                  <Tag color={test.status === 'passed' ? 'success' : 'error'}>
                    {test.status}
                  </Tag>
                </div>
              ))}
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  };

  const statusType = getStatusType(response.status);
  
  // 构建 tabs
  const tabItems = [
    {
      key: 'body',
      label: 'Body',
      children: (
        <div className="response-body">
          {renderBody()}
        </div>
      ),
    },
    {
      key: 'headers',
      label: `Headers (${Object.keys(response.headers).length})`,
      children: renderHeaders(),
    },
    {
      key: 'tests',
      label: (
        <span>
          <ExperimentOutlined />
          Tests
          {response.testResults && response.testResults.length > 0 && (
            <Tag 
              color={response.testResults.every(t => t.status === 'passed') ? 'success' : 'error'}
              style={{ marginLeft: 8 }}
            >
              {response.testResults.filter(t => t.status === 'passed').length}/{response.testResults.length}
            </Tag>
          )}
        </span>
      ),
      children: renderTestResults(),
    },
    {
      key: 'cookies',
      label: 'Cookies',
      children: (
        <div className="empty-state">
          <div className="empty-state-title">Cookies Not Supported</div>
          <div className="empty-state-description">Cookie viewing is not yet available</div>
        </div>
      ),
    },
  ];

  return (
    <div className="response-panel-container">
      {/* Response Info Bar */}
      <div className="response-info-bar">
        <div className={`response-status ${statusType}`}>
          {getStatusIcon(response.status)}
          <span>{response.status} {response.statusText}</span>
        </div>
        
        <div className="response-meta">
          <span className="response-meta-item">
            <ClockCircleOutlined />
            {formatTime(response.time)}
          </span>
          <span className="response-meta-item">
            <FileTextOutlined />
            {formatSize(response.size)}
          </span>
          <span className="response-meta-item">
            {response.contentType}
          </span>
        </div>
        
        <div className="response-actions">
          <Tooltip title="Copy response">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopy}
            />
          </Tooltip>
          <Tooltip title="Download response">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
          <Tooltip title="Expand">
            <Button
              type="text"
              size="small"
              icon={<ExpandOutlined />}
            />
          </Tooltip>
        </div>
      </div>

      {/* Response Tabs */}
      <div className="response-tabs-container">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="response-tabs"
          items={tabItems}
        />
      </div>
    </div>
  );
};

export default ResponsePanel;
