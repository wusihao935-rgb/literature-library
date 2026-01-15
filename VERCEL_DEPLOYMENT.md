# 文献库（Literature Library）Vercel 部署指南

本文档详细介绍如何将文献库项目从 GitHub 部署到 Vercel。

## 📋 目录

- [项目架构说明](#项目架构说明)
- [部署前准备](#部署前准备)
- [Vercel 部署步骤](#vercel-部署步骤)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

---

## 🏗️ 项目架构说明

本项目是一个全栈应用：

| 组件 | 技术栈 | 说明 |
|------|--------|------|
| 前端 | React 19 + Vite | SPA 单页应用 |
| 后端 | Express.js | RESTful API 服务 |
| 数据库 | Supabase | PostgreSQL 云数据库 |
| AI 服务 | Google Gemini | AI 分析功能 |

> [!IMPORTANT]
> Vercel 主要是一个前端托管平台，后端 Express 服务器需要转换为 **Vercel Serverless Functions** 才能正常运行。
> 
> 本项目可以选择以下两种部署方式：
> - **方式一**：仅部署前端，后端单独部署到其他平台（如 Railway、Render）
> - **方式二**：将后端转换为 Vercel Serverless Functions，全部部署到 Vercel

---

## 🔧 部署前准备

### 1. 确保 GitHub 仓库已准备好

你的项目已经推送到：`https://github.com/wusihao935-rgb/literature-library`

### 2. 确保 Supabase 数据库正常运行

- Supabase 项目地址：`https://oasbifvdeiokguodlenf.supabase.co`
- 确保数据库表结构和种子数据已经初始化

### 3. 准备好 API 密钥

需要以下环境变量：
- `GEMINI_API_KEY` - Google Gemini API 密钥
- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_ANON_KEY` - Supabase 匿名访问密钥

---

## 🚀 Vercel 部署步骤

### 步骤 1：创建 Vercel 账号

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 **Sign Up**
3. 选择 **Continue with GitHub** 使用 GitHub 账号登录

### 步骤 2：导入 GitHub 仓库

1. 登录 Vercel 后，点击 **Add New...** → **Project**
2. 在 **Import Git Repository** 中找到 `wusihao935-rgb/literature-library`
3. 点击 **Import**

### 步骤 3：配置项目设置

在 **Configure Project** 页面进行如下配置：

| 配置项 | 值 |
|--------|-----|
| **Framework Preset** | Vite |
| **Root Directory** | `./ ` (保持默认) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 步骤 4：设置环境变量

在 **Environment Variables** 部分添加以下变量：

```
GEMINI_API_KEY=你的_Gemini_API_密钥
SUPABASE_URL=https://oasbifvdeiokguodlenf.supabase.co
SUPABASE_ANON_KEY=你的_Supabase_匿名密钥
VITE_SUPABASE_URL=https://oasbifvdeiokguodlenf.supabase.co
VITE_SUPABASE_ANON_KEY=你的_Supabase_匿名密钥
```

> [!WARNING]
> 前端环境变量必须以 `VITE_` 开头才能在客户端代码中访问！

### 步骤 5：部署

点击 **Deploy** 按钮开始部署。

---

## ⚙️ 后端 API 部署方案

### 方案 A：使用 Vercel Serverless Functions（推荐）

需要将现有的 Express API 改造为 Vercel Serverless Functions。

#### 1. 创建 `vercel.json` 配置文件

在项目根目录创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

#### 2. 创建 API 目录结构

将 `server/routes/` 中的路由转换为 Vercel Serverless Functions：

```
api/
├── papers/
│   ├── index.ts          # GET /api/papers, POST /api/papers
│   ├── [id].ts           # GET/PUT/DELETE /api/papers/:id
│   └── recent.ts         # GET /api/papers/recent
├── folders/
│   ├── index.ts          # GET /api/folders, POST /api/folders
│   └── [id].ts           # GET/PUT/DELETE /api/folders/:id
├── authors/
│   ├── index.ts          # GET /api/authors, POST /api/authors
│   └── [id].ts           # GET/PUT/DELETE /api/authors/:id
└── health.ts             # GET /api/health
```

#### 3. Serverless Function 示例

`api/health.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

`api/papers/index.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('papers')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

#### 4. 更新前端 API 地址

修改 `src/services/api.ts` 中的 API 基础地址：

```typescript
// 本地开发使用 localhost，生产环境使用相对路径
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3002/api' 
  : '/api';
```

### 方案 B：后端单独部署

如果不想改造成 Serverless Functions，可以将后端部署到：

| 平台 | 特点 |
|------|------|
| [Railway](https://railway.app) | 简单易用，支持 Node.js |
| [Render](https://render.com) | 免费层可用，自动部署 |
| [Fly.io](https://fly.io) | 全球边缘节点 |
| [Heroku](https://heroku.com) | 经典 PaaS 平台 |

部署后端后，更新前端的 `API_BASE_URL` 指向后端服务器地址。

---

## 🔐 环境变量配置

### Vercel 环境变量设置

1. 进入 Vercel 项目设置
2. 点击 **Settings** → **Environment Variables**
3. 添加以下变量：

| 变量名 | 说明 | 环境 |
|--------|------|------|
| `GEMINI_API_KEY` | Google Gemini API 密钥 | Production, Preview, Development |
| `SUPABASE_URL` | Supabase 项目 URL | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | Supabase 匿名访问密钥 | Production, Preview, Development |
| `VITE_SUPABASE_URL` | 前端用 Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | 前端用 Supabase 密钥 | Production, Preview, Development |

> [!CAUTION]
> **安全提醒**：
> - 不要将 API 密钥提交到 Git 仓库
> - 确保 `.env.local` 文件已添加到 `.gitignore`
> - 在 Supabase 中配置 Row Level Security (RLS) 保护数据

---

## ❓ 常见问题

### Q1: 部署后页面空白或 404

**原因**：SPA 路由问题

**解决方案**：在项目根目录创建 `vercel.json`：

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Q2: 前端无法连接后端 API

**原因**：API 地址配置错误或 CORS 问题

**解决方案**：
1. 确保 `API_BASE_URL` 指向正确的后端地址
2. 后端需要正确配置 CORS 允许 Vercel 域名

### Q3: 环境变量不生效

**原因**：缺少 `VITE_` 前缀

**解决方案**：前端使用的环境变量必须以 `VITE_` 开头

### Q4: 构建失败

**检查项**：
- 查看 Vercel 构建日志
- 确保 `package.json` 中的依赖版本正确
- 本地运行 `npm run build` 测试构建

---

## 📝 部署检查清单

- [ ] GitHub 仓库已推送最新代码
- [ ] Vercel 账号已创建并关联 GitHub
- [ ] 环境变量已正确配置
- [ ] Supabase 数据库表结构已初始化
- [ ] 前端 API 地址已更新为生产环境地址
- [ ] 后端 API 已部署（Serverless 或单独服务器）
- [ ] 部署后功能测试通过

---

## 🔗 相关链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Supabase 文档](https://supabase.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

**最后更新**：2026-01-15
