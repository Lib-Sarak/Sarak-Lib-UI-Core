import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Paperclip, User, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

interface SarakChatEngineProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}

/**
 * Sarak Chat Engine v7.0
 * Universal, contract-driven chat interface with Markdown & Code highlights.
 */
const SarakChatEngine: React.FC<SarakChatEngineProps> = ({ 
    messages, 
    onSendMessage, 
    isLoading,
    placeholder = "Escreva sua mensagem..."
}) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const { design } = useSarakUI();
    const { chatBubbleStyle, chatAnimationSpeed } = design || {};

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[500px] bg-[var(--theme-card)]/20 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)]">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Sarak Assistant</h3>
                        <p className="text-2xs text-[var(--theme-primary)] font-bold animate-pulse">Online & Ready</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border border-white/10 ${msg.role === 'user' ? 'bg-white/5' : 'bg-[var(--theme-primary)]/20'}`}>
                                    {msg.role === 'user' ? <User size={14} className="text-white/40" /> : <Sparkles size={14} className="text-[var(--theme-primary)]" />}
                                </div>
                                <div className={`p-4 border transition-all duration-500 ${
                                    msg.role === 'user' 
                                        ? 'bg-white/5 border-white/10 text-white/80 rounded-2xl rounded-tr-none' 
                                        : chatBubbleStyle === 'minimal' 
                                            ? 'bg-transparent border-none text-white/90 p-0'
                                            : chatBubbleStyle === 'solid'
                                                ? 'bg-[var(--theme-primary)] border-transparent text-white shadow-xl rounded-2xl rounded-tl-none'
                                                : 'bg-black/40 border-[var(--theme-primary)]/10 text-white/90 shadow-xl backdrop-blur-md rounded-2xl rounded-tl-none'
                                }`}>
                                    <ReactMarkdown 
                                        className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed"
                                        components={{
                                            code({node, inline, className, children, ...props}: any) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={atomDark}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className="bg-white/10 px-1 rounded text-[var(--theme-primary)]" {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center animate-pulse">
                                <Bot size={14} className="text-[var(--theme-primary)]" />
                            </div>
                            <div className="flex gap-1 items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-bounce" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-white/5">
                <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl p-2 px-4 focus-within:border-[var(--theme-primary)]/50 transition-all">
                    <button type="button" className="p-2 text-white/20 hover:text-white transition-colors">
                        <Paperclip size={18} />
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        className="bg-transparent border-none outline-none flex-1 text-sm text-white py-2"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isLoading}
                        className={`p-2 rounded-xl transition-all ${input.trim() && !isLoading ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/20' : 'bg-white/5 text-white/10'}`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SarakChatEngine;

