import React, { RefObject } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { Message } from './types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isProcessingFiles: boolean;
  scrollRef: RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, isProcessingFiles, scrollRef }) => (
  <div 
    ref={scrollRef}
    className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth flex flex-col"
    style={{ padding: 'var(--sx-spacing-md)', gap: 'var(--sx-spacing-md)' }}
  >
    {messages.length === 0 && (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] flex items-center justify-center mb-2 relative group/terminal">
           <div className="absolute inset-0 bg-[var(--sx-color-primary-surface)] rounded-3xl blur-2xl opacity-0 group-hover/terminal:opacity-100 transition-opacity"></div>
          <Terminal size={36} className="text-[var(--sx-color-primary-base)] relative z-10" />
        </div>
        <h3 className="text-lg font-medium text-[var(--sx-color-text-title)]">Interface de Sistema Inicializada</h3>
        <p className="text-sm text-[var(--sx-color-text-muted)] max-w-sm">
          Inicie um teste agora. Envie textos ou imagens para processamento via contrato universal.
        </p>
      </div>
    )}

    {messages.map((msg, i) => (
      <MessageBubble key={i} msg={msg} />
    ))}

    {isLoading && (
      <div className="flex justify-start">
        <div className="bg-[var(--sx-color-text-muted)]/10 border border-[var(--sx-color-border-base)] p-4 rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex gap-1.5">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-[var(--sx-color-primary-base)] rounded-full" />
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[var(--sx-color-primary-base)] rounded-full" />
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[var(--sx-color-primary-base)] rounded-full" />
          </div>
          {isProcessingFiles && <p className="text-3xs mt-2 font-mono text-[var(--sx-color-text-muted)] uppercase tracking-widest animate-pulse">Codificando Imagens...</p>}
        </div>
      </div>
    )}
  </div>
);

