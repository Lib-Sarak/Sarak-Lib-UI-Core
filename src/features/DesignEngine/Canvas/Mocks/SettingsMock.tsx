import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

export const MockSettings: React.FC<any> = ({ animationVariants, animationStyle, tokens }) => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <h3 className="text-sm font-bold text-[var(--theme-title)] mb-6">Engine Visualization</h3>
            
            <div className="grid grid-cols-1 gap-6 flex-grow mb-6">
                {/* Flow Engine Mock */}
                <div className="bg-theme-body/20 rounded-2xl border border-theme-text/5 relative overflow-hidden p-4">
                    <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-theme-text/5 border border-theme-text/10">
                        <span className="text-[8px] font-black uppercase text-theme-text/40 tracking-widest">Flow Architecture</span>
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
                            <SarakIcon name="Zap" className="w-4 h-4 text-[var(--theme-primary)]" />
                            <span className="text-2xs font-black uppercase tracking-widest text-theme-text">Source</span>
                        </div>
                        
                        <div className="w-px h-6 bg-gradient-to-b from-[var(--theme-primary)] to-transparent" />
                        
                        <div 
                            className="p-4 bg-theme-text/5 border border-theme-text/10 flex items-center gap-3"
                            style={{ borderRadius: `${tokens?.flowNodeRadius ?? 12}px` }}
                        >
                            <SarakIcon name="Box" className="w-4 h-4 text-theme-text/40" />
                            <span className="text-2xs font-black uppercase tracking-widest text-theme-text/40">Processor</span>
                        </div>
                    </div>
                </div>

            </div>

            <div className="space-y-3">
                {[
                    { label: "Two-Factor Authentication", icon: <SarakIcon name="Shield" />, active: true },
                    { label: "Real-time Access Logs", icon: <SarakIcon name="Database" />, active: false }
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
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-theme-text transition-all ${item.active ? 'left-[18px]' : 'left-0.5'}`}></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

