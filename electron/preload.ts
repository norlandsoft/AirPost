import { contextBridge } from 'electron';

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
    };
  }
}
