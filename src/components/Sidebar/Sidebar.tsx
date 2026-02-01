import React, { useState } from 'react';
import { Tabs, Button, Space, Tooltip, Dropdown, Badge } from 'antd';
import {
  FolderOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  PlusOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import CollectionList from '../Collections/CollectionList';
import { HistoryList } from '../History';
import { EnvironmentPanel } from '../Environment';
import { Collection, ApiRequest } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  collections: Collection[];
  selectedRequestId?: string;
  onSelectRequest: (request: ApiRequest) => void;
  onRequestChange: () => void;
  onAddCollection: () => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentTheme: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({
  collections,
  selectedRequestId,
  onSelectRequest,
  onRequestChange,
  onAddCollection,
  onThemeChange,
  currentTheme,
}) => {
  const [activeTab, setActiveTab] = useState('collections');

  const tabItems = [
    {
      key: 'collections',
      label: (
        <Tooltip title="Collections" placement="right">
          <Badge count={collections.length} size="small">
            <FolderOutlined />
          </Badge>
        </Tooltip>
      ),
      children: (
        <div className="sidebar-content">
          <div className="sidebar-header">
            <span>Collections</span>
            <Space>
              <Tooltip title="新建 Collection">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={onAddCollection}
                />
              </Tooltip>
            </Space>
          </div>
          <div className="sidebar-scroll">
            <CollectionList
              collections={collections}
              selectedRequestId={selectedRequestId}
              onSelectRequest={onSelectRequest}
              onRequestChange={onRequestChange}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'history',
      label: (
        <Tooltip title="历史记录" placement="right">
          <HistoryOutlined />
        </Tooltip>
      ),
      children: (
        <div className="sidebar-content">
          <div className="sidebar-header">
            <span>历史记录</span>
          </div>
          <div className="sidebar-scroll">
            <HistoryList
              onSelectRequest={onSelectRequest}
              onRequestChange={onRequestChange}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'environments',
      label: (
        <Tooltip title="环境变量" placement="right">
          <EnvironmentOutlined />
        </Tooltip>
      ),
      children: (
        <div className="sidebar-content">
          <div className="sidebar-header">
            <span>环境变量</span>
          </div>
          <div className="sidebar-scroll">
            <EnvironmentPanel onVariableChange={onRequestChange} />
          </div>
        </div>
      ),
    },
  ];

  const moreItems = [
    {
      key: 'theme',
      label: '切换主题',
      icon: currentTheme === 'light' ? <MoonOutlined /> : <SunOutlined />,
      onClick: () => onThemeChange(currentTheme === 'light' ? 'dark' : 'light'),
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />,
    },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          tabPosition="left"
          size="small"
        />
      </div>
      <div className="sidebar-more">
        <Dropdown menu={{ items: moreItems }} trigger={['click']}>
          <Button type="text" icon={<SettingOutlined />} size="small" />
        </Dropdown>
      </div>
    </div>
  );
};

export default Sidebar;
