# Electron 应用运行指南

## 📋 前置准备

### 1. 检查环境

确保已安装以下工具：

```bash
# 检查 Node.js 版本（需要 >= 18.12）
node -v

# 检查 pnpm 版本（需要 >= 9.0）
pnpm -v
```

### 2. 安装依赖

如果还没有安装项目依赖，请先安装：

```bash
pnpm install
```

## 🚀 运行 Electron 应用

### 方法一：开发模式（推荐）

开发模式支持热重载，修改代码后会自动刷新：

```bash
pnpm dev
```

**这个命令会：**
1. 编译 Electron 主进程 TypeScript 代码
2. 启动 Vite 开发服务器（http://localhost:5173）
3. 监听 Electron 主进程文件变化并自动重新编译
4. 等待 Vite 服务器就绪后自动打开 Electron 窗口
5. 自动打开开发者工具（DevTools）

**开发模式特点：**
- ✅ 热模块替换（HMR）- React 组件修改后自动更新
- ✅ TypeScript 自动编译
- ✅ 开发者工具自动打开
- ✅ 实时查看控制台日志

### 方法二：分步运行（调试用）

如果想分步执行，可以分别运行：

**终端 1 - 启动 Vite 开发服务器：**
```bash
pnpm vite
```

**终端 2 - 编译并监听 Electron 主进程：**
```bash
tsc -p electron/tsconfig.json --watch
```

**终端 3 - 运行 Electron：**
```bash
# 等待 Vite 服务器启动后（约 3-5 秒）
electron .
```

### 方法三：生产模式（测试构建版本）

先构建应用，然后运行构建后的版本：

```bash
# 构建应用
pnpm build

# 运行构建后的应用（需要根据构建输出调整路径）
# 构建文件在 dist/ 目录
```

## 📱 应用窗口说明

运行成功后，你会看到：

1. **Electron 窗口** - 显示 React 应用界面
2. **开发者工具** - 在开发模式下自动打开，可以：
   - 查看控制台日志
   - 调试 React 组件
   - 检查网络请求
   - 查看 DOM 结构

## 🔧 常见运行问题

### 问题 1: 端口 5173 被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::5173
```

**解决方法：**
1. 修改 `vite.config.ts` 中的端口：
```typescript
server: {
  port: 5174, // 改为其他端口
}
```

2. 或者关闭占用端口的进程：
```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### 问题 2: Electron 找不到主进程文件

**错误信息：**
```
Cannot find module 'dist-electron/main.js'
```

**解决方法：**
```bash
# 先编译 Electron 主进程
tsc -p electron/tsconfig.json

# 然后再运行
pnpm dev
```

### 问题 3: Electron 安装失败

**错误信息：**
```
Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
```

**解决方法：**

**快速修复（推荐）：**
```bash
# macOS/Linux
./fix-electron.sh

# Windows (PowerShell)
.\fix-electron.ps1
```

**手动修复：**
```bash
# 删除 Electron 相关文件
rm -rf node_modules/.pnpm/electron*
rm -rf node_modules/electron

# 重新安装
pnpm install
```

**详细说明请查看 [FIX_ELECTRON.md](./FIX_ELECTRON.md)**

### 问题 4: better-sqlite3 编译失败

**错误信息：**
```
Error: Cannot find module 'better-sqlite3'
```

**解决方法：**
```bash
# 重新安装依赖
rm -rf node_modules
pnpm install

# 如果还是失败，可能需要安装构建工具（见 INSTALL.md）
```

### 问题 5: 数据库初始化失败

**错误信息：**
```
数据库初始化失败
```

**解决方法：**
- 检查用户数据目录权限
- 查看控制台输出的数据库路径
- 确保有写入权限

## 🎯 运行流程说明

```
启动 pnpm dev
    ↓
编译 electron/main.ts → dist-electron/main.js
    ↓
启动 Vite 开发服务器 (localhost:5173)
    ↓
监听 electron/ 目录变化（自动重新编译）
    ↓
等待 Vite 服务器就绪
    ↓
启动 Electron 进程
    ↓
加载 http://localhost:5173
    ↓
打开开发者工具
    ↓
应用运行中...
```

## 📊 运行状态检查

### 检查 Vite 服务器

打开浏览器访问：http://localhost:5173

如果能看到 React 应用界面，说明 Vite 服务器正常运行。

### 检查 Electron 进程

**macOS/Linux:**
```bash
ps aux | grep electron
```

**Windows:**
```bash
tasklist | findstr electron
```

### 查看日志

- **主进程日志**：在运行 `pnpm dev` 的终端中查看
- **渲染进程日志**：在 Electron 窗口的开发者工具控制台中查看

## 🛠️ 调试技巧

### 1. 主进程调试

在 `electron/main.ts` 中添加 `console.log()`：
```typescript
console.log('主进程启动', process.argv);
```

### 2. 渲染进程调试

在 React 组件中添加日志：
```typescript
console.log('组件渲染', props);
```

### 3. 数据库调试

在 `electron/main.ts` 中查看数据库操作：
```typescript
console.log('数据库路径:', dbPath);
console.log('查询结果:', result);
```

### 4. IPC 通信调试

在 `electron/preload.ts` 中添加日志：
```typescript
console.log('IPC 调用:', channel, args);
```

## 📝 快速命令参考

```bash
# 开发模式（最常用）
pnpm dev

# 仅启动 Vite（不启动 Electron）
pnpm vite

# 仅编译 Electron 主进程
tsc -p electron/tsconfig.json

# 仅运行 Electron（需要先启动 Vite）
electron .

# 构建生产版本
pnpm build

# 清理构建文件
rm -rf dist dist-electron
```

## ✅ 运行成功标志

当你看到以下情况时，说明应用已成功运行：

1. ✅ 终端显示 "VITE ready" 或类似消息
2. ✅ Electron 窗口自动打开
3. ✅ 窗口显示 React 应用界面（文章管理界面）
4. ✅ 开发者工具自动打开（开发模式）
5. ✅ 没有错误信息输出

现在你可以开始开发了！🎉
