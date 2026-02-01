# AirPost Design System Documentation

## 概述

AirPost 设计系统参考 Postman 的现代设计标准，提供一致、清晰的用户界面体验。

---

## 1. 颜色系统

### 主色 (Primary Colors)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-50` | `#e6f4ff` | 悬停背景、选中状态 |
| `--color-primary-100` | `#bae0ff` | 浅色背景 |
| `--color-primary-200` | `#91caff` | 边框悬color-primary-300停 |
| `--` | `#69b1ff` | 图标悬停 |
| `--color-primary-400` | `#4096ff` | 次要操作 |
| `--color-primary-500` | `#1677ff` | 主色、品牌色 |
| `--color-primary-600` | `#0958d9` | 主按钮悬停 |
| `--color-primary-700` | `#003eb3` | 深色悬停 |
| `--color-primary-800` | `#002c8c` | 按下状态 |
| `--color-primary-900` | `#001d66` | 深色背景 |

### 语义色 (Semantic Colors)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-success` | `#52c41a` | `#52c41a` | 成功状态 |
| `--color-success-bg` | `#f6ffed` | `#1c2e1c` | 成功背景 |
| `--color-warning` | `#faad14` | `#faad14` | 警告状态 |
| `--color-warning-bg` | `#fffbe6` | `#2e2a1a` | 警告背景 |
| `--color-error` | `#ff4d4f` | `#ff4d4f` | 错误状态 |
| `--color-error-bg` | `#fff2f0` | `#2e1f1f` | 错误背景 |
| `--color-info` | `#1890ff` | `#1890ff` | 信息状态 |
| `--color-info-bg` | `#e6f7ff` | `#1c2a3d` | 信息背景 |

### HTTP 方法颜色

| 方法 | 颜色 | RGB |
|------|------|-----|
| GET | `#61affe` | 97, 175, 254 |
| POST | `#49cc90` | 73, 204, 144 |
| PUT | `#fca130` | 252, 161, 48 |
| DELETE | `#f93e3e` | 249, 62, 62 |
| PATCH | `#50e3c2` | 80, 227, 194 |
| HEAD | `#9012fe` | 144, 18, 254 |
| OPTIONS | `#0d5aa7` | 13, 90, 167 |

### 中性色 (Light Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#ffffff` | 主背景 |
| `--color-bg-secondary` | `#f5f7fa` | 次要背景 |
| `--color-bg-tertiary` | `#e8ecf1` | 边框背景 |
| `--color-bg-elevated` | `#ffffff` | 悬浮卡片 |
| `--color-bg-hover` | `#f0f2f5` | 悬停背景 |
| `--color-bg-active` | `#e6e8eb` | 激活背景 |
| `--color-border-light` | `#f0f0f0` | 浅边框 |
| `--color-border-default` | `#d9d9d9` | 默认边框 |
| `--color-border-dark` | `#bfbfbf` | 深边框 |
| `--color-text-primary` | `#262626` | 主要文本 |
| `--color-text-secondary` | `#595959` | 次要文本 |
| `--color-text-tertiary` | `#8c8c8c` | 占位符 |
| `--color-text-disabled` | `#bfbfbf` | 禁用文本 |

---

## 2. 字体系统

### 字体族

```css
--font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
  'Helvetica Neue', Arial, sans-serif;
--font-family-mono: 'SF Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
```

### 字号

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-xs` | 12px | 辅助文本、标签 |
| `--font-size-sm` | 13px | 次要文本 |
| `--font-size-md` | 14px | 正文 |
| `--font-size-lg` | 16px | 标题、小标题 |
| `--font-size-xl` | 18px | 页面标题 |
| `--font-size-2xl` | 20px | 大标题 |
| `--font-size-3xl` | 24px | Hero 标题 |
| `--font-size-4xl` | 30px | 展示标题 |

### 字重

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-regular` | 400 | 正文 |
| `--font-weight-medium` | 500 | 次要标题 |
| `--font-weight-semibold` | 600 | 主要标题 |
| `--font-weight-bold` | 700 | 强调文本 |

---

