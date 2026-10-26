import React from 'react';
import { SarakIcon } from "../../Icon/SarakIcon";
import { motion } from 'framer-motion';

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
    bubbleStyle.backgroundColor = 'var(--sarak-chat-user-bg, var(--sarak-primary-color,#19e3f0))';
    bubbleStyle.borderColor = 'var(--theme-primary-border, rgba(25,227,240,0.25))';
    bubbleStyle.color = 'var(--sarak-on-chat-user, #ffffff)';
  } else {
    bubbleStyle.borderRadius = '0px var(--sarak-chat-radius, 12px) var(--sarak-chat-radius, 12px) var(--sarak-chat-radius, 12px)';
    
    const strategies: Record<string, () => void> = {
      'minimal': () => {
        bubbleStyle.backgroundColor = 'transparent';
        bubbleStyle.borderColor = 'transparent';
        bubbleStyle.padding = '0';
      },
      'solid': () => {
        bubbleStyle.backgroundColor = 'var(--sarak-primary-color,#19e3f0)';
        bubbleStyle.borderColor = 'transparent';
        bubbleStyle.color = 'var(--theme-on-primary, #020617)';
      },
      'glass': () => {
        bubbleStyle.backgroundColor = 'var(--sarak-card-bg, var(--color-theme-card,#101622))';
        bubbleStyle.borderColor = 'var(--sarak-card-border-color, var(--border-color,rgba(255,255,255,0.09)))';
        bubbleStyle.backdropFilter = 'blur(var(--sarak-card-backdrop-blur, 12px))';
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
              <div className="w-5 h-5 rounded-full bg-[var(--sarak-primary-color,#19e3f0)] flex items-center justify-center">
                 <SarakIcon name="Bot" size={12} className="text-[var(--sarak-primary-color,#19e3f0)]" />
              </div>
              <span className="text-2xs font-bold text-[var(--text-muted,rgba(242,246,251,0.55))] uppercase tracking-widest">Sarak Assistant</span>
            </div>
          ) : (
            <span className="text-2xs font-bold text-[var(--sarak-primary-color,#19e3f0)] uppercase tracking-widest">Requisitante</span>
          )}
        </div>

        <div 
          className={`shadow-[var(--dynamic-shadow)] border text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))] transition-all`}
          style={bubbleStyle}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>

        {msg.metadata && (
          <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>
            {msg.metadata.model && (
              <div className="flex items-center bg-[var(--text-muted,rgba(242,246,251,0.55))]/10 border border-[var(--border-color,rgba(255,255,255,0.09))] rounded-[var(--sarak-chat-radius,12px)] text-2xs font-mono text-[var(--text-muted,rgba(242,246,251,0.55))]" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.375)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 8) calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                <SarakIcon name="Cpu" size={10} className="text-[var(--sarak-primary-color,#19e3f0)]" />
                {msg.metadata.model}
              </div>
            )}
            {msg.metadata.reasoning && (
              <div className="flex items-center bg-[var(--text-muted,rgba(242,246,251,0.55))]/10 border border-[var(--border-color,rgba(255,255,255,0.09))] rounded-[var(--sarak-chat-radius,12px)] text-2xs font-medium text-[var(--text-muted,rgba(242,246,251,0.55))] italic" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.375)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 8) calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                <SarakIcon name="Search" size={10} />
                {msg.metadata.reasoning}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
