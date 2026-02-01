import React from 'react';
import { Layout, Button, Space, Typography, message, ConfigProvider, theme } from 'antd';
import {
  FolderOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  PlusOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import Sidebar from './Sidebar';
import RequestPanel from '../RequestPanel/RequestPanel';
import ResponsePanel from '../ResponsePanel/ResponsePanel';
import Splitter from '../Splitter';
import { ApiRequest, ApiResponse, Collection, AppSettings } from '../../types';
import { getSettings, saveSettings, getCollections, addCollection as addCollectionToStorage } from '../../services/storage';
import './MainLayout.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface MainLayoutProps {
  collections: Collection[];
  selectedRequest: ApiRequest | null;
  response: ApiResponse | null;
  isDark: boolean;
  onSelectRequest: (request: ApiRequest) => void;
  onRequestSave: (request: ApiRequest) => void;
  onResponse: (response: ApiResponse) => void;
  onAddCollection: () => void;
  onRequestChange: () => void;
  onToggleTheme: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  collections,
  selectedRequest,
  response,
  isDark,
  onSelectRequest,
  onRequestSave,
  onResponse,
  onAddCollection,
  onRequestChange,
  onToggleTheme,
}) => {
  const [settings] = React.useState<AppSettings>(getSettings());

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <Layout className="main-layout">
        <Header className="main-header">
          <div className="app-header">
            <div className="app-logo">
              <span className="app-logo-icon">🚀</span>
              <Title level={4} style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                AirPost
              </Title>
            </div>
          </div>
          
          <div className="app-actions">
            <div className="theme-toggle" onClick={onToggleTheme}>
              {isDark ? (
                <>
                  <SunOutlined />
                  <Text style={{ fontSize: 13 }}>浅色模式</Text>
                </>
              ) : (
                <>
                  <MoonOutlined />
                  <Text style={{ fontSize: 13 }}>深色模式</Text>
                </>
              )}
            </div>
          </div>
        </Header>
        
        <Content className="main-content">
          <Sidebar
            collections={collections}
            selectedRequestId={selectedRequest?.id}
            onSelectRequest={onSelectRequest}
            onRequestChange={onRequestChange}
            onAddCollection={onAddCollection}
          />
          
          <Splitter
            defaultWidth={500}
            minWidth={300}
            maxWidth={800}
            left={
              <RequestPanel
                request={selectedRequest}
                onSave={onRequestSave}
                onResponse={onResponse}
              />
            }
            right={
              <ResponsePanel response={response} />
            }
          />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
