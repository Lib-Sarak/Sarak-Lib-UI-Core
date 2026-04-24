import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { VISUALIZATION_PRESETS } from './presets';

interface VisualizationGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

export const VisualizationGallery: React.FC<VisualizationGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (v: any) => {
        Object.entries(v.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto custom-scrollbar h-full bg-black/40">
            {VISUALIZATION_PRESETS.map((v) => {
                const isActive = tokens.engineQuality === v.tokens.engineQuality || tokens.mapStyle === v.tokens.mapStyle;
                return (
                    <GalleryItem 
                        key={v.id}
                        title={v.title}
                        description={v.description}
                        isActive={isActive}
                        onClick={() => handleSelect(v)}
                    >
                        <div className="w-full h-full min-h-[140px] flex items-center justify-center relative perspective-1000">
                             {/* 3D Specimen Simulation */}
                             <motion.div 
                                animate={{ 
                                    rotateY: [0, 360],
                                    rotateX: [15, 25, 15]
                                }}
                                transition={{ 
                                    duration: 10, 
                                    repeat: Infinity, 
                                    ease: "linear" 
                                }}
                                className="w-20 h-20 relative transform-gpu"
                             >
                                {/* Wireframe Cube/Core */}
                                <div className="absolute inset-0 border-2 border-[var(--theme-primary)]/40 rounded-lg" style={{ transform: 'translateZ(20px)' }} />
                                <div className="absolute inset-0 border-2 border-[var(--theme-primary)]/20 rounded-lg" style={{ transform: 'translateZ(-20px)' }} />
                                <div className="absolute inset-0 bg-[var(--theme-primary)]/10 rounded-lg blur-xl animate-pulse" />
                                
                                {v.id === 'map-cyber-dark' && (
                                     <div className="absolute inset-[-10px] border border-white/5 rounded-full animate-spin-slow" />
                                )}
                                
                                {v.id === 'voxel-viz' && (
                                     <div className="grid grid-cols-3 gap-1 absolute inset-0 opacity-40">
                                         {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="w-full h-full bg-[var(--theme-primary)]" />)}
                                     </div>
                                )}
                             </motion.div>

                             {/* Grid Floor */}
                             <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[var(--theme-primary)]/10 to-transparent opacity-20" />
                        </div>
                    </GalleryItem>
                );
            })}
        </div>
    );
};
