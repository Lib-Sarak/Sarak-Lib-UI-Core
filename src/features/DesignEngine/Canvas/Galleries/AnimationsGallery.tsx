import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSarakUI, UIContext } from '../../../../core/Provider/SarakUIProvider';
import { KINETIC_PRESETS, KineticPreset } from '../../../../constants/kinetic-presets';
import { DESIGN_MANIFEST } from '../../../../core/Provider/SarakUIProvider';
import { Zap, Play, RotateCcw, Check, MousePointer2 } from 'lucide-react';

interface AnimationsGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const AnimationsGallery: React.FC<AnimationsGalleryProps> = ({ onUpdateDraft, tokens }) => {
    const [testKey, setTestKey] = useState(0);

    const resetTest = () => setTestKey(prev => prev + 1);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Kinetics Lab</h2>
                    <p className="text-2xs font-bold text-white/30 uppercase tracking-widest">Teste a física e a cadência do ecossistema</p>
                </div>
                <button 
                    onClick={resetTest}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/40 text-3xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                >
                    <RotateCcw size={10} /> Re-trigger Animations
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {KINETIC_PRESETS.map((preset) => (
                    <KineticSpecimen 
                        key={preset.id}
                        preset={preset}
                        testKey={testKey}
                        onSelect={() => {
                            Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                        }}
                        isActive={tokens.animationSpeed === preset.tokens.animationSpeed && tokens.interfaceElasticity === preset.tokens.interfaceElasticity}
                        globalTokens={tokens}
                    />
                ))}
            </div>
        </div>
    );
};

const KineticSpecimen: React.FC<{ 
    preset: KineticPreset; 
    onSelect: () => void; 
    isActive: boolean; 
    globalTokens: any;
    testKey: number;
}> = ({ preset, onSelect, isActive, globalTokens, testKey }) => {
    
    // Spring configuration derived from elasticity
    const springConfig = {
        type: 'spring' as const,
        stiffness: 300 * (1.2 - preset.tokens.interfaceElasticity),
        damping: 10 + (preset.tokens.interfaceElasticity * 25),
        mass: 1
    };

    return (
        <motion.div 
            whileHover={{ x: 4 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. Header & Metadata (col-4) */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-[var(--theme-primary)]' : 'bg-white/5'}`}>
                            <Zap className={isActive ? 'text-white' : 'text-white/40'} size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-white">{preset.title}</h3>
                            <div className="flex gap-2 items-center">
                                <span className="text-[9px] font-black text-[var(--theme-primary)] uppercase">{preset.tokens.animationSpeed}s</span>
                                <span className="text-[9px] font-black text-white/20 uppercase">•</span>
                                <span className="text-[9px] font-black text-white/40 uppercase">{preset.tokens.interfaceElasticity * 100}% Elastic</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-2xs font-medium leading-relaxed text-white/30 uppercase tracking-wider">
                        {preset.description}
                    </p>
                    
                    {/* Haptic Test Button */}
                    <motion.button 
                        whileTap={{ scale: 1 - (preset.tokens.interfaceElasticity * 0.2) }}
                        transition={springConfig}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 text-3xs font-black uppercase tracking-widest"
                    >
                        Click to feel Haptic
                    </motion.button>
                </div>

                {/* 2. Physics Sandbox (col-4) */}
                <div className="lg:col-span-4 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center min-h-[160px]">
                    <div className="absolute top-3 left-4 text-[7px] font-black text-white/10 uppercase tracking-[0.3em]">Physics Sandbox</div>
                    
                    <motion.div 
                        key={`box-${testKey}`}
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ 
                            scale: 1.1, 
                            y: -10,
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={springConfig}
                        className="w-16 h-16 bg-gradient-to-br from-[var(--theme-primary)] to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                    >
                        <MousePointer2 className="text-white/40" size={20} />
                    </motion.div>

                    {/* Ground Reflection */}
                    <div className="absolute bottom-6 w-12 h-1.5 bg-black/40 blur-md rounded-full" />
                </div>

                {/* 3. Stagger Cadence Test (col-4) */}
                <div className="lg:col-span-4 bg-black/20 rounded-2xl border border-white/5 p-4 space-y-2 flex flex-col justify-center">
                    <div className="text-[7px] font-black text-white/10 uppercase tracking-[0.3em] mb-2">Stagger Entrance</div>
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={`stagger-${testKey}`}
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 * preset.tokens.animationSpeed * 10 } }
                            }}
                            className="space-y-1.5"
                        >
                            {[1, 2, 3, 4].map(i => (
                                <motion.div 
                                    key={i}
                                    variants={{
                                        hidden: { x: -20, opacity: 0 },
                                        visible: { x: 0, opacity: 1 }
                                    }}
                                    transition={springConfig}
                                    className="h-6 bg-white/[0.03] border border-white/5 rounded-lg flex items-center px-3"
                                >
                                    <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)]/20 mr-3" />
                                    <div className="h-1 w-1/2 bg-white/10 rounded-full" />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>

            {/* Active Marker */}
            {isActive && (
                <div className="absolute top-6 right-6">
                    <div className="w-6 h-6 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40">
                        <Check className="text-white" size={12} />
                    </div>
                </div>
            )}
        </motion.div>
    );
};
