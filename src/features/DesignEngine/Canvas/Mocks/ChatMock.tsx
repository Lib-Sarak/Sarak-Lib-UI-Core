import React from 'react';
import { motion } from 'framer-motion';

export const MockChat: React.FC<any> = ({ tokens }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow flex flex-col gap-4 mb-4">
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: (tokens?.chatAnimationSpeed || 0.05) * 10 }}
                    className="flex justify-start"
                >
                    <div
                        className={`p-6 border border-white/5 shadow-2xl max-w-[85%] relative overflow-hidden transition-all duration-500
                            ${tokens?.chatBubbleStyle === 'glass' ? 'bg-white/10 backdrop-blur-md rounded-2xl rounded-bl-none' : ''}
                            ${tokens?.chatBubbleStyle === 'solid' ? 'bg-[var(--theme-card)] rounded-2xl rounded-bl-none shadow-xl' : ''}
                            ${tokens?.chatBubbleStyle === 'minimal' ? 'bg-transparent border-l-4 border-l-[var(--theme-primary)] rounded-none p-4' : ''}
                        `}
                    >
                        <div className="relative z-10 text-xs text-[var(--theme-title)] font-medium leading-relaxed">
                            <span className="text-[var(--theme-primary)] font-black mr-2 opacity-60 uppercase text-3xs tracking-widest">Sarak AI:</span>
                            Olá! Eu sou o Sarak AI. Como posso otimizar seus fluxos de trabalho hoje?
                        </div>
                    </div>
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                        duration: (tokens?.chatAnimationSpeed || 0.05) * 10, 
                        delay: (tokens?.chatAnimationSpeed || 0.05) * 5 
                    }}
                    className="flex justify-end"
                >
                    <div className={`p-4 shadow-soft max-w-[80%] transition-all duration-500
                        ${tokens?.chatBubbleStyle === 'minimal' ? 'bg-white/5 border border-white/10 rounded-lg' : 'bg-[var(--theme-primary)] rounded-2xl rounded-br-none'}
                    `}>
                        <div className={`text-xs leading-relaxed font-medium ${tokens?.chatBubbleStyle === 'minimal' ? 'text-[var(--theme-title)]/80' : 'text-white'}`}>
                            Pode me mostrar os logs de erro das últimas 2 horas?
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

