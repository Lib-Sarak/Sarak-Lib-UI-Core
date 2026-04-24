import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { DASHBOARD_PRESETS } from './presets';

interface DashboardGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

export const DashboardGallery: React.FC<DashboardGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (v: any) => {
        Object.entries(v.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto custom-scrollbar h-full bg-black/60">
            {DASHBOARD_PRESETS.map((v) => (
                <GalleryItem 
                    key={v.id}
                    title={v.title}
                    description={v.description}
                    isActive={tokens.chartType === v.tokens.chartType && tokens.chartStyle === v.tokens.chartStyle}
                    onClick={() => handleSelect(v)}
                >
                    <div className="w-full h-full min-h-[140px] flex flex-col justify-end p-4 bg-black/20 rounded-xl relative overflow-hidden group-hover:bg-black/30 transition-all border border-white/5">
                         {/* Realistic Chart Visualization */}
                         <div className="flex items-baseline justify-between h-20 gap-1.5 relative z-10">
                            {[40, 70, 45, 90, 65, 80, 50, 100, 75, 85].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                    className={`w-full relative ${v.tokens.chartType === 'line' ? 'bg-transparent' : 'bg-[var(--theme-primary)]/20 rounded-t-sm border-t border-[var(--theme-primary)]'}`}
                                    style={{ 
                                        opacity: 0.6 + (h/200),
                                        backgroundColor: v.tokens.chartType === 'line' ? 'transparent' : undefined
                                    }}
                                >
                                    {v.tokens.chartType === 'line' && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.5)]" />
                                    )}
                                    {v.tokens.chartStyle === 'cyber' && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-primary)]/40 to-transparent" />
                                    )}
                                </motion.div>
                            ))}
                         </div>

                         {/* Grid Lines for fidelity */}
                         <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-5 pointer-events-none">
                             {[1,2,3].map(i => <div key={i} className="w-full h-px bg-white" />)}
                         </div>

                         <div className="mt-4 flex justify-between items-center relative z-10">
                             <div className="flex gap-2">
                                 <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)]" />
                                 <div className="w-12 h-2 bg-white/10 rounded-full" />
                             </div>
                             <span className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">Render: {v.tokens.chartStyle}</span>
                         </div>
                    </div>
                </GalleryItem>
            ))}
        </div>
    );
};
