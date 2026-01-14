import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// 获取所有作者
router.get('/', async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// 获取单个作者详情
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return res.status(404).json({ error: '作者未找到' });
    }

    // 转换字段名以匹配前端期望的格式
    const author = {
        id: data.id,
        name: data.name,
        role: data.role,
        citations: data.citations,
        hIndex: data.h_index,
        papersCount: data.papers_count,
        bio: data.bio,
        avatarUrl: data.avatar_url,
        education: data.education || [],
        contributions: data.contributions || []
    };

    res.json(author);
});

// 创建作者
router.post('/', async (req: Request, res: Response) => {
    const authorData = req.body;

    // 转换前端字段名到数据库字段名
    const dbAuthor = {
        name: authorData.name,
        role: authorData.role,
        citations: authorData.citations,
        h_index: authorData.hIndex,
        papers_count: authorData.papersCount,
        bio: authorData.bio,
        avatar_url: authorData.avatarUrl,
        education: authorData.education,
        contributions: authorData.contributions
    };

    const { data, error } = await supabase
        .from('authors')
        .insert([dbAuthor])
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
});

// 更新作者
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const authorData = req.body;

    // 转换前端字段名到数据库字段名
    const dbUpdates: Record<string, any> = {};
    if (authorData.name) dbUpdates.name = authorData.name;
    if (authorData.role) dbUpdates.role = authorData.role;
    if (authorData.citations) dbUpdates.citations = authorData.citations;
    if (authorData.hIndex) dbUpdates.h_index = authorData.hIndex;
    if (authorData.papersCount) dbUpdates.papers_count = authorData.papersCount;
    if (authorData.bio) dbUpdates.bio = authorData.bio;
    if (authorData.avatarUrl) dbUpdates.avatar_url = authorData.avatarUrl;
    if (authorData.education) dbUpdates.education = authorData.education;
    if (authorData.contributions) dbUpdates.contributions = authorData.contributions;

    const { data, error } = await supabase
        .from('authors')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.json(data);
});

// 删除作者
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('authors')
        .delete()
        .eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(204).send();
});

export default router;
