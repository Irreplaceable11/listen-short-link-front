# ShortLink Frontend

基于 Vue 3 + TypeScript + Element Plus 的现代化短链管理系统前端，模仿 Bitly 的设计风格。

## 🚀 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **日期处理**: Day.js
- **图表**: ECharts（待实现）
- **图标**: Element Plus Icons

## 📋 功能特性

### 🔐 用户认证
- [x] 用户注册
- [x] 用户登录
- [x] 自动登录状态保持
- [x] 路由守卫

### 🔗 短链管理
- [x] 创建短链接
- [x] 查看短链列表
- [x] 编辑短链信息
- [x] 删除短链
- [x] 启用/禁用短链
- [x] 复制短链到剪贴板
- [x] 搜索和筛选
- [x] 分页加载

### 📊 数据统计
- [x] 仪表板概览
- [x] 点击量统计
- [ ] 详细数据分析（开发中）
- [ ] 图表可视化（开发中）

### 🎨 UI/UX
- [x] 响应式设计
- [x] Bitly 风格的现代化界面
- [x] 优雅的动画效果
- [x] 深色/浅色主题适配
- [x] 移动端友好

## 🛠️ 开发指南

### 环境要求

- Node.js 20.19+ 或 22.12+
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
src/
├── api/                    # API 接口
│   └── index.ts
├── components/             # 公共组件
│   └── Layout.vue
├── router/                 # 路由配置
│   └── index.ts
├── stores/                 # Pinia 状态管理
│   ├── auth.ts            # 认证状态
│   ├── url.ts             # 短链状态
│   └── index.ts
├── types/                  # TypeScript 类型定义
│   └── index.ts
├── utils/                  # 工具函数
│   └── http.ts            # HTTP 客户端
├── views/                  # 页面组件
│   ├── auth/              # 认证相关页面
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── Home.vue           # 首页
│   ├── Dashboard.vue      # 仪表板
│   ├── Links.vue          # 链接管理
│   ├── Analytics.vue      # 数据分析
│   ├── LinkDetail.vue     # 链接详情
│   └── NotFound.vue       # 404 页面
├── App.vue                 # 根组件
├── main.ts                 # 入口文件
└── env.d.ts               # 环境变量类型
```

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=ShortLink
```

### 代理配置

开发环境下，Vite 会自动将 `/api/*` 的请求代理到后端服务器（默认 `http://localhost:8080`）。

## 🎯 与后端 API 对接

### 用户认证 API

- `POST /user/login` - 用户登录
- `POST /user/register` - 用户注册
- `GET /user/info` - 获取用户信息

### 短链管理 API

- `POST /urls` - 创建短链
- `GET /urls/my` - 获取用户短链列表
- `GET /urls/{id}` - 获取短链详情
- `PUT /urls/{id}` - 更新短链
- `DELETE /urls/{id}` - 删除短链

### 统计数据 API

- `GET /stats/dashboard` - 获取仪表板数据
- `GET /stats/clicks/{shortCode}` - 获取点击统计
