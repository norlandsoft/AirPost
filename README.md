# AirPost

一个基于 Electron + React + TypeScript 的跨平台桌面应用，使用 Ant Design 作为 UI 组件库，支持本地 SQLite 数据库存储。

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全的 JavaScript
- **Ant Design** - 企业级 UI 组件库
- **Vite** - 快速的前端构建工具
- **better-sqlite3** - 高性能 SQLite 数据库
- **pnpm** - 快速、节省磁盘空间的包管理器

## 功能特性

- ✅ 跨平台支持（Windows、macOS、Linux）
- ✅ React + TypeScript 开发
- ✅ Ant Design UI 组件
- ✅ 本地 SQLite 数据库存储
- ✅ 安全的上下文隔离
- ✅ 热模块替换（HMR）
- ✅ 应用打包支持

## 项目结构

```
AirPost/
├── electron/           # Electron 主进程代码
│   ├── main.ts        # 主进程入口
│   ├── preload.ts     # 预加载脚本
│   └── tsconfig.json  # TypeScript 配置
├── src/               # React 应用源码
│   ├── App.tsx        # 主应用组件
│   ├── main.tsx       # React 入口
│   └── ...
├── assets/            # 静态资源
├── dist/              # 构建输出（渲染进程）
├── dist-electron/     # 构建输出（主进程）
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript 配置
├── vite.config.ts     # Vite 配置
└── README.md          # 项目说明
```

## 安装依赖

使用 pnpm 安装依赖：

```bash
pnpm install
```

如果没有安装 pnpm，可以使用以下命令安装：

```bash
npm install -g pnpm
```

### 国内镜像源配置

项目已配置使用淘宝镜像源（npmmirror.com）加速下载，包括：
- npm 包源
- Electron 二进制文件镜像
- electron-builder 二进制文件镜像
- 其他常用二进制文件镜像

配置位于 `.npmrc` 文件中，如需切换回官方源，可以修改该文件。

**手动配置镜像源（如果需要）：**

```bash
# 设置 npm 镜像
pnpm config set registry https://registry.npmmirror.com

# 设置 Electron 镜像
pnpm config set electron_mirror https://npmmirror.com/mirrors/electron/
```

## 开发模式

启动开发服务器（自动打开 Electron 窗口）：

```bash
pnpm dev
```

开发模式会：
- 编译 Electron 主进程 TypeScript 代码
- 启动 Vite 开发服务器（http://localhost:5173）
- 监听 Electron 主进程文件变化并自动重新编译
- 等待 Vite 服务器就绪后自动打开 Electron 窗口
- 自动打开开发者工具（DevTools）

**详细运行说明请查看 [RUN.md](./RUN.md)**

## 构建应用

### 构建所有平台

```bash
pnpm build
```

### 构建特定平台

```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

构建输出将保存在 `dist/` 目录中。

## 数据库

应用使用 SQLite 数据库存储数据，数据库文件位于用户数据目录：
- **Windows**: `%APPDATA%/airpost/airpost.db`
- **macOS**: `~/Library/Application Support/airpost/airpost.db`
- **Linux**: `~/.config/airpost/airpost.db`

### 数据库操作

应用提供了以下数据库操作 API（通过 `window.electronAPI.db`）：

- `getAllPosts()` - 获取所有文章
- `getPostById(id)` - 根据 ID 获取文章
- `createPost(title, content)` - 创建新文章
- `updatePost(id, title, content)` - 更新文章
- `deletePost(id)` - 删除文章

## 开发说明

### 主进程 (electron/main.ts)

主进程负责：
- 创建和管理应用窗口
- 处理系统级事件
- 管理 SQLite 数据库连接
- 处理 IPC 通信

### 渲染进程 (src/)

渲染进程运行 React 应用，负责 UI 展示和用户交互。

### 预加载脚本 (electron/preload.ts)

预加载脚本在渲染进程加载之前运行，用于安全地暴露 Node.js 和 Electron API 给渲染进程。

## 安全最佳实践

- ✅ 启用了上下文隔离 (`contextIsolation: true`)
- ✅ 禁用了 Node.js 集成 (`nodeIntegration: false`)
- ✅ 使用 contextBridge 安全地暴露 API
- ✅ TypeScript 类型检查

## 系统要求

- **Node.js** 18.12 或更高版本（推荐 20.x）
- **pnpm** 9.0 或更高版本（推荐最新版本）

### 升级 pnpm 到最新版本

项目已配置使用最新版本的 pnpm。如果当前版本较旧，可以使用以下命令升级：

```bash
# 使用 Corepack（推荐）
corepack enable
corepack use pnpm@latest

# 或使用 npm
npm install -g pnpm@latest

# 或使用 pnpm 自升级
pnpm self-update
```

验证版本：
```bash
pnpm -v
```

## 常见问题

### better-sqlite3 编译问题

如果遇到 `better-sqlite3` 编译错误，可能需要安装构建工具：

**macOS:**
```bash
xcode-select --install
```

**Linux:**
```bash
sudo apt-get install build-essential
```

**Windows:**
安装 Visual Studio Build Tools 或使用管理员权限运行。

## 许可证

MIT
