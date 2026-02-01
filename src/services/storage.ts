import { 
  StorageData, 
  Collection, 
  Folder,
  Environment, 
  HistoryItem, 
  ApiRequest,
  AppSettings 
} from '../types';

// 存储键名
const STORAGE_KEYS = {
  DATA: 'airpost_data',
  SETTINGS: 'airpost_settings',
};

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  requestTimeout: 30000,
  followRedirects: true,
  encodeUrl: true,
  showNetworkLog: false,
};

// 默认数据
const DEFAULT_DATA: StorageData = {
  collections: [],
  environments: [],
  history: [],
  activeEnvironmentId: undefined,
  settings: DEFAULT_SETTINGS,
};

/**
 * 获取存储数据
 */
export function getStorageData(): StorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DATA);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取存储数据失败:', error);
  }
  return { ...DEFAULT_DATA };
}

/**
 * 保存存储数据
 */
export function saveStorageData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
  } catch (error) {
    console.error('保存存储数据失败:', error);
  }
}

/**
 * 获取设置
 */
export function getSettings(): AppSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取设置失败:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * 保存设置
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
}

// ============ Collections 操作 ============

/**
 * 获取所有 Collections
 */
export function getCollections(): Collection[] {
  return getStorageData().collections;
}

/**
 * 保存 Collections
 */
export function saveCollections(collections: Collection[]): void {
  const data = getStorageData();
  data.collections = collections;
  saveStorageData(data);
}

/**
 * 添加 Collection
 */
export function addCollection(collection: Collection): void {
  const collections = getCollections();
  collections.push(collection);
  saveCollections(collections);
}

/**
 * 更新 Collection
 */
export function updateCollection(id: string, updates: Partial<Collection>): void {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === id);
  if (index !== -1) {
    collections[index] = { ...collections[index], ...updates, updatedAt: Date.now() };
    saveCollections(collections);
  }
}

/**
 * 删除 Collection
 */
export function deleteCollection(id: string): void {
  let collections = getCollections();
  collections = collections.filter(c => c.id !== id);
  saveCollections(collections);
}

/**
 * 获取 Collection 树（包含嵌套）
 */
export function getCollectionTree(): Collection[] {
  return getCollections();
}

/**
 * 添加文件夹到 Collection
 */
export function addFolder(collectionId: string, folder: Collection): void {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === collectionId);
  if (index !== -1) {
    collections[index].folders.push(folder);
    collections[index].updatedAt = Date.now();
    saveCollections(collections);
  }
}

/**
 * 更新 Collection 内的文件夹
 */
export function updateFolder(collectionId: string, folderId: string, updates: Partial<Collection>): void {
  const collections = getCollections();
  const collectionIndex = collections.findIndex(c => c.id === collectionId);
  if (collectionIndex !== -1) {
    const folderIndex = collections[collectionIndex].folders.findIndex(f => f.id === folderId);
    if (folderIndex !== -1) {
      collections[collectionIndex].folders[folderIndex] = {
        ...collections[collectionIndex].folders[folderIndex],
        ...updates,
        updatedAt: Date.now(),
      };
      collections[collectionIndex].updatedAt = Date.now();
      saveCollections(collections);
    }
  }
}

/**
 * 从 Collection 中删除文件夹
 */
export function deleteFolder(collectionId: string, folderId: string): void {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === collectionId);
  if (index !== -1) {
    collections[index].folders = collections[index].folders.filter(f => f.id !== folderId);
    collections[index].updatedAt = Date.now();
    saveCollections(collections);
  }
}

// ============ Environments 操作 ============

/**
 * 获取所有 Environments
 */
export function getEnvironments(): Environment[] {
  return getStorageData().environments;
}

/**
 * 保存 Environments
 */
export function saveEnvironments(environments: Environment[]): void {
  const data = getStorageData();
  data.environments = environments;
  saveStorageData(data);
}

/**
 * 添加 Environment
 */
export function addEnvironment(environment: Environment): void {
  const environments = getEnvironments();
  environments.push(environment);
  saveEnvironments(environments);
}

/**
 * 更新 Environment
 */
export function updateEnvironment(id: string, updates: Partial<Environment>): void {
  const environments = getEnvironments();
  const index = environments.findIndex(e => e.id === id);
  if (index !== -1) {
    environments[index] = { ...environments[index], ...updates, updatedAt: Date.now() };
    saveEnvironments(environments);
  }
}

/**
 * 删除 Environment
 */
export function deleteEnvironment(id: string): void {
  let environments = getEnvironments();
  environments = environments.filter(e => e.id !== id);
  saveEnvironments(environments);
}

/**
 * 获取当前激活的 Environment
 */
export function getActiveEnvironment(): Environment | undefined {
  const data = getStorageData();
  if (data.activeEnvironmentId) {
    return getEnvironments().find(e => e.id === data.activeEnvironmentId);
  }
  return undefined;
}

/**
 * 设置激活的 Environment
 */
