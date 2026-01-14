import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// 获取所有文件夹（含论文数量）
router.get('/', async (_req: Request, res: Response) => {
    // 首先获取所有文件夹
    const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: false });

    if (foldersError) {
        return res.status(500).json({ error: foldersError.message });
    }

    // 获取每个文件夹的论文数量
    const foldersWithCount = await Promise.all(
        (folders || []).map(async (folder) => {
            const { count } = await supabase
                .from('papers')
                .select('*', { count: 'exact', head: true })
                .eq('folder_id', folder.id);

            // 获取最近添加的论文时间
            const { data: recentPaper } = await supabase
                .from('papers')
                .select('created_at')
                .eq('folder_id', folder.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            return {
                ...folder,
                count: count || 0,
                lastAdded: recentPaper ? formatLastAdded(recentPaper.created_at) : '暂无'
            };
        })
    );

    res.json(foldersWithCount);
});

// 格式化最后添加时间
function formatLastAdded(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffHours < 1) return '刚刚';
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffWeeks < 4) return `${diffWeeks}周前`;
    return '很久以前';
}

// 获取单个文件夹
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return res.status(404).json({ error: '文件夹未找到' });
    }
    res.json(data);
});

// 获取文件夹内的论文
router.get('/:id/papers', async (req: Request, res: Response) => {
    const { id } = req.params;

    // 特殊处理 "all" - 返回所有论文
    if (id === 'all') {
        const { data, error } = await supabase
            .from('papers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.json(data);
    }

    const { data, error } = await supabase
        .from('papers')
        .select('*')
        .eq('folder_id', id)
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// 创建文件夹
router.post('/', async (req: Request, res: Response) => {
    const folder = req.body;
    const { data, error } = await supabase
        .from('folders')
        .insert([folder])
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
});

// 更新文件夹
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
        .from('folders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.json(data);
});

// 删除文件夹
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(204).send();
});

export default router;
