
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getPaperInsights = async (title: string, abstract: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析以下论文标题和摘要，并提供四个维度的洞察：研究目标、方法论、核心发现、以及作者背景。
      标题: ${title}
      摘要: ${abstract}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING, description: "研究的主要目标" },
            methodology: { type: Type.STRING, description: "所采用的方法" },
            findings: { type: Type.STRING, description: "核心研究发现" },
            authorInsight: { type: Type.STRING, description: "关于作者的洞察" }
          },
          required: ["objective", "methodology", "findings", "authorInsight"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const chatAboutPaper = async (title: string, abstract: string, history: {role: string, text: string}[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `你是一个专业的科研助手。你正在协助用户阅读一篇题为《${title}》的论文。
        摘要内容如下：${abstract}
        你的目标是回答关于这篇论文的具体问题，提供深入的解释、背景知识，并帮助用户批判性地思考研究内容。
        请保持回答简洁、专业且富有启发性。`,
      },
    });

    // Note: We're not using standard SDK history format here for simplicity in this specific helper
    // but the actual sendMessage call just needs the text.
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "抱歉，由于连接问题，我暂时无法回答。请稍后再试。";
  }
};