export function setActiveEnvironment(id: string | undefined): void {
  const data = getStorageData();
  data.activeEnvironmentId = id;
  saveStorageData(data);
}

/**
 * 获取环境变量映射
 */
export function getEnvironmentVariables(): Record<string, string> {
  const environment = getActiveEnvironment();
  if (!environment) {
    return {};
  }
  
  const variables: Record<string, string> = {};
  environment.values
    .filter(v => v.enabled && v.key)
    .forEach(v => {
      variables[v.key] = v.value;
    });
  
  return variables;
}

// ============ History 操作 ============

/**
 * 获取历史记录
 */
export function getHistory(): HistoryItem[] {
  return getStorageData().history;
}

/**
 * 保存历史记录
 */
export function saveHistory(history: HistoryItem[]): void {
  const data = getStorageData();
  data.history = history;
  saveStorageData(data);
}

/**
 * 添加历史记录
 */
export function addHistoryItem(item: HistoryItem): void {
  const history = getHistory();
  history.unshift(item);
  // 保留最近 100 条记录
  if (history.length > 100) {
    history.splice(100);
  }
  saveHistory(history);
}

/**
 * 清空历史记录
 */
export function clearHistory(): void {
  saveHistory([]);
}

/**
 * 删除单条历史记录
 */
export function deleteHistoryItem(id: string): void {
  let history = getHistory();
  history = history.filter(h => h.id !== id);
  saveHistory(history);
}

// ============ Requests 操作 ============

/**
 * 保存请求到 Collection
 */
export function saveRequestToCollection(request: ApiRequest, collectionId: string): void {
  const collections = getCollections();
  
  const findAndAddRequest = (items: (Collection | Folder)[]): boolean => {
    for (const item of items) {
      if ('folders' in item) {
        // 这是一个 Collection
        if (item.id === collectionId) {
          const existingIndex = item.requests.findIndex(r => r.id === request.id);
          if (existingIndex !== -1) {
            item.requests[existingIndex] = request;
          } else {
            item.requests.push(request);
          }
          saveCollections(collections);
          return true;
        }
        if (item.folders.length > 0) {
          if (findAndAddRequest(item.folders)) {
            return true;
          }
        }
      } else {
        // 这是一个 Folder
        if (item.id === collectionId) {
          const existingIndex = item.requests.findIndex(r => r.id === request.id);
          if (existingIndex !== -1) {
            item.requests[existingIndex] = request;
          } else {
            item.requests.push(request);
          }
          saveCollections(collections);
          return true;
        }
      }
    }
    return false;
  };
  
  findAndAddRequest(collections);
}

/**
 * 从 Collection 中删除请求
 */
export function deleteRequestFromCollection(requestId: string, collectionId: string): void {
  const collections = getCollections();
  
  const findAndDeleteRequest = (items: (Collection | Folder)[]): boolean => {
    for (const item of items) {
      if ('folders' in item) {
        // 这是一个 Collection
        if (item.id === collectionId) {
          item.requests = item.requests.filter(r => r.id !== requestId);
          saveCollections(collections);
          return true;
        }
        if (item.folders.length > 0) {
          if (findAndDeleteRequest(item.folders)) {
            return true;
          }
        }
      } else {
        // 这是一个 Folder
        if (item.id === collectionId) {
          item.requests = item.requests.filter(r => r.id !== requestId);
          saveCollections(collections);
          return true;
        }
      }
    }
    return false;
  };
  
  findAndDeleteRequest(collections);
}

/**
 * 获取所有请求
 */
export function getAllRequests(): ApiRequest[] {
  const collections = getCollections();
  const requests: ApiRequest[] = [];
  
  const collectRequests = (items: (Collection | Folder)[]) => {
    for (const item of items) {
      requests.push(...item.requests);
      if ('folders' in item && item.folders.length > 0) {
        collectRequests(item.folders);
      }
    }
  };
  
  collectRequests(collections);
  return requests;
}

// ============ 导入/导出 ============

/**
 * 导出所有数据
 */
export function exportData(): string {
  const data = getStorageData();
  return JSON.stringify(data, null, 2);
}

/**
 * 导入数据
 */
export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as StorageData;
    
    // 验证数据结构
    if (!Array.isArray(data.collections)) {
      data.collections = [];
    }
    if (!Array.isArray(data.environments)) {
      data.environments = [];
    }
    if (!Array.isArray(data.history)) {
      data.history = [];
    }
    if (!data.settings) {
      data.settings = DEFAULT_SETTINGS;
    }
    
    saveStorageData(data);
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
}

/**
 * 导出 Collection
 */
export function exportCollection(collectionId: string): string | null {
  const collections = getCollections();
  
  const findCollection = (items: (Collection | Folder)[]): Collection | null => {
    for (const item of items) {
      if ('folders' in item && item.id === collectionId) {
        return item as Collection;
      }
      if ('folders' in item && item.folders.length > 0) {
        const found = findCollection(item.folders);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };
  
  const collection = findCollection(collections);
  if (collection) {
    return JSON.stringify(collection, null, 2);
  }
  return null;
}
