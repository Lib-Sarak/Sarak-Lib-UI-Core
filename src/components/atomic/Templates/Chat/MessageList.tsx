import { SarakIcon } from "../../Icon/SarakIcon";
import React, { RefObject } from 'react';
import { motion } from 'framer-motion';

import { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';
import { useMotionTokens } from '../../hooks/useMotionTokens';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isProcessingFiles: boolean;
  scrollRef: RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, isProcessingFiles, scrollRef }) => {
    const { durations } = useMotionTokens();
  const { getFlexStyles } = useStructuralStyles();
  const emptyStateStack = getFlexStyles('column', 'center', 'center', 'var(--sarak-layout-gap-md,16px)');

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth flex"
      style={{ flexDirection: 'column', padding: 'var(--sarak-layout-gap-md,16px)', gap: 'var(--sarak-layout-gap-md,16px)' }}
    >
      {messages.length === 0 && (
        <div className={`${emptyStateStack.className} h-full text-center animate-in fade-in zoom-in duration-[var(--duration-slow,0.6s)]`} style={emptyStateStack.style}>
          <div className="w-20 h-20 bg-[var(--color-theme-card,#101622)] border-[var(--border-color,rgba(255,255,255,0.09))] flex items-center justify-center relative group/terminal" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.5)' }}>
             <div className="absolute inset-0 bg-[var(--sarak-primary-color-bg,rgba(25,227,240,0.15))] rounded-3xl blur-2xl opacity-0 group-hover/terminal:opacity-100 transition-opacity"></div>
            <SarakIcon name="Terminal" size={36} className="text-[var(--sarak-primary-color,#19e3f0)] relative z-10" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-theme-title,#f2f6fb)]">Interface de Sistema Inicializada</h3>
          <p className="text-sm text-[var(--text-muted,rgba(242,246,251,0.55))] max-w-sm">
            Inicie um teste agora. Envie textos ou imagens para processamento via contrato universal.
          </p>
        </div>
      )}

      {messages.map((msg, i) => (
        <MessageBubble key={i} msg={msg} />
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-[var(--text-muted,rgba(242,246,251,0.55))]/10 border border-[var(--border-color,rgba(255,255,255,0.09))] rounded-[var(--sarak-chat-radius,12px)] rounded-tl-none shadow-sm" style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
            <div className="flex" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.375)' }}>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: durations.slow }} className="w-1.5 h-1.5 bg-[var(--sarak-ai-glow,var(--sarak-primary-color,#19e3f0))] rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: durations.slow, delay: durations.fast }} className="w-1.5 h-1.5 bg-[var(--sarak-ai-glow,var(--sarak-primary-color,#19e3f0))] rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: durations.slow, delay: durations.fast * 2 }} className="w-1.5 h-1.5 bg-[var(--sarak-ai-glow,var(--sarak-primary-color,#19e3f0))] rounded-full" />
            </div>
            {isProcessingFiles && <p className="text-3xs font-mono text-[var(--text-muted,rgba(242,246,251,0.55))] uppercase tracking-widest animate-pulse" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.5)' }}>Codificando Imagens...</p>}
          </div>
        </div>
      )}
    </div>
  );
};

