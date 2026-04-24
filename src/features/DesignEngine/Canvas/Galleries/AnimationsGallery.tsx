import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { ANIMATION_PRESETS } from './presets';

interface AnimationsGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

export const AnimationsGallery: React.FC<AnimationsGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (v: any) => {
        Object.entries(v.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
    };

    return (
        <div className="grid grid-cols-1 gap-6 p-6 overflow-y-auto custom-scrollbar h-full bg-black/60">
            {ANIMATION_PRESETS.map((v) => (
                <GalleryItem 
                    key={v.id}
                    title={v.title}
                    description={v.description}
                    isActive={tokens.animationSpeed === v.tokens.animationSpeed}
                    onClick={() => handleSelect(v)}
                >
                    <div className="w-full h-full min-h-[140px] flex items-center justify-center bg-black/20 rounded-xl relative overflow-hidden group/playground">
                        {/* Physics Sandbox Label */}
                        <div className="absolute top-2 left-3 text-[7px] font-black text-white/10 uppercase tracking-[0.3em]">
                            Kinetic Sandbox
                        </div>

                        {/* The Bouncy Object */}
                        <motion.div 
                            whileHover={{ 
                                scale: 1.2, 
                                rotate: [0, 5, -5, 0],
                                borderRadius: v.tokens.interfaceElasticity > 0.5 ? ['30%', '50%', '30%'] : '12px'
                            }}
                            transition={{ 
                                type: 'spring', 
                                stiffness: 300 * (1 - v.tokens.interfaceElasticity), 
                                damping: 10 + (v.tokens.interfaceElasticity * 20),
                                duration: v.tokens.animationSpeed
                            }}
                            className="w-16 h-16 bg-gradient-to-br from-[var(--theme-primary)] to-purple-600 rounded-2xl shadow-xl flex items-center justify-center relative z-10 cursor-grab active:cursor-grabbing"
                        >
                            <div className="w-6 h-1 bg-white/40 rounded-full blur-[1px]" />
                        </motion.div>

                        {/* Interactive Hint */}
                        <div className="absolute bottom-2 right-3 flex items-center gap-2 opacity-0 group-hover/playground:opacity-100 transition-opacity">
                             <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Hover to Feel Physics</span>
                        </div>

                        {/* Ghost Path for visual context */}
                        <div className="absolute inset-0 border-[4px] border-white/5 rounded-xl border-dashed opacity-20" />
                    </div>
                </GalleryItem>
            ))}
        </div>
    );
};
