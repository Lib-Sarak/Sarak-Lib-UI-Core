export interface ModelRoute {
  model: string;
  provider: string;
  display_name: string;
  capabilities: string[];
  tier: string;
  score?: number;
}

export interface Attachment {
  file: File;
  name: string;
  type: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    model?: string;
    provider?: string;
    reasoning?: string;
  };
}
