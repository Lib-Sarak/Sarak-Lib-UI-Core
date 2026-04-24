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
    style={{ padding: 'var(--theme-pad, 1.5rem)', gap: 'var(--theme-gap, 1.5rem)' }}
  >
    {messages.length === 0 && (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-theme-card border-theme flex items-center justify-center mb-2 relative group/terminal">
           <div className="absolute inset-0 bg-[var(--theme-primary-bg)] rounded-3xl blur-2xl opacity-0 group-hover/terminal:opacity-100 transition-opacity"></div>
          <Terminal size={36} className="text-[var(--theme-primary)] relative z-10" />
        </div>
        <h3 className="text-lg font-medium text-slate-200">Interface de Sistema Inicializada</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Inicie um teste agora. Envie textos ou imagens para processamento via contrato universal.
        </p>
      </div>
    )}

    {messages.map((msg, i) => (
      <MessageBubble key={i} msg={msg} />
    ))}

    {isLoading && (
      <div className="flex justify-start">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex gap-1.5">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full" />
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full" />
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full" />
          </div>
          {isProcessingFiles && <p className="text-3xs mt-2 font-mono text-slate-500 uppercase tracking-widest animate-pulse">Codificando Imagens...</p>}
        </div>
      </div>
    )}
  </div>
);

