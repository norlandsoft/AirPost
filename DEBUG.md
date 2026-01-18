# 调试 Electron 窗口问题

## 检查步骤

### 1. 检查 Electron 是否正常启动

```bash
# 检查编译后的文件是否存在
ls -la dist-electron/

# 应该看到 main.cjs 和 preload.cjs
```

### 2. 手动启动 Electron

```bash
# 先编译
tsc -p electron/tsconfig.json
npm run postbuild:electron

# 手动启动 Electron（设置环境变量）
NODE_ENV=development electron .
```

### 3. 检查控制台输出

运行 `npm run dev` 后，查看终端输出，应该看到：
- "Electron 应用准备就绪"
- "创建窗口，preload 路径: ..."
- "窗口已创建"
- "开发模式：加载 Vite 开发服务器 http://localhost:5173"

### 4. 检查进程

```bash
# 检查 Electron 进程是否在运行
ps aux | grep electron

# 检查端口 5173 是否被占用
lsof -i :5173
```

### 5. 检查窗口是否被隐藏

在 macOS 上，窗口可能被 Dock 隐藏。检查：
- Dock 中是否有 Electron 图标
- 使用 Cmd+Tab 切换应用
- 检查活动监视器中的进程

### 6. 如果窗口仍然不显示

尝试在代码中强制显示窗口：

```typescript
mainWindow.show();
mainWindow.focus();
mainWindow.moveTop();
```

## 常见问题

### 问题 1: Electron 进程启动但窗口不显示

**可能原因：**
- 窗口被创建但被隐藏
- 窗口在屏幕外
- macOS 权限问题

**解决方法：**
- 检查代码中是否有 `show: false`
- 添加 `mainWindow.show()` 和 `mainWindow.focus()`
- 检查 macOS 系统偏好设置中的辅助功能权限

### 问题 2: preload 文件路径错误

**检查：**
```bash
ls -la dist-electron/preload.cjs
```

**如果不存在：**
```bash
npm run postbuild:electron
```

### 问题 3: Vite 服务器未启动

**检查：**
- 浏览器访问 http://localhost:5173
- 如果无法访问，Vite 服务器可能未启动

**解决方法：**
- 确保 `npm run dev` 中的 vite 命令正常执行
- 检查端口 5173 是否被占用
