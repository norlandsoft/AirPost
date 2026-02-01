import React from 'react';
import { Tree, Button, Dropdown, Modal, Empty } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import CollectionModal from './CollectionModal';
import FolderModal from './FolderModal';
import { Collection, ApiRequest } from '../../types';
import './CollectionTree.css';

interface CollectionTreeProps {
  collections: Collection[];
  selectedRequestId?: string;
  onSelectRequest: (request: ApiRequest) => void;
  onAddCollection: (name: string, description?: string) => void;
  onUpdateCollection: (id: string, data: Partial<Collection>) => void;
  onDeleteCollection: (id: string) => void;
  onAddFolder: (collectionId: string, name: string, description?: string) => void;
  onUpdateFolder: (collectionId: string, folderId: string, data: Partial<Collection>) => void;
  onDeleteFolder: (collectionId: string, folderId: string) => void;
  onAddRequest: (collectionId: string, folderId?: string) => void;
  onDeleteRequest: (collectionId: string, folderId: string | undefined, requestId: string) => void;
  onMoveRequest: (requestId: string, fromCollectionId: string, fromFolderId: string | undefined, toCollectionId: string, toFolderId: string | undefined) => void;
  onExport: (collectionId: string) => void;
}

interface TreeNode extends DataNode {
  type: 'collection' | 'folder' | 'request';
  data: Collection | ApiRequest;
  collectionId?: string;
  folderId?: string;
}

