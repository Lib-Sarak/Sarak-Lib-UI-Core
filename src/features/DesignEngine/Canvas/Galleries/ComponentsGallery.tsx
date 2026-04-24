import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { COMPONENT_PRESETS } from './presets';

interface ComponentsGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

export const ComponentsGallery: React.FC<ComponentsGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (v: any) => {
        Object.entries(v.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
    };

    return (
        <div className="grid grid-cols-1 gap-6 p-6 overflow-y-auto custom-scrollbar h-full bg-black/40">
            {COMPONENT_PRESETS.map((v) => {
                const isActive = tokens.borderType === v.tokens.borderType;
                return (
                    <GalleryItem 
                        key={v.id}
                        title={v.title}
                        description={v.description}
                        isActive={isActive}
                        onClick={() => handleSelect(v)}
                    >
                        <div className="flex flex-col items-center gap-6 w-full">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn ${v.tokens.surfaceMaterial === 'solid' ? 'bg-[var(--theme-primary)] text-white' : 'border-2 border-[var(--theme-primary)] text-[var(--theme-primary)] bg-transparent'}`}
                                style={{ 
                                    boxShadow: v.tokens.borderType === 'neon' ? '0 0 30px rgba(var(--theme-primary-rgb), 0.5)' : 'none',
                                    backdropFilter: v.tokens.surfaceMaterial === 'glass' ? 'blur(10px)' : 'none'
                                }}
                            >
                                {/* Button Inner Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                <span className="relative z-10">Execute Action</span>
                            </motion.button>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                                </div>
                                <div className="w-20 h-8 rounded-lg border border-white/10 bg-white/5" />
                            </div>
                        </div>
                    </GalleryItem>
                );
            })}
        </div>
    );
};
