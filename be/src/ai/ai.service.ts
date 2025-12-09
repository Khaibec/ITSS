import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private readonly http: HttpService) { }

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
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-1.5-flash",
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

  async reviewMessage(message: string, userLanguage: string = 'en'): Promise<any> {
    const apiKey = (process.env.GOOGLE_STUDIO_API_KEY || '').replace(/['"]+/g, '').trim();
    const model = (process.env.GOOGLE_MODEL_NAME || 'gemini-1.5-flash').replace(/['"]+/g, '').trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Normalize and determining language
    const lang = (userLanguage || '').toUpperCase().trim();
    let explanationLang = 'English'; // Default

    // Explicitly handle Vietnamese cases
    // Include the default 'VN' from controller, and other variations
    if (['VN', 'VIETNAM', 'VIETNAMESE', 'VI', 'VMI', 'VIET NAM'].includes(lang)) {
      explanationLang = 'Vietnamese';
    }
    // Explicitly handle Japanese cases
    else if (['JP', 'JAPAN', 'JAPANESE', 'JA', 'JPN'].includes(lang)) {
      explanationLang = 'Japanese';
    }

    const prompt = `
      You are a polite and helpful language assistant.
      Analyze the following message for "naturalness" and "risk of misunderstanding" (misinterpretation).
      
      Message: "${message}"

      IMPORTANT: You MUST provide the analysis (Warning and Suggestion) in the ${explanationLang} language, regardless of the language of the input message.

      Please return the result in JSON format ONLY, without any markdown code block markers. 
      The JSON structure must be:
      {
        "warning": "Risk or unnatural points (string, if none, put null or empty string)",
        "suggestion": "Improved/More natural version (string)"
      }
    `;

    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    // List of models to try in order
    const modelsToTry = [
      model, // Primary from env
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-1.5-flash",
    ];
    // Remove duplicates and empty strings
    const uniqueModels = [...new Set(modelsToTry)].filter(m => m);

    let lastError: any = null;

    for (const currentModel of uniqueModels) {
      try {
        this.logger.debug(`Reviewing with model: ${currentModel}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

        const response = await firstValueFrom(this.http.post(url, body));
        return this.processResponse(response.data);

      } catch (error) {
        const status = error.response?.status;
        this.logger.warn(`Model ${currentModel} failed with status: ${status || error.message}`);
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
}

