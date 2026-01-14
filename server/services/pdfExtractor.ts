// PDF 文本提取和 AI 信息分析服务
import { GoogleGenAI } from '@google/genai';

// 初始化 Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface ExtractedPaperInfo {
    title: string;
    authors: string;
    year: number | null;
    arxivId: string | null;
    conference: string | null;
    abstract: string | null;
    type: string;
}

// 使用 Gemini 分析 PDF 内容并提取信息
export async function extractPaperInfoFromUrl(pdfUrl: string): Promise<ExtractedPaperInfo> {
    try {
        const prompt = `你是一个学术论文分析专家。请分析这个 PDF 论文的 URL: ${pdfUrl}

请从论文中提取以下信息，并以 JSON 格式返回（只返回 JSON，不要有其他文字）：

{
  "title": "论文标题",
  "authors": "作者列表（用逗号分隔）",
  "year": 发表年份（数字，如果无法确定则为 null）,
  "arxivId": "arXiv ID（如果有的话，否则为 null）",
  "conference": "发表的会议或期刊名称（如果有的话，否则为 null）",
  "abstract": "论文摘要",
  "type": "PDF"
}

如果无法访问 PDF 或提取信息失败，请根据 URL 中的信息尽可能推断，并返回合理的默认值。`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        const text = response.text || '';

        // 解析 JSON 响应
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title || '未知标题',
                authors: parsed.authors || '未知作者',
                year: parsed.year || null,
                arxivId: parsed.arxivId || null,
                conference: parsed.conference || null,
                abstract: parsed.abstract || null,
                type: parsed.type || 'PDF',
            };
        }

        throw new Error('无法解析 AI 响应');
    } catch (error) {
        console.error('AI 提取失败:', error);

        // 返回从 URL 推断的默认值
        const filename = pdfUrl.split('/').pop() || 'unknown';
        return {
            title: filename.replace('.pdf', '').replace(/_/g, ' '),
            authors: '未知作者',
            year: new Date().getFullYear(),
            arxivId: null,
            conference: null,
            abstract: null,
            type: 'PDF',
        };
    }
}
