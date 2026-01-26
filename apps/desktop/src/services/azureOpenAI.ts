/**
 * Azure OpenAI 服务 - 用于邮件生成和文本调优
 */

export interface AzureOpenAIConfig {
  endpoint: string;
  key: string;
  deploymentName: string;
}

export interface EmailGenerateRequest {
  topic: string;
  language: 'en' | 'zh';
  tone?: 'formal' | 'casual' | 'friendly';
}

export interface EmailGenerateResponse {
  content: string;
}

export interface RefineTextRequest {
  text: string;
  language: 'en' | 'zh';
}

export interface RefineTextResponse {
  content: string;
}

export async function loadOpenAIConfigFromStore(): Promise<AzureOpenAIConfig | null> {
  try {
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load('settings.json');
    const endpoint = await store.get<string>('azureOpenAI.endpoint');
    const key = await store.get<string>('azureOpenAI.key');
    const deploymentName = await store.get<string>('azureOpenAI.deploymentName');

    if (!endpoint || !key || !deploymentName) return null;
    return {
      endpoint,
      key,
      deploymentName,
    };
  } catch {
    // Fallback to localStorage in browser
    try {
      const endpoint = localStorage.getItem('ttpin.azureOpenAI.endpoint');
      const key = localStorage.getItem('ttpin.azureOpenAI.key');
      const deploymentName = localStorage.getItem('ttpin.azureOpenAI.deploymentName');
      
      if (!endpoint || !key || !deploymentName) return null;
      return {
        endpoint: JSON.parse(endpoint),
        key: JSON.parse(key),
        deploymentName: JSON.parse(deploymentName),
      };
    } catch {
      return null;
    }
  }
}

export class AzureOpenAIService {
  private config: AzureOpenAIConfig | null = null;

  setConfig(config: AzureOpenAIConfig) {
    this.config = config;
  }

  getConfig(): AzureOpenAIConfig | null {
    return this.config;
  }

  isConfigured(): boolean {
    return (
      this.config !== null &&
      !!this.config.endpoint &&
      !!this.config.key &&
      !!this.config.deploymentName
    );
  }

  private buildEmailPrompt(request: EmailGenerateRequest): string {
    const langInstruction = request.language === 'zh' 
      ? '请用中文撰写邮件。'
      : 'Please write the email in English.';
    
    const toneMap = {
      formal: request.language === 'zh' ? '正式' : 'formal',
      casual: request.language === 'zh' ? '随意' : 'casual',
      friendly: request.language === 'zh' ? '友好' : 'friendly',
    };
    
    const tone = toneMap[request.tone || 'formal'];
    
    const prompt = request.language === 'zh'
      ? `你是一个专业的邮件写作助手,请你按照我的身份（Azure AI Support Engineer）。请根据以下主题撰写一封${tone}的邮件。

主题/要点：${request.topic}

要求：
1. ${langInstruction}
2. 邮件格式要规范，包含问候语和结束语
3. 语气${tone}，表达清晰
4. 直接输出邮件内容，不需要额外解释`
      : `You are a professional email writing assistant. Please write a ${tone} email based on the following topic.

Topic/Key points: ${request.topic}

Requirements:
1. ${langInstruction}
2. Use proper email format with greeting and closing
3. Keep the tone ${tone} and clear
4. Output the email content directly without additional explanation`;

    return prompt;
  }

  async generateEmail(request: EmailGenerateRequest): Promise<EmailGenerateResponse> {
    if (!this.isConfigured()) {
      throw new Error('Azure OpenAI 未配置，请先在设置中配置。');
    }

    const config = this.config!;
    const prompt = this.buildEmailPrompt(request);

    // Try to use Tauri invoke first
    let mod: typeof import('@tauri-apps/api/core');
    try {
      mod = await import('@tauri-apps/api/core');
      if (!mod.invoke) {
        throw new Error('Tauri invoke not available');
      }
    } catch {
      throw new Error('邮件生成功能需要在 Tauri 桌面应用中运行。请安装 Rust 后运行 `npm -w @ttpin/desktop run tauri:dev`');
    }

    const result = await mod.invoke<{ content: string }>('openai_chat', {
      args: {
        endpoint: config.endpoint,
        key: config.key,
        deployment_name: config.deploymentName,
        messages: [
          { role: 'user', content: prompt }
        ],
      },
    });

    return { content: result.content };
  }

  private buildRefinePrompt(request: RefineTextRequest): string {
    const prompt = request.language === 'zh'
      ? `你是一个专业的文本编辑助手。请帮我优化以下文本：

原文：${request.text}

要求：
1. 修正错别字和标点符号错误
2. 调整语法结构，使表达更加流畅
3. 优化用词，使表达更加精准
4. 保持原文的核心意思不变
5. 直接输出优化后的文本，不需要额外解释`
      : `You are a professional text editor. Please refine the following text:

Original: ${request.text}

Requirements:
1. Fix typos and punctuation errors
2. Adjust grammar structure for better flow
3. Optimize word choice for precision
4. Keep the original meaning intact
5. Output the refined text directly without additional explanation`;

    return prompt;
  }

  async refineText(request: RefineTextRequest): Promise<RefineTextResponse> {
    if (!this.isConfigured()) {
      throw new Error('Azure OpenAI 未配置，请先在设置中配置。');
    }

    const config = this.config!;
    const prompt = this.buildRefinePrompt(request);

    // Try to use Tauri invoke
    let mod: typeof import('@tauri-apps/api/core');
    try {
      mod = await import('@tauri-apps/api/core');
      if (!mod.invoke) {
        throw new Error('Tauri invoke not available');
      }
    } catch {
      throw new Error('调优功能需要在 Tauri 桌面应用中运行。请安装 Rust 后运行 `npm -w @ttpin/desktop run tauri:dev`');
    }

    const result = await mod.invoke<{ content: string }>('openai_chat', {
      args: {
        endpoint: config.endpoint,
        key: config.key,
        deployment_name: config.deploymentName,
        messages: [
          { role: 'user', content: prompt }
        ],
      },
    });

    return { content: result.content };
  }
}

export const openAIService = new AzureOpenAIService();
