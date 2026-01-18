import React, { useState } from 'react';
import { Layout, Tree, Button, Select, Space, Typography, Tabs, Input, Form, message } from 'antd';
import {
  PlusOutlined,
  FolderOutlined,
  FileOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import Splitter from './components/Splitter';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ApiRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body: string;
  bodyType: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
}

const App: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [workspace, setWorkspace] = useState<string>('default');
  const [treeData, setTreeData] = useState<DataNode[]>([
    {
      title: '示例文件夹',
      key: 'folder-1',
      icon: <FolderOutlined />,
      children: [
        {
          title: 'GET 示例请求',
          key: 'api-1',
          icon: <FileOutlined />,
          isLeaf: true,
        },
      ],
    },
  ]);
  const [currentRequest, setCurrentRequest] = useState<ApiRequest | null>(null);
  const [form] = Form.useForm();

  // 处理树节点选择
  const onSelect = (selectedKeys: React.Key[]) => {
    setSelectedKeys(selectedKeys);
    const selectedKey = selectedKeys[0];
    if (selectedKey && typeof selectedKey === 'string' && selectedKey.startsWith('api-')) {
      // 加载请求详情
      loadRequest(selectedKey);
    } else {
      setCurrentRequest(null);
      form.resetFields();
    }
  };

  // 加载请求详情
  const loadRequest = (requestId: string) => {
    // 模拟加载请求数据
    const mockRequest: ApiRequest = {
      id: requestId,
      name: '示例请求',
      method: 'GET',
      url: 'https://api.example.com/users',
      headers: {
        'Content-Type': 'application/json',
      },
      params: {},
      body: '',
      bodyType: 'json',
    };
    setCurrentRequest(mockRequest);
    form.setFieldsValue(mockRequest);
  };

  // 发送请求
  const handleSendRequest = async () => {
    try {
      const values = await form.validateFields();
      message.loading({ content: '发送请求中...', key: 'sending' });
      
      // TODO: 实现实际的请求发送逻辑
      setTimeout(() => {
        message.success({ content: '请求发送成功', key: 'sending' });
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  // 保存请求
  const handleSaveRequest = async () => {
    try {
      const values = await form.validateFields();
      message.success('保存成功');
    } catch (error) {
      console.error(error);
    }
  };

  // 添加新请求
  const handleAddRequest = () => {
    const newRequest: ApiRequest = {
      id: `api-${Date.now()}`,
      name: '新请求',
      method: 'GET',
      url: '',
      headers: {},
      params: {},
      body: '',
      bodyType: 'json',
    };
    setCurrentRequest(newRequest);
    form.setFieldsValue(newRequest);
    setSelectedKeys([newRequest.id]);
  };

  // 添加新文件夹
  const handleAddFolder = () => {
    const newFolder: DataNode = {
      title: '新文件夹',
      key: `folder-${Date.now()}`,
      icon: <FolderOutlined />,
      children: [],
    };
    setTreeData([...treeData, newFolder]);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header 
        className="draggable"
        style={{ 
          background: '#001529', 
          padding: '0 24px', 
          cursor: 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Title 
          level={4} 
          style={{ color: '#fff', margin: 0, pointerEvents: 'none' }}
        >
          🚀 AirPost
        </Title>
        <Space className="no-drag">
          <Select
            value={workspace}
            onChange={setWorkspace}
            style={{ width: 150 }}
            size="small"
          >
            <Option value="default">默认工作区</Option>
            <Option value="workspace1">工作区 1</Option>
            <Option value="workspace2">工作区 2</Option>
          </Select>
        </Space>
      </Header>
      <Layout style={{ height: 'calc(100vh - 64px)' }}>
        <Splitter
          defaultWidth={280}
          minWidth={200}
          maxWidth={600}
          left={
            <div className="no-drag" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                <Space>
                  <Button 
                    type="text" 
                    icon={<PlusOutlined />} 
                    size="small"
                    onClick={handleAddRequest}
                  >
                    新建请求
                  </Button>
                  <Button 
                    type="text" 
                    icon={<FolderOutlined />} 
                    size="small"
                    onClick={handleAddFolder}
                  >
                    新建文件夹
                  </Button>
                </Space>
              </div>
              <div style={{ padding: '8px', overflow: 'auto', flex: 1 }}>
                <Tree
                  showIcon
                  selectedKeys={selectedKeys}
                  treeData={treeData}
                  onSelect={onSelect}
                  blockNode
                />
              </div>
            </div>
          }
          right={
            <Content style={{ background: '#f5f5f5', padding: '24px', height: '100%', overflow: 'auto' }} className="no-drag">
          {currentRequest ? (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '4px', height: '100%' }}>
              <Form form={form} layout="vertical">
                <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
                  <Form.Item name="name" style={{ margin: 0, flex: 1 }}>
                    <Input 
                      placeholder="请求名称" 
                      style={{ fontSize: '18px', fontWeight: 'bold' }}
                    />
                  </Form.Item>
                  <Space>
                    <Button icon={<SaveOutlined />} onClick={handleSaveRequest}>
                      保存
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />} 
                      onClick={handleSendRequest}
                    >
                      发送
                    </Button>
                  </Space>
                </Space>

                <Form.Item name="method" style={{ marginBottom: '16px' }}>
                  <Select style={{ width: 120 }}>
                    <Option value="GET">GET</Option>
                    <Option value="POST">POST</Option>
                    <Option value="PUT">PUT</Option>
                    <Option value="DELETE">DELETE</Option>
                    <Option value="PATCH">PATCH</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="url" style={{ marginBottom: '16px' }}>
                  <Input placeholder="输入请求 URL" />
                </Form.Item>

                <Tabs
                  items={[
                    {
                      key: 'params',
                      label: 'Params',
                      children: (
                        <div>
                          <p style={{ color: '#999', marginBottom: '12px' }}>
                            查询参数将自动添加到 URL
                          </p>
                          <Form.Item name="params">
                            <TextArea 
                              rows={6} 
                              placeholder='{"key": "value"}'
                            />
                          </Form.Item>
                        </div>
                      ),
                    },
                    {
                      key: 'headers',
                      label: 'Headers',
                      children: (
                        <div>
                          <p style={{ color: '#999', marginBottom: '12px' }}>
                            请求头信息
                          </p>
                          <Form.Item name="headers">
                            <TextArea 
                              rows={6} 
                              placeholder='{"Content-Type": "application/json"}'
                            />
                          </Form.Item>
                        </div>
                      ),
                    },
                    {
                      key: 'body',
                      label: 'Body',
                      children: (
                        <div>
                          <Form.Item name="bodyType" style={{ marginBottom: '12px' }}>
                            <Select style={{ width: 200 }}>
                              <Option value="json">JSON</Option>
                              <Option value="form-data">form-data</Option>
                              <Option value="x-www-form-urlencoded">x-www-form-urlencoded</Option>
                              <Option value="raw">raw</Option>
                            </Select>
                          </Form.Item>
                          <Form.Item name="body">
                            <TextArea 
                              rows={12} 
                              placeholder="请求体内容"
                            />
                          </Form.Item>
                        </div>
                      ),
                    },
                  ]}
                />
              </Form>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#999'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>选择一个请求或创建新请求</p>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRequest}>
                  新建请求
                </Button>
              </div>
            </div>
          )}
            </Content>
          }
        />
      </Layout>
    </Layout>
  );
};

export default App;
