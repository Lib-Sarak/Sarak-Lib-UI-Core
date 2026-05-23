import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

export const MockChat: React.FC<any> = ({ tokens, animationVariants }) => {
    const bubbleStyle = tokens?.chatBubbleStyle || 'glass';
    const radius = tokens?.chatBubbleRadius || 12;
    const speed = tokens?.chatAnimationSpeed || 0.4;
    const showAvatars = tokens?.showAvatars !== false;

    // Mini Componente para a Mensagem
    const ChatMessage = ({ isBot, text }: { isBot: boolean, text: string }) => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: speed }} className={`flex ${isBot ? 'justify-start' : 'justify-end'} gap-3 w-full`}>
            {isBot && showAvatars && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center shrink-0">
                    <SarakIcon name="Bot" size={12} className="text-[var(--theme-primary)]" />
                </div>
            )}
            <div
                className={`p-3 sm:p-4 shadow-xl max-w-[85%] relative transition-all duration-500 sarak-card
                    ${isBot ? 
                        (bubbleStyle === 'glass' ? 'bg-[var(--theme-card)] backdrop-blur-md border border-[var(--theme-border)]' : 
                         bubbleStyle === 'solid' ? 'bg-[var(--theme-card)] border border-[var(--theme-border)]' : 
                         bubbleStyle === 'outline' ? 'bg-transparent border-2 border-[var(--theme-border)]' : 
                         'bg-transparent border-l-4 border-l-[var(--theme-primary)] rounded-none') 
                    : 
                        (bubbleStyle === 'glass' ? 'bg-[var(--theme-primary)]/20 backdrop-blur-md border border-[var(--theme-primary)]/30' : 
                         bubbleStyle === 'solid' ? 'bg-[var(--theme-primary)] text-white' : 
                         bubbleStyle === 'outline' ? 'border-2 border-[var(--theme-primary)] bg-transparent' : 
                         'bg-white/5 border border-white/10 rounded-lg')
                    }
                `}
                style={{ 
                    borderRadius: bubbleStyle === 'minimal' ? (isBot ? '0' : '4px') : (isBot ? `${radius}px ${radius}px ${radius}px 0px` : `${radius}px ${radius}px 0px ${radius}px`),
                    color: (!isBot && bubbleStyle === 'solid') ? 'white' : 'var(--theme-title)'
                }}
            >
                <div className="text-[10px] sm:text-xs font-medium leading-relaxed">
                    {text}
                </div>
            </div>
            {!isBot && showAvatars && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <SarakIcon name="User" size={12} className="text-[var(--theme-title)]/60" />
                </div>
            )}
        </motion.div>
    );

    return (
        <motion.div variants={animationVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full flex gap-6 overflow-hidden relative p-2">
            
            {/* Coluna Esquerda: Workspace (Tela Cheia simulada) */}
            <div className="flex-1 sarak-card rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-body)] flex flex-col overflow-hidden relative">
                {/* Header Workspace */}
                <div className="h-14 border-b border-[var(--theme-border)] bg-[var(--theme-card)] flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)]">
                            <SarakIcon name="Maximize2" size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-[var(--theme-title)]">Workspace Chat</span>
                            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 3 Online</span>
                        </div>
                    </div>
                </div>
                {/* Messages Workspace */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
                    <ChatMessage isBot={true} text="Bem-vindo ao canal do projeto Alpha. O relatorio da sprint está disponível." />
                    <ChatMessage isBot={false} text="Perfeito. Quais são os gargalos principais?" />
                    <ChatMessage isBot={true} text="Identifiquei atrasos na refatoração do componente de tabela. Sugiro alocar mais um dev." />
                </div>
                {/* Input Workspace */}
                <div className="p-4 bg-[var(--theme-card)] border-t border-[var(--theme-border)]">
                    <div className="relative flex items-center">
                        <input type="text" placeholder="Escreva na thread principal..." className="w-full bg-[var(--theme-body)] border border-[var(--theme-border)] rounded-xl py-3 pl-4 pr-12 text-xs text-[var(--theme-title)] focus:outline-none focus:border-[var(--theme-primary)]" style={{ borderRadius: 'var(--sarak-radius)' }} />
                        <button className="absolute right-2 p-1.5 bg-[var(--theme-primary)] text-white rounded-lg hover:scale-105 transition-transform"><SarakIcon name="Send" size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Coluna Direita: Variantes Compactas */}
            <div className="w-80 hidden xl:flex flex-col gap-6 relative">
                
                {/* Variante 1: Widget Flutuante (Suporte) */}
                <div className="sarak-card flex flex-col h-[350px] border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden relative">
                    <div className="h-12 bg-[var(--theme-primary)] text-white flex items-center justify-between px-4 shrink-0 shadow-md relative z-10">
                        <span className="text-xs font-black tracking-wider flex items-center gap-2"><SarakIcon name="MessageSquare" size={14} /> Sarak Support</span>
                        <div className="flex gap-2 opacity-70"><SarakIcon name="Minimize2" size={12} /><SarakIcon name="MoreHorizontal" size={12} /></div>
                    </div>
                    <div className="flex-1 p-4 bg-gradient-to-b from-[var(--theme-card)] to-[var(--theme-body)] flex flex-col gap-3 overflow-y-auto custom-scrollbar text-[10px]">
                        <div className="text-center text-[9px] text-white/30 uppercase tracking-widest my-2">Hoje 14:30</div>
                        <ChatMessage isBot={true} text="Olá! Como posso ajudar com sua assinatura?" />
                        <ChatMessage isBot={false} text="Preciso fazer um upgrade para o plano Enterprise." />
                    </div>
                    <div className="p-3 bg-[var(--theme-card)] border-t border-[var(--theme-border)] flex items-center gap-2">
                        <SarakIcon name="Paperclip" size={14} className="text-white/30" />
                        <input type="text" placeholder="Sua dúvida..." className="flex-1 bg-transparent text-xs text-[var(--theme-title)] outline-none" />
                        <SarakIcon name="Zap" size={14} className="text-[var(--theme-primary)]" />
                    </div>
                </div>

                {/* Variante 2: In-line Comments */}
                <div className="sarak-card flex-1 border border-[var(--theme-border)] bg-transparent rounded-2xl p-5 flex flex-col gap-4 relative">
                    <div className="text-[10px] font-black uppercase text-[var(--theme-text-sec)] tracking-widest border-b border-[var(--theme-border)] pb-2">
                        Thread In-Line (Comentários)
                    </div>
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center mt-1"><SarakIcon name="User" size={10} className="text-[var(--theme-primary)]" /></div>
                            <div className="flex-1">
                                <div className="text-[10px] font-bold text-[var(--theme-title)] mb-1">DevOps Team <span className="text-white/20 font-normal ml-2">Há 2 horas</span></div>
                                <div className="text-[10px] text-[var(--theme-text-sec)] leading-relaxed">O deploy falhou na stage 4 devido a falta de variáveis de ambiente. Alguém pode verificar?</div>
                            </div>
                        </div>
                        <div className="flex gap-3 ml-6">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-1"><SarakIcon name="Bot" size={10} className="text-emerald-500" /></div>
                            <div className="flex-1">
                                <div className="text-[10px] font-bold text-emerald-500 mb-1">CI/CD Bot <span className="text-white/20 font-normal ml-2">Há 5 min</span></div>
                                <div className="text-[10px] text-[var(--theme-text-sec)] leading-relaxed border border-emerald-500/20 bg-emerald-500/5 p-2 rounded">Auto-fix aplicado. Secrets sincronizados do Vault. Re-iniciando pipeline.</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};



