// 文件上传服务
import { supabase } from './auth';

const API_BASE_URL = 'http://localhost:3002/api';

// 上传 PDF 文件到 Supabase Storage
export async function uploadPdfFile(file: File): Promise<{ url: string; path: string } | null> {
    try {
        // 生成唯一文件名
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `uploads/${timestamp}_${sanitizedName}`;

        // 上传到 Supabase Storage
        const { data, error } = await supabase.storage
            .from('papers')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('上传失败:', error);
            return null;
        }

        // 获取公开 URL
        const { data: urlData } = supabase.storage
            .from('papers')
            .getPublicUrl(data.path);

        return {
            url: urlData.publicUrl,
            path: data.path,
        };
    } catch (error) {
        console.error('上传异常:', error);
        return null;
    }
}

// 删除文件
export async function deletePdfFile(path: string): Promise<boolean> {
    try {
        const { error } = await supabase.storage
            .from('papers')
            .remove([path]);

        return !error;
    } catch (error) {
        console.error('删除失败:', error);
        return false;
    }
}

// 从文件名解析论文信息（作为 AI 提取的后备方案）
function parseInfoFromFilename(filename: string): ExtractedPaperInfo {
    // 移除扩展名和时间戳前缀
    let name = filename.replace(/\.pdf$/i, '').replace(/^\d+_/, '');

    // 尝试从文件名提取年份
    const yearMatch = name.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? parseInt(yearMatch[0]) : null;

    // 尝试从文件名提取作者（常见格式：Author_Title 或 Author - Title）
    let authors = '未知作者';
    let title = name;

    if (name.includes(' - ')) {
        const parts = name.split(' - ');
        authors = parts[0].replace(/_/g, ' ').trim();
        title = parts.slice(1).join(' - ').trim();
    } else if (name.includes('_')) {
        // 尝试提取第一个下划线前的部分作为作者
        const parts = name.split('_');
        if (parts.length > 1) {
            const firstPart = parts[0];
            // 如果第一部分看起来像作者名（较短且首字母大写）
            if (firstPart.length < 30 && /^[A-Z]/.test(firstPart)) {
                authors = firstPart.replace(/([A-Z])/g, ' $1').trim();
                title = parts.slice(1).join(' ').replace(/_/g, ' ').trim();
            } else {
                title = name.replace(/_/g, ' ');
            }
        }
    }

    return {
        title: title || '未知标题',
        authors,
        year,
        arxivId: null,
        conference: null,
        abstract: null,
        type: 'PDF',
    };
}

// 使用 Gemini API 提取论文信息
export async function extractPaperInfo(pdfUrl: string, filename?: string): Promise<ExtractedPaperInfo> {
    try {
        const response = await fetch(`${API_BASE_URL}/papers/extract`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pdfUrl, filename }),
        });

        if (!response.ok) {
            throw new Error('提取失败');
        }

        const data = await response.json();

        // 如果返回的是默认值，尝试从文件名解析
        if (data.authors === '未知作者' && filename) {
            const parsed = parseInfoFromFilename(filename);
            return {
                ...data,
                title: data.title === '未知标题' ? parsed.title : data.title,
                authors: parsed.authors !== '未知作者' ? parsed.authors : data.authors,
                year: data.year || parsed.year,
            };
        }

        return data;
    } catch (error) {
        console.error('提取论文信息失败:', error);

        // 如果 API 调用失败，从文件名解析
        if (filename) {
            return parseInfoFromFilename(filename);
        }

        return {
            title: '未知标题',
            authors: '未知作者',
            year: null,
            arxivId: null,
            conference: null,
            abstract: null,
            type: 'PDF',
        };
    }
}

// 提取的论文信息类型
export interface ExtractedPaperInfo {
    title: string;
    authors: string;
    year: number | null;
    arxivId: string | null;
    conference: string | null;
    abstract: string | null;
    type: string;
}

