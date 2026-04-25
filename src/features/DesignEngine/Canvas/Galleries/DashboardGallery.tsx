import React from 'react';
import { motion } from 'framer-motion';
import { DASHBOARD_PRESETS, DashboardPreset } from '../../../../constants/dashboard-presets';
import { Check, BarChart3, LineChart, PieChart, Activity, LayoutGrid } from 'lucide-react';

interface DashboardGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const DashboardGallery: React.FC<DashboardGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="p-8 grid grid-cols-1 gap-8">
            {DASHBOARD_PRESETS.map((preset) => (
                <DashboardSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.chartStyle === preset.tokens.chartStyle && tokens.widgetSpacing === preset.tokens.widgetSpacing}
                    globalTokens={tokens}
                />
            ))}
        </div>
    );
};

const DashboardSpecimen: React.FC<{ preset: DashboardPreset; onSelect: () => void; isActive: boolean; globalTokens: any }> = ({ 
    preset, onSelect, isActive, globalTokens 
}) => {
    const mergedTokens = { ...globalTokens, ...preset.tokens };
    const chartStyle = mergedTokens.chartStyle;
    const spacing = mergedTokens.widgetSpacing;
    const fillOpacity = mergedTokens.chartFillOpacity;

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. Header & Context (col-4) */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-[var(--theme-primary)]' : 'bg-white/5'}`}>
                            <BarChart3 className={isActive ? 'text-white' : 'text-white/40'} size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-white">{preset.title}</h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{preset.description}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Style</span>
                            <span className="text-[10px] font-black text-white uppercase">{chartStyle}</span>
                        </div>
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Spacing</span>
                            <span className="text-[10px] font-black text-white uppercase">{spacing}px</span>
                        </div>
                    </div>
                </div>

                {/* 2. Chart Specimen (col-8) */}
                <div className="lg:col-span-8 bg-black/20 rounded-2xl border border-white/5 p-6 relative h-[180px] flex flex-col justify-end">
                    <div className="absolute top-4 left-6 flex items-center gap-2">
                        <Activity size={10} className="text-[var(--theme-primary)]" />
                        <span className="text-[7px] font-black text-white/10 uppercase tracking-[0.3em]">Real-time Telemetry</span>
                    </div>

                    {/* Simple SVG Chart Simulator */}
                    <div className="w-full h-full pt-8 flex items-end relative">
                        {mergedTokens.showGridLines && (
                            <div className="absolute inset-0 flex flex-col justify-between opacity-10 py-8">
                                <div className="border-t border-white" />
                                <div className="border-t border-white" />
                                <div className="border-t border-white" />
                            </div>
                        )}
                        
                        <svg className="w-full h-24 overflow-visible">
                            <motion.path 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                d={chartStyle === 'curved' 
                                    ? "M0,60 C20,20 40,80 60,40 S80,10 100,50 L100,100 L0,100 Z"
                                    : chartStyle === 'stepped'
                                    ? "M0,80 L20,80 L20,40 L40,40 L40,20 L60,20 L60,60 L80,60 L80,10 L100,10 L100,100 L0,100 Z"
                                    : "M0,80 L20,40 L40,60 L60,20 L80,50 L100,10 L100,100 L0,100 Z"
                                }
                                fill="currentColor"
                                className="text-[var(--theme-primary)] transition-all duration-500"
                                style={{ opacity: fillOpacity + 0.1 }}
                                preserveAspectRatio="none"
                                viewBox="0 0 100 100"
                            />
                            <motion.path 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                d={chartStyle === 'curved' 
                                    ? "M0,60 C20,20 40,80 60,40 S80,10 100,50"
                                    : chartStyle === 'stepped'
                                    ? "M0,80 L20,80 L20,40 L40,40 L40,20 L60,20 L60,60 L80,60 L80,10 L100,10"
                                    : "M0,80 L20,40 L40,60 L60,20 L80,50 L100,10"
                                }
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-[var(--theme-primary)] transition-all duration-500"
                                preserveAspectRatio="none"
                                viewBox="0 0 100 100"
                            />
                        </svg>
                    </div>

                    {/* Widget Spacing Preview */}
                    <div className="absolute top-4 right-6 flex gap-1 transition-all duration-500" style={{ gap: `${spacing / 4}px` }}>
                        <div className="w-6 h-6 rounded bg-white/5 border border-white/5" />
                        <div className="w-6 h-6 rounded bg-white/5 border border-white/5" />
                        <div className="w-6 h-6 rounded bg-white/5 border border-white/5" />
                    </div>
                </div>

            </div>

            {/* Active Marker */}
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
