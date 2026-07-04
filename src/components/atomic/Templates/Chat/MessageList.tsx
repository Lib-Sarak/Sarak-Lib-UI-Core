import React, { RefObject } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isProcessingFiles: boolean;
  scrollRef: RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, isProcessingFiles, scrollRef }) => {
  const { getFlexStyles } = useStructuralStyles();
  const emptyStateStack = getFlexStyles('column', 'center', 'center', 'var(--sarak-layout-gap-md,16px)');

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth flex"
      style={{ flexDirection: 'column', padding: 'var(--sarak-layout-gap-md,16px)', gap: 'var(--sarak-layout-gap-md,16px)' }}
    >
      {messages.length === 0 && (
        <div className={`${emptyStateStack.className} h-full text-center animate-in fade-in zoom-in duration-700`} style={emptyStateStack.style}>
          <div className="w-20 h-20 bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] flex items-center justify-center relative group/terminal" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) * 0.5)' }}>
             <div className="absolute inset-0 bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] rounded-3xl blur-2xl opacity-0 group-hover/terminal:opacity-100 transition-opacity"></div>
            <Terminal size={36} className="text-[var(--sarak-primary-color,#3b82f6)] relative z-10" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-theme-title,#ffffff)]">Interface de Sistema Inicializada</h3>
          <p className="text-sm text-[var(--text-muted,#94a3b8)] max-w-sm">
            Inicie um teste agora. Envie textos ou imagens para processamento via contrato universal.
          </p>
        </div>
      )}

      {messages.map((msg, i) => (
        <MessageBubble key={i} msg={msg} />
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-[var(--text-muted,#94a3b8)]/10 border border-[var(--border-color,#334155)] rounded-2xl rounded-tl-none shadow-sm" style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
            <div className="flex" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.375)' }}>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-[var(--sarak-primary-color,#3b82f6)] rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[var(--sarak-primary-color,#3b82f6)] rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[var(--sarak-primary-color,#3b82f6)] rounded-full" />
            </div>
            {isProcessingFiles && <p className="text-3xs font-mono text-[var(--text-muted,#94a3b8)] uppercase tracking-widest animate-pulse" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.5)' }}>Codificando Imagens...</p>}
          </div>
        </div>
      )}
    </div>
  );
};

