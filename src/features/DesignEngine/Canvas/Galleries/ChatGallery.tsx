import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { CHAT_PRESETS } from './presets';

interface ChatGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

export const ChatGallery: React.FC<ChatGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (v: any) => {
        Object.entries(v.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto custom-scrollbar h-full bg-black/40">
            {CHAT_PRESETS.map((v) => {
                const isActive = tokens.chatBubbleStyle === v.tokens.chatBubbleStyle;
                return (
                    <GalleryItem 
                        key={v.id}
                        title={v.title}
                        description={v.description}
                        isActive={isActive}
                        onClick={() => handleSelect(v)}
                    >
                        <div className="flex flex-col gap-3 w-full px-4 overflow-hidden py-2">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className={`p-3 rounded-2xl rounded-tl-none self-start max-w-[90%] text-[10px] leading-relaxed ${v.tokens.chatBubbleStyle === 'glass' ? 'bg-white/10 border border-white/10 backdrop-blur-md' : v.tokens.chatBubbleStyle === 'terminal' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono' : 'bg-white/5 border-l-2 border-[var(--theme-primary)]'}`}
                            >
                                <div className="font-bold mb-1 opacity-50 text-[8px] uppercase tracking-tighter">System Node</div>
                                Olá. Analisando as métricas de performance do módulo...
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className={`p-3 rounded-2xl rounded-tr-none self-end max-w-[90%] text-[10px] bg-[var(--theme-primary)] text-white shadow-xl shadow-[var(--theme-primary)]/20`}
                            >
                                Proceder com a otimização WebGL.
                            </motion.div>
                        </div>
                    </GalleryItem>
                );
            })}
        </div>
    );
};
