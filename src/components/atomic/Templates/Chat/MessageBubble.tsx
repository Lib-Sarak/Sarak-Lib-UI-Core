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
    padding: 'calc(var(--sarak-layout-gap-md,16px) / 1.5)',
    transitionDuration: 'var(--sarak-chat-anim-speed, 0.05s)',
  };

  // Cantos arredondados dinâmicos e cores data-driven
  if (isUser) {
    bubbleStyle.borderRadius = 'var(--sarak-chat-radius, 12px) 0px var(--sarak-chat-radius, 12px) var(--sarak-chat-radius, 12px)';
    bubbleStyle.backgroundColor = 'var(--sarak-chat-user-bg, var(--sarak-primary-color,#3b82f6))';
    bubbleStyle.borderColor = 'var(--theme-primary-border, transparent)';
  } else {
    bubbleStyle.borderRadius = '0px var(--sarak-chat-radius, 12px) var(--sarak-chat-radius, 12px) var(--sarak-chat-radius, 12px)';
    
    const strategies: Record<string, () => void> = {
      'minimal': () => {
        bubbleStyle.backgroundColor = 'transparent';
        bubbleStyle.borderColor = 'transparent';
        bubbleStyle.padding = '0';
      },
      'solid': () => {
        bubbleStyle.backgroundColor = 'var(--sarak-primary-color,#3b82f6)';
        bubbleStyle.borderColor = 'transparent';
        bubbleStyle.color = 'var(--sarak-primary-color,#3b82f6)';
      },
      'glass': () => {
        bubbleStyle.backgroundColor = 'var(--sarak-card-bg, var(--color-theme-card,#1e293b))';
        bubbleStyle.borderColor = 'var(--sarak-card-border-color, var(--border-color,#334155))';
        bubbleStyle.backdropFilter = 'blur(var(--sarak-card-backdrop-blur, 10px))';
      }
    };
    
    const applyStrategy = strategies[chatBubbleStyle] || strategies['glass'];
    applyStrategy();
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] flex ${msg.role === 'user' ? 'items-end' : 'items-start'}`} style={{ flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
        <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', paddingLeft: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', paddingRight: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
          {msg.role === 'assistant' ? (
            <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
              <div className="w-5 h-5 rounded-full bg-[var(--sarak-primary-color,#3b82f6)] flex items-center justify-center">
                 <Bot size={12} className="text-[var(--sarak-primary-color,#3b82f6)]" />
              </div>
              <span className="text-2xs font-bold text-[var(--text-muted,#94a3b8)] uppercase tracking-widest">Sarak Assistant</span>
            </div>
          ) : (
            <span className="text-2xs font-bold text-[var(--sarak-primary-color,#3b82f6)] uppercase tracking-widest">Requisitante</span>
          )}
        </div>

        <div 
          className={`shadow-xl border text-[var(--color-theme-title,#ffffff)] transition-all`}
          style={bubbleStyle}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>

        {msg.metadata && (
          <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
            {msg.metadata.model && (
              <div className="flex items-center bg-[var(--text-muted,#94a3b8)]/10 border border-[var(--border-color,#334155)] rounded-md text-2xs font-mono text-[var(--text-muted,#94a3b8)]" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.375)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 8) calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                <Cpu size={10} className="text-[var(--sarak-primary-color,#3b82f6)]" />
                {msg.metadata.model}
              </div>
            )}
            {msg.metadata.reasoning && (
              <div className="flex items-center bg-[var(--text-muted,#94a3b8)]/10 border border-[var(--border-color,#334155)] rounded-md text-2xs font-medium text-[var(--text-muted,#94a3b8)] italic" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.375)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 8) calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
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
