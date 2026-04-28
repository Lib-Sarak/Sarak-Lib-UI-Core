import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Zap } from 'lucide-react';

export const MockChat: React.FC<any> = ({ tokens }) => {
    const bubbleStyle = tokens?.chatBubbleStyle || 'glass';
    const radius = tokens?.chatBubbleRadius || 12;
    const speed = tokens?.chatAnimationSpeed || 0.4;
    const showAvatars = tokens?.showAvatars !== false;
    const tone = tokens?.systemTone || 'formal';

    // Helper de tradução por tom
    const t = (texts: { formal: string; friendly: string; cyber: string }) => {
        return texts[tone as keyof typeof texts] || texts.formal;
    };

    return (
        <div className="flex flex-col h-full bg-transparent p-4">
            <div className="flex-grow flex flex-col mb-4 overflow-y-auto custom-scrollbar" style={{ gap: 'var(--theme-gap)' }}>
                
                {/* Bot Message */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: speed }}
                    className="flex justify-start gap-3"
                >
                    {showAvatars && (
                        <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center shrink-0">
                            <Bot size={14} className="text-[var(--theme-primary)]" />
                        </div>
                    )}
                    <div
                        className={`p-4 border border-[var(--theme-border)] shadow-xl max-w-[80%] relative overflow-hidden transition-all duration-500 sarak-card
                            ${bubbleStyle === 'glass' ? 'bg-[var(--theme-card)] backdrop-blur-md' : ''}
                            ${bubbleStyle === 'solid' ? 'bg-[var(--theme-card)]' : ''}
                            ${bubbleStyle === 'outline' ? 'bg-transparent border-2' : ''}
                            ${bubbleStyle === 'minimal' ? 'bg-transparent border-l-4 border-l-[var(--theme-primary)] rounded-none' : ''}
                        `}
                        style={{ 
                            borderRadius: bubbleStyle === 'minimal' ? '0' : `${radius}px ${radius}px ${radius}px 0px`,
                            borderLeftWidth: bubbleStyle === 'minimal' ? '4px' : '1px'
                        }}
                    >
                        <div className="relative z-10 text-xs text-[var(--theme-title)] font-medium leading-relaxed">
                            <span className="text-[var(--theme-primary)] font-black mr-2 opacity-60 uppercase text-3xs tracking-widest">
                                {t({ formal: 'Sarak AI:', friendly: 'Sarak:', cyber: 'SRK_CORE_AI:' })}
                            </span>
                            {t({
                                formal: 'Olá! Analisei seus fluxos de trabalho e identifiquei 3 pontos de otimização na camada de persistência. Deseja aplicar as melhorias?',
                                friendly: 'Oi! Tudo bem? Dei uma olhada no seu projeto e achei umas coisas que podemos melhorar juntos. Quer ver o que eu preparei?',
                                cyber: 'NODE_ANALYSIS_COMPLETE: 3_OPTIMIZATION_POINTS_IDENTIFIED in PERSISTENCE_LAYER. EXECUTE_REFACTOR?'
                            })}
                        </div>
                    </div>
                </motion.div>
                
                {/* User Message */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: speed, delay: speed * 0.5 }}
                    className="flex justify-end gap-3"
                >
                    <div className={`p-4 shadow-xl max-w-[80%] transition-all duration-500
                        ${bubbleStyle === 'glass' ? 'bg-[var(--theme-primary)]/20 backdrop-blur-md border border-[var(--theme-primary)]/30' : ''}
                        ${bubbleStyle === 'solid' ? 'bg-[var(--theme-primary)] text-white' : ''}
                        ${bubbleStyle === 'outline' ? 'border-2 border-[var(--theme-primary)] bg-transparent' : ''}
                        ${bubbleStyle === 'minimal' ? 'bg-white/5 border border-white/10 rounded-lg' : ''}
                    `}
                    style={{ 
                        borderRadius: bubbleStyle === 'minimal' ? '4px' : `${radius}px ${radius}px 0px ${radius}px`,
                        color: (bubbleStyle === 'solid') ? 'white' : 'var(--theme-title)'
                    }}>
                        <div className="text-xs leading-relaxed font-medium">
                            {t({
                                formal: 'Sim, prossiga com a otimização. Quais serão os ganhos estimados em TBT?',
                                friendly: 'Sim, pode mandar bala! O quanto isso vai deixar o site mais rápido?',
                                cyber: 'ACK_TRUE: INITIATE_REF_01. REQUEST_ESTIMATED_TBT_GAIN.'
                            })}
                        </div>
                    </div>
                    {showAvatars && (
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <User size={14} className="text-[var(--theme-title)]/60" />
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Mock Input Area */}
            <div className="mt-auto p-2 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                <div className="flex-1 px-4 py-2 text-xs text-white/20 font-bold uppercase tracking-widest">
                    {t({ formal: 'Digite sua mensagem...', friendly: 'Fala comigo...', cyber: 'INPUT_BUFFER...' })}
                </div>
                <div className="sarak-preview-btn w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center cursor-pointer">
                    <Zap size={14} className="text-white" />
                </div>
            </div>
        </div>
    );
};

