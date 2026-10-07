import React from 'react';
import { useSarakChat } from './Chat/useSarakChat';
import { ChatHeader } from './Chat/ChatHeader';
import { MessageList } from './Chat/MessageList';
import { ChatInput } from './Chat/ChatInput';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import type { SarakChatModelLoader, SarakChatOnSend } from './Chat/types';

export type {
  SarakChatModelLoader,
  SarakChatModelRoute,
  SarakChatOnSend,
  SarakChatSendRequest,
} from './Chat/types';

export interface SarakChatProps {
  /** O host envia a mensagem e encaminha cada token recebido ao callback. */
  onSend: SarakChatOnSend;
  /** Carrega modelos do host; omitido, a lista permanece vazia. */
  loadModels?: SarakChatModelLoader;
  /** Nome exibido no cabeçalho; omitido, usa `AI Chat`. */
  label?: string;
  /** Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. */
  role?: 'primary' | 'secondary' | 'neutral' | 'accent';
  /** Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. */
  density?: 'compact' | 'standard' | 'spacious';
  /** Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. */
  importance?: 'hero' | 'base' | 'subtle';
}

export const SarakChat: React.FC<SarakChatProps> = ({ 
  onSend,
  loadModels,
  label = 'AI Chat'
}) => {
  const chat = useSarakChat(onSend, loadModels);
  const { design } = useSarakUI();
  const { getFlexStyles } = useStructuralStyles();
  const cardTextureType = design?.cardTextureType || 'none';
  const stack = getFlexStyles('column', undefined, undefined, '0px');

  return (
    <div
      className={`sarak-card ${stack.className} h-full min-h-0 group/chat transition-all !p-0`}
      data-sx-card-texture-type={cardTextureType}
      style={{
        ...stack.style,
        transitionDuration: 'var(--sarak-chat-anim-speed, 0.05s)'
      }}
    >
      <ChatHeader 
        label={label} 
        mode={chat.mode} 
        setMode={chat.setMode} 
        clearChat={chat.clearChat} 
      />

      <MessageList 
        messages={chat.messages} 
        isLoading={chat.isLoading} 
        isProcessingFiles={chat.isProcessingFiles} 
        scrollRef={chat.scrollRef} 
      />

      <ChatInput 
        input={chat.input}
        setInput={chat.setInput}
        attachments={chat.attachments}
        removeAttachment={chat.removeAttachment}
        handleSend={chat.handleSend}
        isLoading={chat.isLoading}
        mode={chat.mode}
        availableModels={chat.availableModels}
        selectedRoute={chat.selectedRoute}
        setSelectedRoute={chat.setSelectedRoute}
        showModelPicker={chat.showModelPicker}
        setShowModelPicker={chat.setShowModelPicker}
        modelSearch={chat.modelSearch}
        setModelSearch={chat.setModelSearch}
        maxTokens={chat.maxTokens}
        setMaxTokens={chat.setMaxTokens}
        fileInputRef={chat.fileInputRef}
        handleFileSelect={chat.handleFileSelect}
      />
    </div>
  );
};
