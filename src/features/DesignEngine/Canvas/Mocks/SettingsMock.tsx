import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Box, Shield, Database } from 'lucide-react';

export const MockSettings: React.FC<any> = ({ animationVariants, animationStyle, tokens }) => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <h3 className="text-sm font-bold text-[var(--theme-title)] mb-6">Engine Visualization</h3>
            
            <div className="grid grid-cols-2 gap-6 flex-grow mb-6">
                {/* Flow Engine Mock */}
                <div className="bg-black/20 rounded-2xl border border-white/5 relative overflow-hidden p-4">
                    <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Flow Architecture</span>
                    </div>
                    {/* Dynamic Grid */}
                    <div 
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: tokens?.flowGridStyle === 'dots' 
                                ? 'radial-gradient(circle, white 1px, transparent 1px)' 
                                : 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />
                    
                    <div className="relative z-10 flex flex-col items-center justify-center h-full" style={{ gap: 'var(--theme-gap)' }}>
                        <div 
                            className="p-4 bg-[var(--theme-primary)]/20 border border-[var(--theme-primary)]/40 flex items-center gap-3 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.2)]"
                            style={{ borderRadius: `${tokens?.flowNodeRadius ?? 12}px` }}
                        >
                            <Zap className="w-4 h-4 text-[var(--theme-primary)]" />
                            <span className="text-2xs font-black uppercase tracking-widest text-white">Source</span>
                        </div>
                        
                        <div className="w-px h-6 bg-gradient-to-b from-[var(--theme-primary)] to-transparent" />
                        
                        <div 
                            className="p-4 bg-white/5 border border-white/10 flex items-center gap-3"
                            style={{ borderRadius: `${tokens?.flowNodeRadius ?? 12}px` }}
                        >
                            <Box className="w-4 h-4 text-white/40" />
                            <span className="text-2xs font-black uppercase tracking-widest text-white/40">Processor</span>
                        </div>
                    </div>
                </div>

                {/* Security/Sovereignty Mock */}
                <div className="bg-black/20 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col items-center justify-center p-6 group">
                    <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        <span className="text-[8px] font-black uppercase text-blue-400 tracking-widest">Security Orchestrator</span>
                    </div>

                    <div 
                        className="relative flex items-center justify-center bg-black/40 border border-white/10 transition-all duration-700"
                        style={{ 
                            width: `${(tokens?.qrSize ?? 200) / 2}px`, 
                            height: `${(tokens?.qrSize ?? 200) / 2}px`,
                            borderRadius: `${tokens?.securityBorderRadius ?? 16}px`,
                            boxShadow: tokens?.securityShieldGlow ? `0 0 ${tokens.securityShieldGlow}px rgba(59, 130, 246, 0.5)` : 'none'
                        }}
                    >
                        <div className="absolute inset-0 opacity-20 pointer-events-none p-4">
                            {/* Fake QR pattern */}
                            <div className="w-full h-full border-2 border-white/40 border-dashed rounded-sm" />
                        </div>
                        <Shield className={`w-8 h-8 text-blue-400 relative z-10 ${tokens?.securityShieldGlow ? 'animate-pulse' : ''}`} style={{ animationDuration: `${tokens?.securityPulseSpeed ?? 2}s` }} />
                    </div>

                    <div className="mt-4 text-center">
                        <div className="text-[10px] font-black uppercase text-white/60 mb-1">Status: Protected</div>
                        <div className="flex gap-1 justify-center">
                            {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-blue-500/40" />)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {[
                    { label: "Two-Factor Authentication", icon: <Shield />, active: true },
                    { label: "Real-time Access Logs", icon: <Database />, active: false }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={animationVariants[animationStyle]?.page?.initial || animationVariants.none?.page?.initial}
                        animate={animationVariants[animationStyle]?.page?.animate || animationVariants.none?.page?.animate}
                        transition={{ ...(animationVariants[animationStyle]?.page?.transition || animationVariants.none?.page?.transition), delay: i * 0.1, duration: parseFloat(tokens.animationSpeed || '0.4') }}
                        className="sarak-card p-4 flex items-center justify-between group relative overflow-hidden"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-2 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                                {React.cloneElement(item.icon as React.ReactElement, { className: "w-4 h-4" })}
                            </div>
                            <span className="text-xs font-medium text-[var(--theme-title)]">{item.label}</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full relative z-10 transition-colors ${item.active ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-muted)]/20'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${item.active ? 'left-[18px]' : 'left-0.5'}`}></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

