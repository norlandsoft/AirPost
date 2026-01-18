import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'path';

// 判断是否为开发模式
// 在开发模式下，应用未打包，且通常有 NODE_ENV=development 或 --dev 参数
const isDev = !app.isPackaged || 
  process.env.NODE_ENV === 'development' || 
  process.argv.includes('--dev');

// 保持对窗口对象的全局引用
let mainWindow: BrowserWindow | null = null;

// 创建窗口
function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');
  console.log('创建窗口，preload 路径:', preloadPath);
  
  // 检查 preload 文件是否存在
  const fs = require('fs');
  if (!fs.existsSync(preloadPath)) {
    console.warn('警告：preload 文件不存在:', preloadPath);
  }
  
  // 获取图标（开发模式下根据平台选择对应格式）
  let icon: Electron.NativeImage | undefined = undefined;
  if (isDev) {
    try {
      // 使用 process.cwd() 获取项目根目录，更可靠
      const iconBasePath = path.resolve(process.cwd(), 'assets');
      const fs = require('fs');
      
      // 尝试加载图标的辅助函数
      const tryLoadIcon = (iconPath: string): Electron.NativeImage | undefined => {
        const absolutePath = path.resolve(iconPath);
        if (fs.existsSync(absolutePath)) {
          const loadedIcon = nativeImage.createFromPath(absolutePath);
          if (!loadedIcon.isEmpty()) {
            return loadedIcon;
          }
        }
        return undefined;
      };
      
      // 根据平台加载图标，使用 PNG 作为通用格式
      if (process.platform === 'win32') {
        // Windows: 先尝试 .ico，失败则使用 .png
        icon = tryLoadIcon(path.join(iconBasePath, 'icon.ico'));
        if (!icon) {
          icon = tryLoadIcon(path.join(iconBasePath, 'icon.png'));
        }
      } else {
        // macOS、Linux 和其他平台使用 .png
        icon = tryLoadIcon(path.join(iconBasePath, 'icon.png'));
      }
      
      if (icon) {
        console.log('图标加载成功');
      } else {
        console.warn('所有图标格式加载失败');
      }
    } catch (error) {
      console.error('加载图标时出错:', error);
    }
  }
  
  try {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: true, // 确保窗口显示
      title: 'AirPost', // 设置窗口标题
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath,
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      icon: icon,
    });
    
    console.log('窗口已创建');
    
    // 确保窗口显示
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      // 确保标题始终为 AirPost
      mainWindow.setTitle('AirPost');
      
      // 监听页面标题变化，阻止页面标题覆盖窗口标题
      mainWindow.webContents.on('page-title-updated', (event) => {
        event.preventDefault(); // 阻止默认行为
        if (mainWindow) {
          mainWindow.setTitle('AirPost');
        }
      });
    }
  } catch (error) {
    console.error('创建窗口时出错:', error);
    throw error;
  }

  if (isDev) {
    // 开发模式：加载 Vite 开发服务器
    console.log('开发模式：加载 Vite 开发服务器 http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    // DevTools 已关闭，如需调试请手动按 Cmd+Option+I (macOS) 或 Ctrl+Shift+I (Windows/Linux)
  } else {
    // 生产模式：加载构建后的文件
    // 在打包后的应用中，资源文件在 app.asar 中
    const indexPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html')
      : path.join(__dirname, '..', 'dist', 'index.html');
    
    // 检查文件是否存在
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      console.log('生产模式：加载文件', indexPath);
      mainWindow.loadFile(indexPath);
    } else {
      console.warn('生产模式文件不存在，降级到开发服务器:', indexPath);
      // 如果文件不存在，尝试加载开发服务器（降级处理）
      mainWindow.loadURL('http://localhost:5173');
      // DevTools 已关闭，如需调试请手动按 Cmd+Option+I (macOS) 或 Ctrl+Shift+I (Windows/Linux)
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


// 设置应用名称
app.setName('AirPost');

// 应用准备就绪
app.whenReady().then(() => {
  console.log('Electron 应用准备就绪');
  console.log('isDev:', isDev);
  console.log('app.isPackaged:', app.isPackaged);
  
  // 设置 macOS Dock 图标和标题
  if (process.platform === 'darwin') {
    try {
      // 使用 process.cwd() 获取项目根目录
      const iconBasePath = path.resolve(process.cwd(), 'assets');
      const fs = require('fs');
      
      // 尝试加载 Dock 图标的辅助函数
      const tryLoadDockIcon = (iconPath: string): boolean => {
        const absolutePath = path.resolve(iconPath);
        if (fs.existsSync(absolutePath)) {
          const dockIcon = nativeImage.createFromPath(absolutePath);
          if (!dockIcon.isEmpty()) {
            app.dock.setIcon(dockIcon);
            console.log('设置 Dock 图标成功:', absolutePath);
            return true;
          }
        }
        return false;
      };
      
      // 使用 PNG 格式作为 Dock 图标
      if (!tryLoadDockIcon(path.join(iconBasePath, 'icon.png'))) {
        console.warn('Dock 图标加载失败');
      }
    } catch (error) {
      console.error('设置 Dock 图标时出错:', error);
    }
    // macOS Dock 名称通过 app.setName 设置，已经在上面设置了
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 处理未捕获的错误
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
