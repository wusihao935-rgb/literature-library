import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';
import { extractPaperInfoFromUrl } from '../services/pdfExtractor';

const router = Router();

// AI 提取论文信息
router.post('/extract', async (req: Request, res: Response) => {
    const { pdfUrl } = req.body;

    if (!pdfUrl) {
        return res.status(400).json({ error: '缺少 pdfUrl 参数' });
    }

    try {
        const info = await extractPaperInfoFromUrl(pdfUrl);
        res.json(info);
    } catch (error) {
        console.error('提取失败:', error);
        res.status(500).json({ error: '提取论文信息失败' });
    }
});

// 获取所有论文
router.get('/', async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// 获取最近阅读的论文（按更新时间排序，取最近3篇有阅读进度的）
router.get('/recent', async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('papers')
        .select('*')
        .gt('progress', 0)
        .order('updated_at', { ascending: false })
        .limit(5);

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// 获取单篇论文
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('papers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return res.status(404).json({ error: '论文未找到' });
    }
    res.json(data);
});

// 创建论文
router.post('/', async (req: Request, res: Response) => {
    const paper = req.body;
    const { data, error } = await supabase
        .from('papers')
        .insert([paper])
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
});

// 更新论文
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
        .from('papers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.json(data);
});

// 更新阅读进度
router.put('/:id/progress', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { progress } = req.body;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ error: '进度必须是 0-100 之间的数字' });
    }

    const { data, error } = await supabase
        .from('papers')
        .update({ progress, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.json(data);
});

// 删除论文
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('papers')
        .delete()
        .eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(204).send();
});

// 搜索论文
router.get('/search/:query', async (req: Request, res: Response) => {
    const { query } = req.params;
    const searchQuery = `%${query}%`;

    const { data, error } = await supabase
        .from('papers')
        .select('*')
        .or(`title.ilike.${searchQuery},authors.ilike.${searchQuery}`)
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

export default router;
