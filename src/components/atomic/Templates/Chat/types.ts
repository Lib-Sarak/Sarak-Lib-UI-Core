export interface SarakChatModelRoute {
  model: string;
  provider: string;
  display_name: string;
  capabilities: string[];
  tier: string;
  score?: number;
}

export type ModelRoute = SarakChatModelRoute;

export interface SarakChatSendRequest {
  message: string;
  attachments: File[];
  mode: 'auto' | 'manual';
  model: SarakChatModelRoute | null;
  maxTokens: number;
}

export type SarakChatOnSend = (
  request: SarakChatSendRequest,
  onToken: (token: string) => void,
) => Promise<void>;

export type SarakChatModelLoader = () => Promise<SarakChatModelRoute[]>;

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
