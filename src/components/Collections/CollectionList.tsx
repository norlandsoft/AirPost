import React from 'react';
import { Button, Space, message, Tooltip } from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import CollectionTree from './CollectionTree';
import {
  Collection,
  ApiRequest,
} from '../../types';
import {
  addCollection as addCollectionToStorage,
  updateCollection as updateCollectionToStorage,
  deleteCollection as deleteCollectionFromStorage,
  addFolder as addFolderToStorage,
  updateFolder as updateFolderToStorage,
  deleteFolder as deleteFolderFromStorage,
  saveRequestToCollection,
  deleteRequestFromCollection,
  exportCollection,
} from '../../services/storage';
import './CollectionList.css';

interface CollectionListProps {
  collections: Collection[];
  selectedRequestId?: string;
  onSelectRequest: (request: ApiRequest) => void;
  onRequestChange: () => void;
}

const CollectionList: React.FC<CollectionListProps> = ({
  collections,
  selectedRequestId,
  onSelectRequest,
  onRequestChange,
}) => {
  const [localCollections, setLocalCollections] = React.useState<Collection[]>(collections);

  React.useEffect(() => {
    setLocalCollections(collections);
  }, [collections]);

  // 添加 Collection
  const handleAddCollection = (name: string, description?: string) => {
    const newCollection: Collection = {
      id: `collection_${Date.now()}`,
      name,
      description,
      folders: [],
      requests: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addCollectionToStorage(newCollection);
    setLocalCollections([...localCollections, newCollection]);
    message.success('Collection 创建成功');
    onRequestChange();
  };

  // 更新 Collection
  const handleUpdateCollection = (id: string, data: Partial<Collection>) => {
    updateCollectionToStorage(id, data);
    setLocalCollections(localCollections.map(c => 
      c.id === id ? { ...c, ...data, updatedAt: Date.now() } : c
    ));
    message.success('Collection 更新成功');
    onRequestChange();
  };

  // 删除 Collection
  const handleDeleteCollection = (id: string) => {
    deleteCollectionFromStorage(id);
    setLocalCollections(localCollections.filter(c => c.id !== id));
    message.success('Collection 删除成功');
    onRequestChange();
  };

  // 添加文件夹
  const handleAddFolder = (collectionId: string, name: string, description?: string) => {
    addFolderToStorage(collectionId, {
      id: `folder_${Date.now()}`,
      name,
      description,
      folders: [],
      requests: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setLocalCollections(localCollections.map(c => {
      if (c.id === collectionId) {
        return {
          ...c,
          folders: [
            ...c.folders,
            {
              id: `folder_${Date.now()}`,
              name,
              description,
              requests: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }
          ],
          updatedAt: Date.now(),
        };
      }
      return c;
    }));
    message.success('文件夹创建成功');
    onRequestChange();
  };

  // 更新文件夹
  const handleUpdateFolder = (collectionId: string, folderId: string, data: Partial<Collection>) => {
    updateFolderToStorage(collectionId, folderId, data);
    setLocalCollections(localCollections.map(c => {
      if (c.id === collectionId) {
        return {
          ...c,
          folders: c.folders.map(f => 
            f.id === folderId ? { ...f, ...data, updatedAt: Date.now() } : f
          ),
          updatedAt: Date.now(),
        };
      }
      return c;
    }));
    message.success('文件夹更新成功');
    onRequestChange();
  };

  // 删除文件夹
  const handleDeleteFolder = (collectionId: string, folderId: string) => {
    deleteFolderFromStorage(collectionId, folderId);
    setLocalCollections(localCollections.map(c => {
      if (c.id === collectionId) {
        return {
          ...c,
          folders: c.folders.filter(f => f.id !== folderId),
          updatedAt: Date.now(),
        };
      }
      return c;
    }));
    message.success('文件夹删除成功');
    onRequestChange();
  };

  // 添加请求
  const handleAddRequest = (collectionId: string, folderId?: string) => {
    const newRequest: ApiRequest = {
      id: `request_${Date.now()}`,
      name: '新请求',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      bodyType: 'json',
      collectionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveRequestToCollection(newRequest, collectionId);

    setLocalCollections(localCollections.map(c => {
      if (c.id === collectionId) {
        if (folderId) {
          return {
            ...c,
            folders: c.folders.map(f => 
              f.id === folderId 
                ? { ...f, requests: [...f.requests, newRequest], updatedAt: Date.now() }
                : f
            ),
            updatedAt: Date.now(),
          };
        } else {
          return {
            ...c,
            requests: [...c.requests, newRequest],
            updatedAt: Date.now(),
          };
        }
      }
      return c;
    }));

    onSelectRequest(newRequest);
    message.success('请求创建成功');
    onRequestChange();
  };

  // 删除请求
  const handleDeleteRequest = (collectionId: string, folderId: string | undefined, requestId: string) => {
    deleteRequestFromCollection(requestId, collectionId);
    setLocalCollections(localCollections.map(c => {
      if (c.id === collectionId) {
        if (folderId) {
          return {
            ...c,
            folders: c.folders.map(f => 
              f.id === folderId 
                ? { ...f, requests: f.requests.filter(r => r.id !== requestId) }
                : f
            ),
            updatedAt: Date.now(),
          };
        } else {
          return {
            ...c,
            requests: c.requests.filter(r => r.id !== requestId),
            updatedAt: Date.now(),
          };
        }
      }
      return c;
    }));
    message.success('请求删除成功');
    onRequestChange();
  };

  // 移动请求
  const handleMoveRequest = (
    requestId: string,
    fromCollectionId: string,
    fromFolderId: string | undefined,
    toCollectionId: string,
    toFolderId: string | undefined
  ) => {
    // 获取请求
    let request: ApiRequest | undefined;
    let fromCollection = localCollections.find(c => c.id === fromCollectionId);
    if (fromCollection) {
      if (fromFolderId) {
        const folder = fromCollection.folders.find(f => f.id === fromFolderId);
        request = folder?.requests.find(r => r.id === requestId);
      } else {
        request = fromCollection.requests.find(r => r.id === requestId);
      }
    }

    if (!request) return;

    // 从原位置删除
    handleDeleteRequest(fromCollectionId, fromFolderId, requestId);

    // 保存到新位置
    request.collectionId = toCollectionId;
    saveRequestToCollection(request, toCollectionId);

    // 更新本地状态
    setLocalCollections(localCollections.map(c => {
      if (c.id === toCollectionId) {
        if (toFolderId) {
          return {
            ...c,
            folders: c.folders.map(f => 
              f.id === toFolderId 
                ? { ...f, requests: [...f.requests, request!], updatedAt: Date.now() }
                : f
            ),
            updatedAt: Date.now(),
          };
        } else {
          return {
            ...c,
            requests: [...c.requests, request!],
            updatedAt: Date.now(),
          };
        }
      }
      return c;
    }));

    message.success('请求移动成功');
    onRequestChange();
  };

  // 导出 Collection
  const handleExport = (collectionId: string) => {
    const json = exportCollection(collectionId);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collection_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Collection 导出成功');
    }
  };

  // 导入 Collection
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string;
            const importedCollection = JSON.parse(json) as Collection;
            
            // 生成新 ID
            importedCollection.id = `collection_${Date.now()}`;
            importedCollection.createdAt = Date.now();
            importedCollection.updatedAt = Date.now();

            // 处理嵌套的 folders 和 requests
            const processItem = (item: any) => {
              item.id = item.id || `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              item.createdAt = item.createdAt || Date.now();
              item.updatedAt = Date.now();
              if (item.folders) {
                item.folders.forEach(processItem);
              }
              if (item.requests) {
                item.requests.forEach(processItem);
              }
            };
            processItem(importedCollection);

            addCollectionToStorage(importedCollection);
            setLocalCollections([...localCollections, importedCollection]);
            message.success('Collection 导入成功');
            onRequestChange();
          } catch (error) {
            message.error('导入失败，文件格式错误');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="collection-list">
      <div className="collection-list-header">
        <Space>
          <Tooltip title="新建 Collection">
            <Button 
              type="text" 
              icon={<PlusOutlined />} 
              size="small"
              onClick={() => {
                // 触发新建
                const event = new CustomEvent('addCollection');
                window.dispatchEvent(event);
              }}
            />
          </Tooltip>
          <Tooltip title="导入">
            <Button 
              type="text" 
              icon={<UploadOutlined />} 
              size="small"
              onClick={handleImport}
            />
          </Tooltip>
        </Space>
      </div>

      <div className="collection-list-content">
        <CollectionTree
          collections={localCollections}
          selectedRequestId={selectedRequestId}
          onSelectRequest={onSelectRequest}
          onAddCollection={handleAddCollection}
          onUpdateCollection={handleUpdateCollection}
          onDeleteCollection={handleDeleteCollection}
          onAddFolder={handleAddFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onAddRequest={handleAddRequest}
          onDeleteRequest={handleDeleteRequest}
          onMoveRequest={handleMoveRequest}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default CollectionList;
