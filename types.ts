
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: FileAttachment[];
  videoUrl?: string; // URL to the generated MP4
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data?: string; // Base64
  previewUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  personaId: string;
  updatedAt: number;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  systemInstruction: string;
  avatar: string;
  category: 'General' | 'Professional' | 'Creative' | 'Technical' | 'Custom';
  color?: string;
  isCustom?: boolean;
  cognitiveBiases?: string;
  emotionalState?: string;
  communicationStyle?: string;
  mode?: 'chat' | 'video';
}

export enum ViewState {
  CHAT = 'chat',
  PERSONA_HUB = 'persona_hub',
  CREATE_PERSONA = 'create_persona',
  VIDEO_LAB = 'video_lab',
  ADMIN = 'admin'
}
