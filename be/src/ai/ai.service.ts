import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private reviewCache = new Map<string, any>(); // Simple in-memory cache

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService
  ) { }

  async explain(message: string): Promise<string> {
    // Lấy API Key ở ngoài khối try để dùng được trong cả catch
    const apiKey = (process.env.GOOGLE_STUDIO_API_KEY || '').trim();
    const primaryModel = (process.env.GOOGLE_MODEL_NAME || 'gemini-2.5-flash').trim();

    const body = {
      contents: [
        {
          parts: [{ text: `"${message}"` }]
        }
      ]
    };

    // List of models to try in order
    const modelsToTry = [
      primaryModel, // Primary from env
      "gemini-1.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-pro",
    ];
    // Remove duplicates and empty strings
    const uniqueModels = [...new Set(modelsToTry)].filter(m => m);

    let lastError: any = null;

    for (const currentModel of uniqueModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
        this.logger.log(`Prompt sent to Gemini model "${currentModel}": ${message}`);

        const response = await firstValueFrom(this.http.post(url, body));
        return this.extractText(response.data) || 'Không có nội dung trả về.';

      } catch (error) {
        const status = error.response?.status;
        const errDetail = error.response?.data?.error || error.message;

        this.logger.warn(`Model ${currentModel} failed with status: ${status} - ${JSON.stringify(errDetail)}`);
        lastError = error;

        // If error is 429 (Rate Limit), 404 (Not Found), 500/503 (Server Error), continue to next model
        if ([429, 404, 500, 503].includes(status) || !status) {
          continue;
        } else {
          // If unauthorized (401) or Bad Request (400), likely a key/prompt issue, so stop.
          break;
        }
      }
    }

    // All failed logic
    this.logger.error(`All models failed in explain(). Last error: ${JSON.stringify(lastError?.response?.data || lastError?.message)}`);

    // Nếu lỗi 404 (Model not found), gọi API check danh sách model
    if (lastError?.response?.status === 404) {
      await this.logAvailableModels(apiKey);
    }

    return 'Lỗi kết nối AI.';
  }

  /**
   * Hàm phụ trợ: Lấy danh sách model khả dụng cho Key hiện tại
   */
  private async logAvailableModels(apiKey: string) {
    try {
      this.logger.warn('--- Đang kiểm tra danh sách Model khả dụng cho Key này ---');
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

      const response = await firstValueFrom(this.http.get(listUrl));

      const modelNames = response.data.models.map((m: any) => m.name);
      this.logger.warn(`DANH SÁCH MODEL TÌM THẤY:\n${JSON.stringify(modelNames, null, 2)}`);

      this.logger.warn('Hãy copy một trong các tên trên (bỏ tiền tố "models/") vào file .env');
    } catch (listError) {
      this.logger.error('Không thể lấy danh sách model. Có thể Key sai hoặc chưa kích hoạt API.');
    }
  }

  private extractText(data: any): string | null {
    try {
      return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch {
      return null;
    }
  }

  async reviewMessage(message: string, userLanguage: string = 'en', userId?: number, groupId?: number): Promise<any> {
    // 1. Check Cache
    const cacheKey = userId ? `${userId}:${message.trim()}` : null;
    if (cacheKey && this.reviewCache.has(cacheKey)) {
      this.logger.log(`Serving review from cache for user ${userId}`);
      return this.reviewCache.get(cacheKey);
    }

    const apiKey = (process.env.GOOGLE_STUDIO_API_KEY || '').replace(/['"]+/g, '').trim();
    const model = (process.env.GOOGLE_MODEL_NAME || 'gemini-2.5-flash').replace(/['"]+/g, '').trim();

    // Normalize language
    const lang = (userLanguage || '').toUpperCase().trim();
    let explanationLang = 'English';
    let suggestionLangRules = '';

    // Handle Vietnamese cases
    if (['VN', 'VIETNAM', 'VIETNAMESE', 'VI', 'VMI', 'VIET NAM'].includes(lang)) {
      explanationLang = 'Vietnamese';
      suggestionLangRules = 'However, the "suggestion" field MUST be in accurate, natural JAPANESE (the target language users are learning). The "warning" field should be in Vietnamese.';
    }
    // Handle Japanese cases
    else if (['JP', 'JAPAN', 'JAPANESE', 'JA', 'JPN'].includes(lang)) {
      explanationLang = 'Japanese';
    }

    // 2. Fetch Context (Previous Messages)
    let contextStr = '';
    if (groupId) {
      try {
        const history = await this.prisma.messages.findMany({
          where: { group_id: Number(groupId) },
          orderBy: { created_at: 'desc' },
          take: 5,
          include: { sender: { select: { name: true } } }
        });
        // Reverse to chronological order
        contextStr = history.reverse().map(m => `${m.sender?.name || 'User'}: ${m.content}`).join('\n');
        if (contextStr) {
          contextStr = `\nContext (Last 5 messages):\n${contextStr}\n---\n`;
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch context for group ${groupId}: ${err.message}`);
      }
    }

    const prompt = `
      You are a polite and helpful language assistant used in a chat application.
      Analyze the following message for "naturalness" and "risk of misunderstanding" (misinterpretation).
      
      ${contextStr}
      Target Message to Review: "${message}"

      IMPORTANT: 
      1. Provide the analysis (Warning) in the ${explanationLang} language.
      2. ${suggestionLangRules}

      Please return the result in JSON format ONLY, without any markdown code block markers. 
      The JSON structure must be:
      {
        "warning": "Risk or unnatural points (string). If the message is completely natural, put null or empty string.",
        "suggestion": "Improved/More natural version (string). Must be in the target language (usually Japanese)."
      }
    `;

    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    // List of models to try in order
    const modelsToTry = [
      model, // Primary from env
      "gemini-1.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-pro",
    ];
    // Remove duplicates and empty strings
    const uniqueModels = [...new Set(modelsToTry)].filter(m => m);

    let lastError: any = null;

    for (const currentModel of uniqueModels) {
      try {
        this.logger.debug(`Reviewing with model: ${currentModel}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

        const response = await firstValueFrom(this.http.post(url, body));
        const result = this.processResponse(response.data);

        // Cache Success Result
        if (cacheKey && result && result.suggestion !== undefined) {
          this.reviewCache.set(cacheKey, result);
        }
        return result;

      } catch (error) {
        const status = error.response?.status;
        this.logger.warn(`Model ${currentModel} failed with status: ${status || error.message}`);
        lastError = error;

        // If error is 429 (Rate Limit), 404 (Not Found), 500/503 (Server Error), continue to next model
        if ([429, 404, 500, 503].includes(status) || !status) {
          continue;
        } else {
          break;
        }
      }
    }

    // All failed
    this.logger.error(`All models failed. Last error: ${lastError?.message}`);

    if (lastError?.response?.status === 404) {
      await this.logAvailableModels(apiKey);
    }

    return { warning: 'System Busy', suggestion: '' };
  }

  private processResponse(data: any): any {
    const text = this.extractText(data);
    if (!text) return { warning: 'AI Error', suggestion: '' };

    // Parse JSON
    try {
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      return { warning: null, suggestion: text }; // Fallback
    }
  }

  async extractAndSaveLearningDiary(
    message: string,
    nationality: string,
    userId: number,
    groupId?: number,
  ): Promise<{
    message: string;
    diary: {
      diary_id: number;
      title: string | null;
      situation: string | null;
      learning_content: string | null;
      learning_date: Date;
    };
  }> {
    const apiKey = (process.env.GOOGLE_STUDIO_API_KEY || '')
      .replace(/['"]+/g, '')
      .trim();

    const model = (process.env.GOOGLE_MODEL_NAME || 'gemini-2.5-flash')
      .replace(/['"]+/g, '')
      .trim();

    if (!apiKey) throw new Error('Missing GOOGLE_STUDIO_API_KEY');


    const lang = (nationality || '').toUpperCase().trim();
    let explanationLang = 'English';
    let targetLangHint = 'Japanese';

    if (['VN', 'VI', 'VIETNAM', 'VIETNAMESE', 'VIET NAM'].includes(lang)) {
      explanationLang = 'Vietnamese';
      targetLangHint = 'Japanese';
    } else if (['JP', 'JA', 'JPN', 'JAPAN', 'JAPANESE'].includes(lang)) {
      explanationLang = 'Japanese';
      targetLangHint = 'Japanese';
    }


    let contextStr = '';
    if (groupId) {
      try {
        const history = await this.prisma.messages.findMany({
          where: { group_id: Number(groupId) },
          orderBy: { created_at: 'desc' },
          take: 5,
          include: { sender: { select: { name: true } } },
        });

        contextStr = history
          .reverse()
          .map(m => `${m.sender?.name || 'User'}: ${m.content}`)
          .join('\n');

        if (contextStr)
          contextStr = `\nContext (last 5 messages):\n${contextStr}\n---\n`;
      } catch (err) {
        this.logger.warn(
          `Failed to fetch context for diary extract: ${err.message}`,
        );
      }
    }


    const prompt = `
You are a language learning assistant.

Extract a LEARNING DIARY entry from the following message:

${contextStr}
Target message:
"${message}"

Rules:
- Title: short, clear, suitable for list display.
- Situation: describe the situation in first-person ("Khi tôi...").
- Learning content:
  - Explain the problem
  - Give correct / incorrect short examples
  - Clear and educational
- Explanation language: ${explanationLang}
- Examples must be in ${targetLangHint}.
- Return JSON ONLY, no markdown.

JSON schema:
{
  "title": string,
  "situation": string,
  "learning_content": string
}
`;

    const body = { contents: [{ parts: [{ text: prompt }] }] };


    let aiText: string | null = null;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await firstValueFrom(this.http.post(url, body));
      aiText = this.extractText(response.data);
    } catch (err) {
      this.logger.error(`[Diary AI] Model ${model} failed: ${err.message}`);
      throw new Error('AI extract failed');
    }

    if (!aiText) {
      this.logger.error('AI returned empty response');
      throw new Error('AI extract failed');
    }


    let parsed: { title?: string; situation?: string; learning_content?: string };
    try {
      parsed = JSON.parse(aiText.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
      this.logger.error('Invalid JSON from AI', aiText);
      throw new Error('AI returned invalid JSON');
    }

    const diary = await this.prisma.learning_diaries.create({
      data: {
        user_id: userId,
        title: parsed.title || '学習メモ',
        situation: parsed.situation || null,
        learning_content: parsed.learning_content || null,
        learning_date: new Date(),
      },
    });

    return {
      message: '保存に成功しました',
      diary: {
        diary_id: diary.diary_id,
        title: diary.title,
        situation: diary.situation,
        learning_content: diary.learning_content,
        learning_date: diary.learning_date,
      },
    };
  }
}

