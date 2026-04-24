import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { LAYOUT_PRESETS } from './presets';

interface LayoutGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

export const LayoutGallery: React.FC<LayoutGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (v: any) => {
        Object.entries(v.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
    };

    return (
        <div className="grid grid-cols-1 gap-6 p-6 overflow-y-auto custom-scrollbar h-full bg-black/40">
            {LAYOUT_PRESETS.map((v) => {
                const isActive = tokens.navigationStyle === v.tokens.navigationStyle && tokens.layoutDensity === v.tokens.layoutDensity;
                return (
                    <GalleryItem 
                        key={v.id}
                        title={v.title}
                        description={v.description}
                        isActive={isActive}
                        onClick={() => handleSelect(v)}
                    >
                        <div className="w-full max-w-[280px] aspect-[1.8/1] border border-white/10 rounded-xl bg-[#080808] p-1.5 flex flex-col overflow-hidden shadow-2xl relative group/layout">
                            {/* Decorative Grid Overlay */}
                            <div className="absolute inset-0 texture-grid opacity-5 pointer-events-none" />

                            <div className="flex gap-1.5 h-full relative z-10">
                                {v.tokens.navigationStyle === 'sidebar' && (
                                    <motion.div 
                                        initial={false}
                                        animate={{ width: v.tokens.sidebarWidth / 6 }}
                                        className="h-full bg-white/5 rounded-md border border-white/5 flex flex-col p-1 gap-1"
                                    >
                                        <div className="w-full h-1 bg-[var(--theme-primary)]/40 rounded-full" />
                                        <div className="w-1/2 h-0.5 bg-white/10 rounded-full" />
                                        <div className="w-full h-1 bg-white/5 rounded-full mt-auto" />
                                    </motion.div>
                                )}
                                
                                <div className="flex-1 flex flex-col gap-1.5">
                                    {v.tokens.navigationStyle === 'topbar' && (
                                        <div className="h-3 bg-white/5 rounded-md border border-white/5 flex items-center px-2 gap-2">
                                            <div className="w-2 h-1 bg-[var(--theme-primary)]/40 rounded-full" />
                                            <div className="w-8 h-0.5 bg-white/10 rounded-full" />
                                        </div>
                                    )}
                                    
                                    <div className={`flex-1 border border-white/5 rounded-md p-1.5 grid gap-1.5 ${v.tokens.layoutDensity === 'compact' ? 'grid-cols-4' : 'grid-cols-2'}`}>
                                        {[1,2,3,4,5,6,7,8].slice(0, v.tokens.layoutDensity === 'compact' ? 8 : 4).map(i => (
                                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[4px] relative overflow-hidden">
                                                <div className="absolute top-1 left-1 w-1/2 h-0.5 bg-white/10 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Label for Density */}
                            <div className="absolute bottom-1 right-2 text-[6px] font-black uppercase text-white/10 tracking-[0.3em]">
                                Density: {v.tokens.layoutDensity}
                            </div>
                        </div>
                    </GalleryItem>
                );
            })}
        </div>
    );
};