## 3. 间距系统

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | 无间距 |
| `--space-1` | 4px | 紧凑间距 |
| `--space-2` | 8px | 小间距 |
| `--space-3` | 12px | 中间距 |
| `--space-4` | 16px | 标准间距 |
| `--space-5` | 20px | 中大间距 |
| `--space-6` | 24px | 大间距 |
| `--space-8` | 32px | 特大间距 |
| `--space-10` | 40px | 区块间距 |
| `--space-12` | 48px | 大区块 |
| `--space-16` | 64px | 页面边距 |

---

## 4. 圆角系统

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0px | 无圆角 |
| `--radius-sm` | 4px | 小按钮、标签 |
| `--radius-md` | 6px | 输入框、小卡片 |
| `--radius-lg` | 8px | 按钮、卡片 |
| `--radius-xl` | 12px | 模态框、弹窗 |
| `--radius-2xl` | 16px | 大弹窗 |
| `--radius-full` | 9999px | 徽章、圆形 |

---

## 5. 阴影系统

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | 细微阴影 |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.07) | 卡片阴影 |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | 悬浮阴影 |
| `--shadow-xl` | 0 20px 25px rgba(0,0,0,0.1) | 模态框阴影 |
| `--shadow-inner` | inset 0 2px 4px rgba(0,0,0,0.06) | 内阴影 |

---

## 6. 过渡动画

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | 150ms ease | 快速过渡 |
| `--transition-normal` | 200ms ease | 标准过渡 |
| `--transition-slow` | 300ms ease | 慢速过渡 |

---

## 7. 组件 Tokens

### 按钮

```css
--btn-height-sm: 28px;
--btn-height-md: 36px;
--btn-height-lg: 44px;
--btn-padding-sm: 12px;
--btn-padding-md: 16px;
--btn-padding-lg: 24px;
--btn-radius: var(--radius-md);
```

### 输入框

```css
--input-height: 36px;
--input-radius: var(--radius-md);
--input-border-color: var(--color-border-default);
```

### 卡片

```css
--card-radius: var(--radius-lg);
--card-shadow: var(--shadow-md);
```

### 侧边栏

```css
--sidebar-width: 260px;
--sidebar-bg: var(--color-bg-secondary);
--sidebar-item-hover: var(--color-bg-hover);
--sidebar-item-active: var(--color-primary-50);
```

### 标签页

```css
--tab-height: 40px;
--tab-padding: var(--space-3) var(--space-4);
--tab-radius: var(--radius-md);
```

---

## 8. 布局尺寸

```css
--sidebar-width: 260px;
--header-height: 56px;
--splitter-width: 8px;
--url-bar-height: 44px;
--tab-height: 40px;
```

---

## 9. 响应式断点

| Breakpoint | Width | Usage |
|------------|-------|-------|
| xs | < 576px | Mobile |
| sm | ≥ 576px | Large Mobile |
| md | ≥ 768px | Tablet |
| lg | ≥ 992px | Desktop |
| xl | ≥ 1200px | Large Desktop |
| xxl | ≥ 1600px | Ultra Wide |

---

## 10. 使用示例

### 按钮

```tsx
import './styles/variables.css';
import './styles/theme.css';
import './styles/components.css';

<Button type="primary" size="large">
  Send Request
</Button>
```

### 输入框

```tsx
<Input 
  placeholder="Enter URL"
  className="url-input"
/>
```

### 卡片

```tsx
<div className="card" style={{ 
  background: 'var(--color-bg-primary)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)'
}}>
  Content
</div>
```

### HTTP 方法徽章

```tsx
<span className={`method-badge ${method.toLowerCase()}`}>
  {method}
</span>
```

### 状态徽章

```tsx
<span className={`status-badge ${statusType}`}>
  {status} OK
</span>
```

---

## 11. 深色主题

深色主题自动通过 `[data-theme="dark"]` 属性切换：

```css
[data-theme="dark"] {
  --color-bg-primary: #141414;
  --color-bg-secondary: #1f1f1f;
  --color-text-primary: #f0f0f0;
  /* ... */
}
```

---

## 12. 最佳实践

1. **使用 CSS 变量**：始终使用设计系统定义的 CSS 变量，而非硬编码值
2. **响应式设计**：使用媒体查询适配不同屏幕尺寸
3. **一致性**：相同类型的元素使用相同的样式
4. **可访问性**：确保颜色对比度符合 WCAG 2.1 标准
5. **动画**：使用 `var(--transition-*)` 定义动画时长
