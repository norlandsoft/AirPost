# AirPost

一个基于 Electron + React + TypeScript 的跨平台桌面应用，使用 Ant Design 作为 UI 组件库。

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全的 JavaScript
- **Ant Design** - 企业级 UI 组件库
- **Vite** - 快速的前端构建工具
- **npm** - Node.js 包管理器

## 功能特性

- ✅ 跨平台支持（Windows、macOS、Linux）
- ✅ React + TypeScript 开发
- ✅ Ant Design UI 组件
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

使用 npm 安装依赖：

```bash
npm install
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
npm config set registry https://registry.npmmirror.com

# 设置 Electron 镜像
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
```

## 开发模式

启动开发服务器（自动打开 Electron 窗口）：

```bash
npm run dev
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
npm run build
```

### 构建特定平台

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

构建输出将保存在 `dist/` 目录中。

## 开发说明

### 主进程 (electron/main.ts)

主进程负责：
- 创建和管理应用窗口
- 处理系统级事件
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
- **npm** 9.0 或更高版本（通常随 Node.js 一起安装）

### 升级 npm 到最新版本

如果当前 npm 版本较旧，可以使用以下命令升级：

```bash
# 使用 npm 自升级
npm install -g npm@latest
```

验证版本：
```bash
npm -v
```

## 许可证

MIT
