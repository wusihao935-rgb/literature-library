// 前端 API 服务层
// 用于与后端 API 交互

const API_BASE_URL = 'http://localhost:3002/api';

// 通用请求函数
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: '请求失败' }));
        throw new Error(error.error || '请求失败');
    }

    // 处理 204 No Content 响应
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

// ==================== 论文 API ====================

export interface Paper {
    id: string;
    title: string;
    authors: string;
    year: number;
    arxiv_id?: string;
    type: 'PDF' | 'EPUB';
    progress: number;
    image_url: string;
    conference?: string;
    abstract?: string;
    folder_id?: string;
    pdf_url?: string;  // 添加 PDF URL
    created_at?: string;
    updated_at?: string;
}

// 将数据库格式转换为前端格式
function transformPaper(dbPaper: Paper): Paper & { arxivId?: string; imageUrl: string; folderId?: string; pdfUrl?: string } {
    return {
        ...dbPaper,
        arxivId: dbPaper.arxiv_id,
        imageUrl: dbPaper.image_url,
        folderId: dbPaper.folder_id,
        pdfUrl: dbPaper.pdf_url,  // 添加 pdfUrl 映射
    };
}

export const papersApi = {
    // 获取所有论文
    getAll: async () => {
        const papers = await request<Paper[]>('/papers');
        return papers.map(transformPaper);
    },

    // 获取最近阅读的论文
    getRecent: async () => {
        const papers = await request<Paper[]>('/papers/recent');
        return papers.map(transformPaper);
    },

    // 获取单篇论文
    getById: async (id: string) => {
        const paper = await request<Paper>(`/papers/${id}`);
        return transformPaper(paper);
    },

    // 创建论文
    create: async (paper: Omit<Paper, 'id' | 'created_at' | 'updated_at'>) => {
        const created = await request<Paper>('/papers', {
            method: 'POST',
            body: JSON.stringify(paper),
        });
        return transformPaper(created);
    },

    // 更新论文
    update: async (id: string, updates: Partial<Paper>) => {
        const updated = await request<Paper>(`/papers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return transformPaper(updated);
    },

    // 更新阅读进度
    updateProgress: async (id: string, progress: number) => {
        const updated = await request<Paper>(`/papers/${id}/progress`, {
            method: 'PUT',
            body: JSON.stringify({ progress }),
        });
        return transformPaper(updated);
    },

    // 删除论文
    delete: async (id: string) => {
        await request(`/papers/${id}`, { method: 'DELETE' });
    },

    // 搜索论文
    search: async (query: string) => {
        const papers = await request<Paper[]>(`/papers/search/${encodeURIComponent(query)}`);
        return papers.map(transformPaper);
    },
};

// ==================== 文件夹 API ====================

export interface Folder {
    id: string;
    name: string;
    color: string;
    icon: string;
    count: number;
    lastAdded: string;
    created_at?: string;
    updated_at?: string;
}

export const foldersApi = {
    // 获取所有文件夹
    getAll: async (): Promise<Folder[]> => {
        return request<Folder[]>('/folders');
    },

    // 获取单个文件夹
    getById: async (id: string): Promise<Folder> => {
        return request<Folder>(`/folders/${id}`);
    },

    // 获取文件夹内的论文
    getPapers: async (id: string) => {
        const papers = await request<Paper[]>(`/folders/${id}/papers`);
        return papers.map(transformPaper);
    },

    // 创建文件夹
    create: async (folder: Omit<Folder, 'id' | 'count' | 'lastAdded' | 'created_at' | 'updated_at'>): Promise<Folder> => {
        return request<Folder>('/folders', {
            method: 'POST',
            body: JSON.stringify(folder),
        });
    },

    // 更新文件夹
    update: async (id: string, updates: Partial<Folder>): Promise<Folder> => {
        return request<Folder>(`/folders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    // 删除文件夹
    delete: async (id: string): Promise<void> => {
        await request(`/folders/${id}`, { method: 'DELETE' });
    },
};

// ==================== 作者 API ====================

export interface Author {
    id: string;
    name: string;
    role: string;
    citations: string;
    hIndex: number;
    papersCount: number;
    bio: string;
    avatarUrl: string;
    education: {
        institution: string;
        degree: string;
        years: string;
        advisor?: string;
    }[];
    contributions: {
        title: string;
        description: string;
        tags: string[];
        stats: string;
    }[];
}

export const authorsApi = {
    // 获取所有作者
    getAll: async (): Promise<Author[]> => {
        return request<Author[]>('/authors');
    },

    // 获取单个作者
    getById: async (id: string): Promise<Author> => {
        return request<Author>(`/authors/${id}`);
    },

    // 创建作者
    create: async (author: Omit<Author, 'id'>): Promise<Author> => {
        return request<Author>('/authors', {
            method: 'POST',
            body: JSON.stringify(author),
        });
    },

    // 更新作者
    update: async (id: string, updates: Partial<Author>): Promise<Author> => {
        return request<Author>(`/authors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    // 删除作者
    delete: async (id: string): Promise<void> => {
        await request(`/authors/${id}`, { method: 'DELETE' });
    },
};

// ==================== 健康检查 ====================

export const healthApi = {
    check: async (): Promise<{ status: string; timestamp: string }> => {
        return request('/health');
    },
};