const CollectionTree: React.FC<CollectionTreeProps> = ({
  collections,
  selectedRequestId,
  onSelectRequest,
  onAddCollection,
  onUpdateCollection,
  onDeleteCollection,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder,
  onAddRequest,
  onDeleteRequest,
  onMoveRequest,
  onExport,
}) => {
  const [selectedKeys, setSelectedKeys] = React.useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([]);
  const [collectionModalOpen, setCollectionModalOpen] = React.useState(false);
  const [editingCollection, setEditingCollection] = React.useState<Collection | null>(null);
  const [folderModalOpen, setFolderModalOpen] = React.useState(false);
  const [editingFolder, setEditingFolder] = React.useState<{ collectionId: string; folder: Collection } | null>(null);
  const [dropdownNode, setDropdownNode] = React.useState<TreeNode | null>(null);

  // 构建树数据
  const buildTreeData = (collections: Collection[]): TreeNode[] => {
    return collections.map((collection) => ({
      key: collection.id,
      title: collection.name,
      icon: <FolderOutlined />,
      type: 'collection' as const,
      data: collection,
      collectionId: collection.id,
      children: [
        ...collection.folders.map((folder) => ({
          key: folder.id,
          title: folder.name,
          icon: <FolderOpenOutlined />,
          type: 'folder' as const,
          data: folder,
          collectionId: collection.id,
          folderId: folder.id,
          children: folder.requests.map((request) => ({
            key: request.id,
            title: request.name,
            icon: <FileOutlined style={{ 
              color: request.method === 'GET' ? '#52c41a' : 
                     request.method === 'POST' ? '#1890ff' : 
                     request.method === 'DELETE' ? '#ff4d4f' : 
                     request.method === 'PUT' ? '#faad14' : '#722ed1'
            }} />,
            isLeaf: true,
            type: 'request' as const,
            data: request,
            collectionId: collection.id,
            folderId: folder.id,
          })),
        })),
        ...collection.requests.map((request) => ({
          key: request.id,
          title: request.name,
          icon: <FileOutlined style={{ 
            color: request.method === 'GET' ? '#52c41a' : 
                   request.method === 'POST' ? '#1890ff' : 
                   request.method === 'DELETE' ? '#ff4d4f' : 
                   request.method === 'PUT' ? '#faad14' : '#722ed1'
          }} />,
          isLeaf: true,
          type: 'request' as const,
          data: request,
          collectionId: collection.id,
        })),
      ],
    }));
  };

  const treeData = React.useMemo(() => buildTreeData(collections), [collections]);

  // 选中节点
  const handleSelect = (selectedKeys: React.Key[], info: { node: TreeNode }) => {
    setSelectedKeys(selectedKeys);
    const node = info.node;
    
    if (node.type === 'request') {
      onSelectRequest(node.data as ApiRequest);
    }
  };

  // 展开节点
  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  // 右键菜单
  const handleRightClick = (info: { node: TreeNode }) => {
    setDropdownNode(info.node);
  };

  // 获取操作菜单项
  const getMenuItems = (node: TreeNode) => {
    const items: any[] = [];

    if (node.type === 'collection') {
      items.push(
        { key: 'addRequest', label: '添加请求', icon: <PlusOutlined /> },
        { key: 'addFolder', label: '添加文件夹', icon: <FolderOutlined /> },
        { type: 'divider' as const },
        { key: 'edit', label: '编辑', icon: <EditOutlined /> },
        { key: 'export', label: '导出', icon: <ExportOutlined /> },
        { type: 'divider' as const },
        { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
      );
    } else if (node.type === 'folder') {
      items.push(
        { key: 'addRequest', label: '添加请求', icon: <PlusOutlined /> },
        { type: 'divider' as const },
        { key: 'edit', label: '编辑', icon: <EditOutlined /> },
        { type: 'divider' as const },
        { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
      );
    } else if (node.type === 'request') {
      items.push(
        { key: 'edit', label: '编辑', icon: <EditOutlined /> },
        { type: 'divider' as const },
        { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
      );
    }

    return items;
  };

  // 处理菜单点击
  const handleMenuClick = (key: string) => {
    if (!dropdownNode) return;

    switch (key) {
      case 'addRequest':
        if (dropdownNode.type === 'collection') {
          onAddRequest(dropdownNode.collectionId!);
        } else if (dropdownNode.type === 'folder') {
          onAddRequest(dropdownNode.collectionId!, dropdownNode.folderId);
        }
        break;
      case 'addFolder':
        if (dropdownNode.type === 'collection') {
          setEditingFolder({ collectionId: dropdownNode.collectionId!, folder: null as any });
          setFolderModalOpen(true);
        }
        break;
      case 'edit':
        if (dropdownNode.type === 'collection') {
          setEditingCollection(dropdownNode.data as Collection);
          setCollectionModalOpen(true);
        } else if (dropdownNode.type === 'folder') {
          setEditingFolder({ 
            collectionId: dropdownNode.collectionId!, 
            folder: dropdownNode.data as Collection 
          });
          setFolderModalOpen(true);
        }
        break;
      case 'export':
        if (dropdownNode.type === 'collection') {
          onExport(dropdownNode.collectionId!);
        }
        break;
      case 'delete':
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除 "${dropdownNode.title}" 吗？`,
          okText: '删除',
          okType: 'danger',
          onOk: () => {
            if (dropdownNode!.type === 'collection') {
              onDeleteCollection(dropdownNode!.collectionId!);
            } else if (dropdownNode!.type === 'folder') {
              onDeleteFolder(dropdownNode!.collectionId!, dropdownNode!.folderId!);
            } else if (dropdownNode!.type === 'request') {
              onDeleteRequest(
                dropdownNode!.collectionId!, 
                dropdownNode!.folderId, 
                dropdownNode!.key as string
              );
            }
          },
        });
        break;
    }

    setDropdownNode(null);
  };

  // 拖拽相关
  const handleDragStart = (info: any) => {
    console.log('drag start:', info);
  };

  const handleDrop = (info: any) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropType = info.node.type;
    const dragType = info.dragNode.type;

    // 只允许将请求拖拽到文件夹或 Collection
    if (dragType !== 'request' || (dropType !== 'folder' && dropType !== 'collection')) {
      return;
    }

    const toCollectionId = info.node.collectionId!;
    const toFolderId = dropType === 'folder' ? info.node.folderId : undefined;

    const fromCollectionId = info.dragNode.collectionId!;
    const fromFolderId = info.dragNode.folderId;

    onMoveRequest(dragKey, fromCollectionId, fromFolderId, toCollectionId, toFolderId);
  };

  // 新建 Collection
  const handleAddCollection = () => {
    setEditingCollection(null);
    setCollectionModalOpen(true);
  };

  return (
    <div className="collection-tree">
      {collections.length > 0 ? (
        <Tree
          showIcon
          selectedKeys={selectedRequestId ? [selectedRequestId] : selectedKeys}
          expandedKeys={expandedKeys}
          treeData={treeData}
          onSelect={handleSelect}
          onExpand={handleExpand}
          onRightClick={handleRightClick}
          draggable
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          blockNode
          height={300}
        />
      ) : (
        <Empty description="暂无 Collections" style={{ padding: '40px 0' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCollection}>
            创建 Collection
          </Button>
        </Empty>
      )}

      {/* 右键菜单 */}
      <Dropdown
        menu={{ 
          items: dropdownNode ? getMenuItems(dropdownNode) : [],
          onClick: ({ key }) => handleMenuClick(key),
        }}
        trigger={['contextMenu']}
        open={dropdownNode ? true : false}
        onOpenChange={(open) => !open && setDropdownNode(null)}
      >
        <div style={{ position: 'absolute', left: -9999 }} />
      </Dropdown>

      {/* Collection Modal */}
      <CollectionModal
        open={collectionModalOpen}
        collection={editingCollection}
        onCancel={() => {
          setCollectionModalOpen(false);
          setEditingCollection(null);
        }}
        onOk={(data) => {
          if (editingCollection) {
            onUpdateCollection(editingCollection.id, data);
          } else {
            onAddCollection(data.name, data.description);
          }
          setCollectionModalOpen(false);
          setEditingCollection(null);
        }}
      />

      {/* Folder Modal */}
      <FolderModal
        open={folderModalOpen}
        folder={editingFolder?.folder}
        onCancel={() => {
          setFolderModalOpen(false);
          setEditingFolder(null);
        }}
        onOk={(data) => {
          if (editingFolder?.folder) {
            onUpdateFolder(editingFolder.collectionId, editingFolder.folder.id, data);
          } else {
            onAddFolder(editingFolder!.collectionId, data.name, data.description);
          }
          setFolderModalOpen(false);
          setEditingFolder(null);
        }}
      />
    </div>
  );
};

export default CollectionTree;
