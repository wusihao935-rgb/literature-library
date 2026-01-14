# 文献库 (Literature Library)

一个优雅的个人论文管理系统，支持 AI 辅助阅读和管理。

## ✨ 核心功能

- **📂 文件夹管理**：自定义分类整理论文
- **📝 PDF 阅读**：内置 PDF 阅读器，支持全屏阅读
- **🤖 AI 洞察**：使用 Gemini AI 自动提取摘要、分析方法论和研究结论
- **✍️ 笔记标注**：阅读时高亮重点，记录灵感
- **🔍 智能搜索**：快速查找论文库内容
- **📱 响应式设计**：完美适配电脑、平板和手机

## 🛠️ 技术栈

- **前端**：React, Vite, Tailwind CSS
- **后端**：Node.js, Express
- **数据库**：Supabase (PostgreSQL)
- **AI 服务**：Google Gemini API
- **存储**：Supabase Storage

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入你的配置：

```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Google Gemini API
VITE_GOOGLE_API_KEY=your_gemini_key
```

### 3. 启动开发服务器

```bash
npm run dev:all
```

- 前端：http://localhost:3000
- 后端：http://localhost:3002

## 📦 数据库设置

项目包含 SQL 脚本，请在 Supabase SQL Editor 中运行：

1. `database/schema.sql` - 创建表结构
2. `database/storage.sql` - 配置存储桶策略

## 📄 许可证

MIT
