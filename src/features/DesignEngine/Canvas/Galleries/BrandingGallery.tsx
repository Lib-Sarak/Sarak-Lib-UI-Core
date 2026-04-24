import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { BRANDING_PRESETS } from './presets';
import { Zap, Hexagon, Circle } from 'lucide-react';

interface BrandingGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

const ICON_MAP: Record<string, any> = {
    corporate: <Hexagon size={18} />,
    modern: <Circle size={18} />,
    cyber: <Zap size={18} />
};

export const BrandingGallery: React.FC<BrandingGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (v: any) => {
        Object.entries(v.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
    };

    return (
        <div className="grid grid-cols-1 gap-6 p-6 overflow-y-auto custom-scrollbar h-full bg-black/40">
            {BRANDING_PRESETS.map((v) => {
                const isActive = tokens.systemTone === v.tokens.systemTone;
                return (
                    <GalleryItem 
                        key={v.id}
                        title={v.title}
                        description={v.description}
                        isActive={isActive}
                        onClick={() => handleSelect(v)}
                    >
                        <div className={`w-full max-w-[320px] h-16 border border-white/5 rounded-xl bg-black/20 flex items-center px-6 relative overflow-hidden group/branding ${v.tokens.logoPosition === 'center' ? 'justify-center' : 'justify-start gap-4'}`}>
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-primary)]/5 to-transparent opacity-0 group-hover/branding:opacity-100 transition-opacity" />
                            
                            <motion.div 
                                animate={{ scale: v.tokens.logoScale }}
                                className="w-10 h-10 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-xl shadow-[var(--theme-primary)]/20 relative z-10"
                            >
                                {ICON_MAP[v.id]}
                            </motion.div>
                            
                            <motion.span 
                                initial={false}
                                animate={{ opacity: 1, x: 0 }}
                                className={`text-sm font-black uppercase tracking-[0.2em] text-white relative z-10 ${v.tokens.systemTone === 'cyber' ? 'font-mono' : ''}`}
                            >
                                {v.tokens.systemName}
                            </motion.span>

                            {/* Accent Detail */}
                            {v.tokens.systemTone === 'cyber' && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-20">
                                    <div className="w-1 h-4 bg-[var(--theme-primary)]" />
                                    <div className="w-1 h-2 bg-[var(--theme-primary)]" />
                                </div>
                            )}
                        </div>
                    </GalleryItem>
                );
            })}
        </div>
    );
};
