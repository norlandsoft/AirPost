import { contextBridge, ipcRenderer } from 'electron';

// 暴露受保护的方法给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息
  getPlatform: () => process.platform,
  
  // 版本信息
  getVersions: () => ({
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  }),

  // 数据库操作
  db: {
    getAllPosts: () => ipcRenderer.invoke('db:getAllPosts'),
    getPostById: (id: number) => ipcRenderer.invoke('db:getPostById', id),
    createPost: (title: string, content: string) => 
      ipcRenderer.invoke('db:createPost', title, content),
    updatePost: (id: number, title: string, content: string) => 
      ipcRenderer.invoke('db:updatePost', id, title, content),
    deletePost: (id: number) => ipcRenderer.invoke('db:deletePost', id),
  },
});

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      getPlatform: () => string;
      getVersions: () => {
        node: string;
        chrome: string;
        electron: string;
      };
      db: {
        getAllPosts: () => Promise<any[]>;
        getPostById: (id: number) => Promise<any>;
        createPost: (title: string, content: string) => Promise<any>;
        updatePost: (id: number, title: string, content: string) => Promise<boolean>;
        deletePost: (id: number) => Promise<boolean>;
      };
    };
  }
}
