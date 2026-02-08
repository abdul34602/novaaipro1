
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, FileAttachment } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

// Simple local logging system to replace the backend dependency
const getLogs = () => JSON.parse(localStorage.getItem('nova_activity_logs') || '[]');
const saveLog = (log: any) => {
  const logs = [log, ...getLogs()].slice(0, 100);
  localStorage.setItem('nova_activity_logs', JSON.stringify(logs));
  window.dispatchEvent(new Event('nova_logs_updated'));
};

export class GeminiService {
  private async logActivity(prompt: string, feature: string = "Chat", status: number = 200) {
    saveLog({
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      feature,
      prompt: prompt.length > 100 ? prompt.substring(0, 97) + "..." : prompt,
      status
    });
  }

  async *streamChat(
    history: Message[],
    currentMessage: string,
    attachments: FileAttachment[],
    systemInstruction: string,
    personaId: string
  ) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.logActivity(currentMessage, "Chat");
    
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const currentParts: any[] = [{ text: currentMessage }];
    
    for (const file of attachments) {
      if (file.data) {
        const mimeType = file.type || 'application/octet-stream';
        currentParts.push({
          inlineData: { mimeType, data: file.data.split(',')[1] }
        });
      }
    }

    contents.push({ role: 'user', parts: currentParts });

    const isAnalytical = ['code-master', 'aggressive-debater', 'default'].includes(personaId);
    const thinkingBudget = isAnalytical ? 12000 : 0;

    try {
      const stream = await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: isAnalytical ? 0.4 : 0.8,
          topP: 0.95,
          thinkingConfig: { thinkingBudget }
        },
      });

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) yield c.text;
      }
    } catch (error) {
      console.error("Neural Pipeline Failure:", error);
      this.logActivity(currentMessage, "Chat", 500);
      throw error;
    }
  }

  async generateVideo(prompt: string, aspectRatio: string = '16:9'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      this.logActivity(prompt, "Video", 200);

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio as any
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        throw new Error("Video generation failed: No download link returned.");
      }

      // Append API key as required by the documentation
      return `${downloadLink}&key=${process.env.API_KEY}`;
    } catch (error) {
      console.error("Video Generation Neural Failure:", error);
      this.logActivity(prompt, "Video", 500);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
