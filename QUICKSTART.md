# 快速开始

## 1. 安装依赖

```bash
pnpm install
```

## 2. 开发模式

启动开发服务器：

```bash
pnpm dev
```

这将：
- 编译 Electron 主进程 TypeScript 代码
- 启动 Vite 开发服务器（http://localhost:5173）
- 监听 Electron 主进程 TypeScript 文件变化并自动重新编译
- 等待 Vite 服务器就绪后自动打开 Electron 窗口
- 自动打开开发者工具（DevTools）

**运行成功标志：**
- ✅ Electron 窗口自动打开
- ✅ 显示 React 应用界面
- ✅ 开发者工具自动打开
- ✅ 没有错误信息

**详细运行说明请查看 [RUN.md](./RUN.md)**

## 3. 构建应用

### 构建当前平台

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

## 项目结构说明

- `electron/` - Electron 主进程代码（Node.js 环境）
  - `main.ts` - 主进程入口，负责窗口管理和数据库操作
  - `preload.ts` - 预加载脚本，安全地暴露 API 给渲染进程

- `src/` - React 应用代码（浏览器环境）
  - `App.tsx` - 主应用组件
  - `main.tsx` - React 入口文件

## 数据库

应用使用 SQLite 数据库，数据库文件自动创建在用户数据目录：
- Windows: `%APPDATA%/airpost/airpost.db`
- macOS: `~/Library/Application Support/airpost/airpost.db`
- Linux: `~/.config/airpost/airpost.db`

## 常见问题

### better-sqlite3 编译失败

如果遇到编译错误，请安装构建工具：

**macOS:**
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install build-essential python3
```

**Windows:**
安装 Visual Studio Build Tools 或使用管理员权限运行。

### 端口被占用

如果 5173 端口被占用，可以修改 `vite.config.ts` 中的端口配置。
