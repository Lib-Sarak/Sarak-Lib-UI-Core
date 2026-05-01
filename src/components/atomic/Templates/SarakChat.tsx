import React from 'react';
import { useSarakChat } from './Chat/useSarakChat';
import { ChatHeader } from './Chat/ChatHeader';
import { MessageList } from './Chat/MessageList';
import { ChatInput } from './Chat/ChatInput';

interface SarakChatProps {
  endpoint: string;
  modelsEndpoint?: string;
  label?: string;
  role?: 'primary' | 'secondary' | 'neutral' | 'accent';
  density?: 'compact' | 'standard' | 'spacious';
  importance?: 'hero' | 'base' | 'subtle';
}

export const SarakChat: React.FC<SarakChatProps> = ({ 
  endpoint, 
  modelsEndpoint = '/llm-test-chat/models',
  label = 'Sarak AI Chat Lab'
}) => {
  const chat = useSarakChat(endpoint, modelsEndpoint);

  return (
    <div className="flex flex-col h-[600px] bg-theme-card border-theme group/chat transition-all rounded-theme" style={{ transitionDuration: 'var(--animation-speed, 0.5s)' }}>
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .custom-scrollbar-h::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar-h::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-h::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

