import React from 'react';
import { motion } from 'framer-motion';
import { VISUALIZATION_PRESETS, VisualizationPreset } from '../../../../constants/visualization-presets';
import { Check, Globe, Grid3X3, Box, Cpu, Activity } from 'lucide-react';

interface VisualizationGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const VisualizationGallery: React.FC<VisualizationGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {VISUALIZATION_PRESETS.map((preset) => (
                <VisualizationSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.vizMode === preset.tokens.vizMode && tokens.wireframeIntensity === preset.tokens.wireframeIntensity}
                    globalTokens={tokens}
                />
            ))}
        </div>
    );
};

const VisualizationSpecimen: React.FC<{ preset: VisualizationPreset; onSelect: () => void; isActive: boolean; globalTokens: any }> = ({ 
    preset, onSelect, isActive, globalTokens 
}) => {
    const mergedTokens = { ...globalTokens, ...preset.tokens };
    const vizMode = mergedTokens.vizMode;
    const rotateSpeed = mergedTokens.rotateSpeed || 1;
    const pointDensity = mergedTokens.pointDensity || 0.5;
    const wireframeIntensity = mergedTokens.wireframeIntensity || 0.5;

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-6 space-y-6">
                
                {/* 1. Abstract Mesh Preview */}
                <div className="h-32 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute top-3 left-4 text-[7px] font-black text-white/10 uppercase tracking-[0.3em]">Mesh Architecture</div>
                    
                    {/* Simulated 3D Mesh Grid */}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20 / rotateSpeed, repeat: Infinity, ease: "linear" }}
                        className="relative w-24 h-24"
                    >
                        {/* Grid Layers */}
                        {[1, 2, 3].map(i => (
                            <div 
                                key={i}
                                className="absolute inset-0 border rounded-lg transition-all duration-700"
                                style={{ 
                                    transform: `rotateX(45deg) rotateZ(${i * 30}deg) translateZ(${i * 10}px)`,
                                    borderColor: mergedTokens.colorMapping === 'monochrome' ? 'rgba(255,255,255,0.1)' : 
                                               mergedTokens.colorMapping === 'spectrum' ? 'rgba(var(--theme-primary-rgb), 0.3)' : 'rgba(var(--theme-primary-rgb), 0.1)',
                                    borderWidth: vizMode === 'mesh' ? '1px' : '0px',
                                    backgroundColor: vizMode === 'solid' ? 'rgba(var(--theme-primary-rgb), 0.05)' : 'transparent'
                                }}
                            />
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu size={24} className="text-[var(--theme-primary)] opacity-40 blur-[1px]" />
                        </div>
                    </motion.div>

                    {/* Point Cloud simulation overlay */}
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-2 p-4 pointer-events-none opacity-20">
                        {Array.from({ length: Math.round(pointDensity * 64) }).map((_, i) => (
                            <div key={i} className="w-0.5 h-0.5 rounded-full bg-white" />
                        ))}
                    </div>
                </div>

                {/* 2. Metadata & Specs */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-white">{preset.title}</h3>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{preset.description}</p>
                    </div>
                    <div className="flex gap-1">
                        <Grid3X3 size={12} className="text-white/10" />
                        <Activity size={12} className="text-white/10" />
                    </div>
                </div>

                {/* 3. Tech Badge */}
                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{vizMode} Mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-white/20 uppercase">Wireframe</span>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--theme-primary)] transition-all duration-500" style={{ width: `${wireframeIntensity * 100}%` }} />
                        </div>
                    </div>
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
