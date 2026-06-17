import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Cpu, Search } from 'lucide-react';
import { Message } from './types';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';

interface MessageBubbleProps {
  msg: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ msg }) => {
  const { design } = useSarakUI();
  const { chatBubbleStyle = 'glass', chatBubbleRadius, chatUserBg } = design || {};
  const isUser = msg.role === 'user';

  const bubbleStyle: React.CSSProperties = {
    padding: 'calc(var(--sx-spacing-md) / 1.5)',
    transitionDuration: 'var(--sarak-chat-anim-speed, 0.05s)',
  };

  // Cantos arredondados dinâmicos e cores data-driven
  if (isUser) {
    bubbleStyle.borderRadius = 'var(--sarak-chat-radius, 12px) 0px var(--sarak-chat-radius, 12px) var(--sarak-chat-radius, 12px)';
    bubbleStyle.backgroundColor = 'var(--sarak-chat-user-bg, var(--sx-color-primary-base))';
    bubbleStyle.borderColor = 'var(--theme-primary-border, transparent)';
  } else {
    bubbleStyle.borderRadius = '0px var(--sarak-chat-radius, 12px) var(--sarak-chat-radius, 12px) var(--sarak-chat-radius, 12px)';
    
    if (chatBubbleStyle === 'minimal') {
      bubbleStyle.backgroundColor = 'transparent';
      bubbleStyle.borderColor = 'transparent';
      bubbleStyle.padding = '0';
    } else if (chatBubbleStyle === 'solid') {
      bubbleStyle.backgroundColor = 'var(--sx-color-primary-base)';
      bubbleStyle.borderColor = 'transparent';
      bubbleStyle.color = 'var(--sx-color-primary-text)';
    } else {
      // glass (default)
      bubbleStyle.backgroundColor = 'var(--sarak-card-bg, var(--sx-color-surface-base))';
      bubbleStyle.borderColor = 'var(--sarak-card-border-color, var(--sx-color-border-base))';
      bubbleStyle.backdropFilter = 'blur(var(--sarak-card-backdrop-blur, 10px))';
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`} style={{ gap: 'calc(var(--sx-spacing-md) / 2)' }}>
        <div className="flex items-center gap-2 px-1">
          {msg.role === 'assistant' ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[var(--sx-color-primary-base)] flex items-center justify-center">
                 <Bot size={12} className="text-[var(--sx-color-primary-text)]" />
              </div>
              <span className="text-2xs font-bold text-[var(--sx-color-text-muted)] uppercase tracking-widest">Sarak Assistant</span>
            </div>
          ) : (
            <span className="text-2xs font-bold text-[var(--sx-color-primary-base)] uppercase tracking-widest">Requisitante</span>
          )}
        </div>

        <div 
          className={`shadow-xl border text-[var(--sx-color-text-title)] transition-all`}
          style={bubbleStyle}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>

        {msg.metadata && (
          <div className="flex flex-wrap gap-2 mt-1">
            {msg.metadata.model && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--sx-color-text-muted)]/10 border border-[var(--sx-color-border-base)] rounded-md text-2xs font-mono text-[var(--sx-color-text-muted)]">
                <Cpu size={10} className="text-[var(--sx-color-primary-base)]" />
                {msg.metadata.model}
              </div>
            )}
            {msg.metadata.reasoning && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--sx-color-text-muted)]/10 border border-[var(--sx-color-border-base)] rounded-md text-2xs font-medium text-[var(--sx-color-text-muted)] italic">
                <Search size={10} />
                {msg.metadata.reasoning}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

