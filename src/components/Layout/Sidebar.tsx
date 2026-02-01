import React, { useState } from 'react';
import { Button, Space, Tooltip, Dropdown, Badge, Input } from 'antd';
import {
  FolderOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  PlusOutlined,
  SearchOutlined,
  FolderOpenOutlined,
  RocketOutlined,
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
}

type TabKey = 'collections' | 'history' | 'environments';

interface NavItem {
  key: TabKey;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  collections,
  selectedRequestId,
  onSelectRequest,
  onRequestChange,
  onAddCollection,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('collections');

  const navItems: NavItem[] = [
    {
      key: 'collections',
      icon: <FolderOutlined />,
      label: 'Collections',
      count: collections.length,
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'History',
    },
    {
      key: 'environments',
      icon: <EnvironmentOutlined />,
      label: 'Environments',
    },
  ];

  const moreItems = [
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'collections':
        return (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">Collections</span>
              <Tooltip title="New Collection">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={onAddCollection}
                  className="sidebar-section-action"
                />
              </Tooltip>
            </div>
            <CollectionList
              collections={collections}
              selectedRequestId={selectedRequestId}
              onSelectRequest={onSelectRequest}
              onRequestChange={onRequestChange}
            />
          </div>
        );
      case 'history':
        return (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">History</span>
            </div>
            <HistoryList
              onSelectRequest={onSelectRequest}
              onRequestChange={onRequestChange}
            />
          </div>
        );
      case 'environments':
        return (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">Environments</span>
            </div>
            <EnvironmentPanel onVariableChange={onRequestChange} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sidebar-container">
      {/* Navigation Tabs */}
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.key}
            className={`sidebar-nav-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => setActiveTab(item.key)}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
            {item.count !== undefined && (
              <Badge
                count={item.count}
                size="small"
                className="sidebar-badge"
              />
            )}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          size="small"
          allowClear
        />
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <Dropdown menu={{ items: moreItems }} trigger={['click']} placement="topLeft">
          <Button type="text" icon={<SettingOutlined />} className="sidebar-footer-btn">
            Settings
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default Sidebar;
