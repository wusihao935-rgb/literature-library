import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import papersRouter from './routes/papers';
import foldersRouter from './routes/folders';
import authorsRouter from './routes/authors';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3002;  // 使用 3002 避免与 Vite 冲突

// 中间件 - 允许所有来源（开发环境）
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/papers', papersRouter);
app.use('/api/folders', foldersRouter);
app.use('/api/authors', authorsRouter);

// 健康检查端点
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 后端服务器运行在: http://localhost:${PORT}`);
    console.log(`📚 API 端点:`);
    console.log(`   - GET  /api/papers        获取所有论文`);
    console.log(`   - GET  /api/papers/recent 获取最近阅读`);
    console.log(`   - GET  /api/folders       获取所有文件夹`);
    console.log(`   - GET  /api/authors       获取所有作者`);
    console.log(`   - GET  /api/health        健康检查`);
});

export default app;
