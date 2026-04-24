import React from 'react';
import { motion } from 'framer-motion';
import { CHAT_PRESETS, ChatPreset } from '../../../../constants/chat-presets';
import { Check, MessageSquare, User, Bot, Clock } from 'lucide-react';

interface ChatGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const ChatGallery: React.FC<ChatGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {CHAT_PRESETS.map((preset) => (
                <ChatSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.chatBubbleStyle === preset.tokens.chatBubbleStyle && tokens.chatBubbleRadius === preset.tokens.chatBubbleRadius}
                />
            ))}
        </div>
    );
};

const ChatSpecimen: React.FC<{ preset: ChatPreset; onSelect: () => void; isActive: boolean }> = ({ 
    preset, onSelect, isActive 
}) => {
    return (
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-6 space-y-6">
                
                {/* 1. Conversation Fragment Preview */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-6 min-h-[160px] flex flex-col justify-end relative overflow-hidden">
                    <div className="absolute top-3 left-4 text-[7px] font-black text-white/10 uppercase tracking-[0.3em]">Flow Dynamics</div>
                    
                    <div className="space-y-3" style={{ gap: `${preset.tokens.chatMessageSpacing / 4}px` }}>
                        {/* Bot Message */}
                        <div className="flex items-end gap-2">
                            {preset.tokens.showAvatars && <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><Bot size={12} className="text-[var(--theme-primary)]" /></div>}
                            <div 
                                className={`max-w-[70%] p-3 text-[10px] text-white/60 ${
                                    preset.tokens.chatBubbleStyle === 'glass' ? 'bg-white/5 backdrop-blur-md border border-white/10' :
                                    preset.tokens.chatBubbleStyle === 'outline' ? 'border border-white/20 bg-transparent' :
                                    'bg-white/10 border-transparent'
                                }`}
                                style={{ borderRadius: `${preset.tokens.chatBubbleRadius}px ${preset.tokens.chatBubbleRadius}px ${preset.tokens.chatBubbleRadius}px 0px` }}
                            >
                                How can I assist you with the Sarak Design Engine?
                            </div>
                        </div>

                        {/* User Message */}
                        <div className="flex items-end gap-2 justify-end">
                            <div 
                                className={`max-w-[70%] p-3 text-[10px] text-white ${
                                    preset.tokens.chatBubbleStyle === 'glass' ? 'bg-[var(--theme-primary)]/20 backdrop-blur-md border border-[var(--theme-primary)]/30' :
                                    preset.tokens.chatBubbleStyle === 'outline' ? 'border border-[var(--theme-primary)] bg-transparent text-[var(--theme-primary)]' :
                                    'bg-[var(--theme-primary)] border-transparent'
                                }`}
                                style={{ borderRadius: `${preset.tokens.chatBubbleRadius}px ${preset.tokens.chatBubbleRadius}px 0px ${preset.tokens.chatBubbleRadius}px` }}
                            >
                                Optimize my interface physics.
                            </div>
                            {preset.tokens.showAvatars && <div className="w-6 h-6 rounded-lg bg-[var(--theme-primary)]/20 border border-[var(--theme-primary)]/30 flex items-center justify-center"><User size={12} className="text-white" /></div>}
                        </div>
                    </div>
                </div>

                {/* 2. Metadata & Specs */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-white">{preset.title}</h3>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{preset.description}</p>
                    </div>
                    {preset.tokens.showTimestamp && <Clock size={12} className="text-white/10" />}
                </div>
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div className="absolute top-6 right-6">
                    <div className="w-6 h-6 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="text-white" size={12} />
                    </div>
                </div>
            )}
        </motion.div>
    );
};
