import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from './components/Layout/MainLayout';
import { ApiRequest, ApiResponse, Collection } from './types';
import { getSettings, getCollections, addCollection as addCollectionToStorage } from './services/storage';
import './styles/variables.css';
import './styles/theme.css';
import './styles/components.css';
import './App.css';

// 临时类型定义，避免类型不匹配问题
interface TempSettings {
  theme: string;
  requestTimeout: number;
  followRedirects: boolean;
  encodeUrl: boolean;
  showNetworkLog: boolean;
}

const App: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const rawSettings = getSettings() as TempSettings;
  const [isDark, setIsDark] = useState<boolean>(rawSettings.theme === 'dark');

  // 加载数据
  useEffect(() => {
    loadCollections();
  }, []);

  // 主题切换
  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);
    // 直接保存到 localStorage 避免类型问题
    localStorage.setItem('airpost_settings', JSON.stringify({
      ...rawSettings,
      theme: !isDark ? 'dark' : 'light',
    }));
  }, [isDark, rawSettings]);

  const loadCollections = () => {
    setCollections(getCollections());
  };

  // 选择请求
  const handleSelectRequest = (request: ApiRequest) => {
    setSelectedRequest(request);
    setResponse(null);
  };

  // 请求保存回调
  const handleRequestSave = (request: ApiRequest) => {
    // 如果请求属于某个 Collection，更新它
    if (request.collectionId) {
      // 重新加载 collections
      loadCollections();
    }
  };

  // 请求响应回调
  const handleResponse = (resp: ApiResponse) => {
    setResponse(resp);
  };

  // 添加新 Collection
  const handleAddCollection = () => {
    const name = `New Collection ${collections.length + 1}`;
    const newCollection: Collection = {
      id: `collection_${Date.now()}`,
      name,
      folders: [],
      requests: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addCollectionToStorage(newCollection);
    loadCollections();
  };

  // 刷新请求列表
  const handleRequestChange = () => {
    loadCollections();
  };

  return (
    <MainLayout
      collections={collections}
      selectedRequest={selectedRequest}
      response={response}
      isDark={isDark}
      onSelectRequest={handleSelectRequest}
      onRequestSave={handleRequestSave}
      onResponse={handleResponse}
      onAddCollection={handleAddCollection}
      onRequestChange={handleRequestChange}
      onToggleTheme={toggleTheme}
    />
  );
};

export default App;
