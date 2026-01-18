# 安装指南

## 前置要求

- **Node.js** 18.12 或更高版本（推荐 20.x）
- **pnpm** 9.0 或更高版本（推荐最新版本）

## 快速安装

### 1. 安装或升级 pnpm 到最新版本

**方法一：使用 Corepack（推荐）**

Corepack 是 Node.js 自带的包管理器版本管理工具：

```bash
# 启用 Corepack
corepack enable

# 在项目目录中使用最新版本的 pnpm
corepack use pnpm@latest
```

**方法二：使用 npm 安装/升级**

```bash
# 安装最新版本
npm install -g pnpm@latest

# 或使用国内镜像安装
npm install -g pnpm@latest --registry=https://registry.npmmirror.com
```

**方法三：使用 pnpm 自升级**

如果已安装 pnpm，可以直接升级：

```bash
pnpm self-update
```

**方法四：使用官方安装脚本（macOS/Linux）**

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**验证安装：**

```bash
pnpm -v
# 应该显示 9.x 或更高版本
```

### 2. 安装项目依赖

```bash
pnpm install
```

项目已配置使用国内镜像源，安装速度会更快。

## 国内镜像源说明

项目已自动配置使用淘宝镜像源（npmmirror.com），配置文件位于 `.npmrc`。

### 已配置的镜像源

- **npm 包源**: `https://registry.npmmirror.com`
- **Electron 二进制**: `https://npmmirror.com/mirrors/electron/`
- **electron-builder 二进制**: `https://npmmirror.com/mirrors/electron-builder-binaries/`

### 手动切换镜像源

如果需要临时使用其他镜像源：

```bash
# 使用淘宝镜像
pnpm config set registry https://registry.npmmirror.com

# 使用腾讯云镜像
pnpm config set registry https://mirrors.cloud.tencent.com/npm/

# 使用华为云镜像
pnpm config set registry https://repo.huaweicloud.com/repository/npm/

# 恢复官方源
pnpm config set registry https://registry.npmjs.org/
```

### 仅当前项目使用镜像源

项目根目录的 `.npmrc` 文件已配置镜像源，仅对当前项目生效。

## 常见问题

### 1. better-sqlite3 编译失败

`better-sqlite3` 需要编译原生模块，可能需要安装构建工具：

**macOS:**
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install build-essential python3
```

**Windows:**
- 安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
- 或使用管理员权限运行 PowerShell

### 2. Electron 下载缓慢

如果 Electron 二进制文件下载缓慢，可以：

1. 检查 `.npmrc` 中的 `electron_mirror` 配置
2. 手动设置环境变量：
   ```bash
   # macOS/Linux
   export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
   
   # Windows (PowerShell)
   $env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
   ```

### 3. 网络连接问题

如果遇到网络问题：

1. 检查网络连接
2. 尝试使用不同的镜像源
3. 使用代理（如果可用）

### 4. 清理缓存重新安装

如果安装出现问题，可以清理缓存后重新安装：

```bash
# 清理 pnpm 缓存
pnpm store prune

# 删除 node_modules 和锁文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

## 验证安装

安装完成后，可以运行以下命令验证：

```bash
# 检查版本
node -v
pnpm -v

# 运行开发服务器
pnpm dev
```

如果一切正常，应该能看到 Electron 窗口打开。
