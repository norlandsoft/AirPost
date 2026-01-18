import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import Database from 'better-sqlite3';

// 获取当前文件所在目录（编译为 CommonJS 后会有 __dirname）
// 在开发模式下，我们需要手动计算
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
const __dirname = isDev 
  ? path.resolve(process.cwd(), 'electron')
  : path.dirname(process.execPath);

// 保持对窗口对象的全局引用
let mainWindow: BrowserWindow | null = null;

// 数据库实例
let db: Database.Database | null = null;

// 初始化数据库
function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'airpost.db');
  db = new Database(dbPath);
  
  // 创建示例表
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('数据库初始化完成:', dbPath);
}

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    icon: isDev
      ? path.join(__dirname, '..', 'assets', 'icon.png')
      : undefined,
  });

  if (isDev) {
    // 开发模式：加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载构建后的文件
    // 在打包后的应用中，资源文件在 app.asar 中
    const indexPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html')
      : path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC 处理器
function setupIpcHandlers() {
  // 获取所有文章
  ipcMain.handle('db:getAllPosts', () => {
    if (!db) return [];
    const stmt = db.prepare('SELECT * FROM posts ORDER BY created_at DESC');
    return stmt.all();
  });

  // 根据ID获取文章
  ipcMain.handle('db:getPostById', (_, id: number) => {
    if (!db) return null;
    const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
    return stmt.get(id);
  });

  // 创建文章
  ipcMain.handle('db:createPost', (_, title: string, content: string) => {
    if (!db) return null;
    const stmt = db.prepare('INSERT INTO posts (title, content) VALUES (?, ?)');
    const result = stmt.run(title, content);
    return { id: result.lastInsertRowid, title, content };
  });

  // 更新文章
  ipcMain.handle('db:updatePost', (_, id: number, title: string, content: string) => {
    if (!db) return false;
    const stmt = db.prepare('UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(title, content, id);
    return result.changes > 0;
  });

  // 删除文章
  ipcMain.handle('db:deletePost', (_, id: number) => {
    if (!db) return false;
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  });
}

// 应用准备就绪
app.whenReady().then(() => {
  initDatabase();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
    }
    app.quit();
  }
});

// 应用退出前关闭数据库
app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});
