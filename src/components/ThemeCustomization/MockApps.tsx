import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Sparkles, BarChart3, MessageSquare, History, Users, Shield, Database, Box
} from 'lucide-react';
import { EMOJI_SETS } from '@sarak/lib-shared';

export const MockDashboard: React.FC<any> = ({ config, animationVariants, animationStyle, tokens }) => {
    return (
        <>
            <header className="mb-8" style={{ marginBottom: 'var(--theme-gap)' }}>
                <h3
                    style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: "var(--heading-weight)",
                        letterSpacing: "var(--heading-spacing)",
                        fontSize: 'calc(var(--theme-font-size-base) * 1.8)'
                    }}
                    className="text-[var(--theme-title)] mb-2"
                >
                    Elite Dashboard
                </h3>
                <p className="text-[var(--theme-main)] opacity-60" style={{ fontFamily: "var(--font-main)", fontSize: 'calc(var(--theme-font-size-base) * 0.9)' }}>
                    Sistema unificado de telemetria em tempo real.
                </p>
            </header>

            <div
                className="grid grid-cols-12 auto-rows-fr flex-grow"
                style={{ gap: "var(--theme-gap, 1.5rem)" }}
            >
                {/* Agent Profile Widget */}
                <motion.div
                    initial={animationVariants[animationStyle]?.card?.initial || animationVariants.none.card.initial}
                    animate={animationVariants[animationStyle]?.card?.animate || animationVariants.none.card.animate}
                    transition={animationVariants[animationStyle]?.card?.transition || animationVariants.none.card.transition}
                    className="col-span-12 lg:col-span-4 bg-theme-card relative overflow-hidden flex flex-col items-center text-center"
                    style={{ padding: 'var(--theme-pad)' }}
                >
                    <div className="relative z-10 w-full">
                        <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)]/10 border-2 border-[var(--theme-primary)]/30 mx-auto mb-4 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-[var(--theme-primary)]" />
                        </div>
                        <div className="text-sm font-bold text-[var(--theme-title)] mb-1">Sarak AI Elite</div>
                        <div className="text-[10px] text-[var(--theme-muted)] uppercase font-black tracking-widest mb-1">Layout</div>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <div className="p-2 bg-theme-card !rounded-lg flex flex-col items-center justify-center">
                                <div className="text-[8px] text-[var(--theme-muted)] mb-1 uppercase">Status</div>
                                <div className="text-[10px] font-bold text-emerald-500">Active</div>
                            </div>
                            <div className="p-2 bg-theme-card !rounded-lg flex flex-col items-center justify-center">
                                <div className="text-[8px] text-[var(--theme-muted)] mb-1 uppercase">Uptime</div>
                                <div className="text-[10px] font-bold text-[var(--theme-title)]">99.9%</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Large Performance Widget */}
                <motion.div
                    initial={animationVariants[animationStyle]?.card?.initial || animationVariants.none.card.initial}
                    animate={animationVariants[animationStyle]?.card?.animate || animationVariants.none.card.animate}
                    transition={{ ...(animationVariants[animationStyle]?.card?.transition || animationVariants.none.card.transition), delay: 0.1 }}
                    className="col-span-12 lg:col-span-8 bg-theme-card relative overflow-hidden"
                    style={{ padding: 'var(--theme-pad)' }}
                >
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Collection Performance</div>
                            <Sparkles className="w-4 h-4 text-[var(--theme-primary)]" />
                        </div>
                        <div className="flex-grow flex items-end gap-3 px-2 pb-2">
                            {[40, 75, 45, 95, 65, 85, 55, 90, 70, 80].map((h, i) => {
                                const style = (tokens?.chartStyle || 'bar');
                                const palette = tokens?.chartPalette || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                                const barColor = palette[i % palette.length];
                                
                                return (
                                    <div
                                        key={i}
                                        className={`flex-grow transition-all duration-500 hover:brightness-125 cursor-pointer 
                                            ${style === 'bar' ? 'rounded-t-md opacity-90' : ''}
                                            ${style === 'glass' ? 'border backdrop-blur-sm rounded-t-md opacity-60' : ''}
                                            ${style === 'solid' ? 'rounded-t-sm' : ''}
                                            ${style === 'line' ? 'bg-transparent border-t-2 border-x rounded-t-full' : ''}
                                        `}
                                        style={{ 
                                            height: `${h}%`,
                                            backgroundColor: style !== 'line' ? barColor : 'transparent',
                                            borderColor: style === 'line' || style === 'glass' ? barColor : 'transparent',
                                            boxShadow: style === 'solid' ? `0 4px 12px ${barColor}20` : 'none'
                                        }}
                                    ></div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--theme-border)]/30 flex justify-between">
                            <div className="text-[10px] text-[var(--theme-muted)]">Avg Latency: <span className="text-[var(--theme-title)] font-bold">24ms</span></div>
                            <div className="text-[10px] text-[var(--theme-muted)]">Tokens/s: <span className="text-[var(--theme-title)] font-bold">1.4k</span></div>
                        </div>
                    </div>
                </motion.div>

                {/* Featured Components Widget */}
                <motion.div
                    initial={animationVariants[animationStyle]?.card?.initial || animationVariants.none.card.initial}
                    animate={animationVariants[animationStyle]?.card?.animate || animationVariants.none.card.animate}
                    transition={{ ...(animationVariants[animationStyle]?.card?.transition || animationVariants.none.card.transition), delay: 0.3 }}
                    className="col-span-12 bg-theme-card"
                    style={{ padding: 'var(--theme-pad)' }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[11px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Featured Components</div>
                        <div className="text-xl">✨</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--theme-gap)' }}>
                        {/* Buttons section */}
                        <div className="space-y-3">
                            <div className="uppercase font-bold text-[var(--theme-muted)] mb-2" style={{ fontSize: 'calc(var(--theme-font-size-base) * 0.7)' }}>Button Styles</div>
                            <button className="w-full py-2 px-4 bg-[var(--theme-primary)] text-white font-bold rounded-[var(--radius-theme)] shadow-lg shadow-[var(--theme-primary)]/20 hover:brightness-110 transition-all" style={{ fontSize: 'calc(var(--theme-font-size-base) * 0.8)', fontFamily: 'var(--font-tab, var(--font-heading))' }}>
                                Primary Action
                            </button>
                            {/* ... (simplificado para manter foco na densidade) ... */}
                        </div>

                        {/* Badges & Tags */}
                        <div className="space-y-3">
                            <div className="uppercase font-bold text-[var(--theme-muted)] mb-2" style={{ fontSize: 'calc(var(--theme-font-size-base) * 0.7)' }}>Identity & Status</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 font-bold text-[var(--theme-primary)]" style={{ fontSize: 'calc(var(--theme-font-size-base) * 0.7)' }}>Featured</span>
                            </div>
                        </div>

                        {/* Interactive */}
                        <div className="space-y-3">
                            <div className="uppercase font-bold text-[var(--theme-muted)] mb-2" style={{ fontSize: 'calc(var(--theme-font-size-base) * 0.7)' }}>Interactive Elements</div>
                            <input
                                type="text"
                                placeholder="Input style..."
                                readOnly
                                className="w-full bg-[var(--theme-body)]/50 border border-[var(--theme-border)] rounded-[var(--radius-theme)] px-3 py-2 text-[var(--theme-title)] focus:outline-none focus:border-[var(--theme-primary)] transition-all"
                                style={{ fontSize: 'calc(var(--theme-font-size-base) * 0.8)' }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export const MockChat: React.FC<any> = ({ config, animationVariants, animationStyle }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow flex flex-col gap-4 mb-4">
                <motion.div
                    initial={animationVariants[animationStyle]?.card?.initial || animationVariants.none.card.initial}
                    animate={animationVariants[animationStyle]?.card?.animate || animationVariants.none.card.animate}
                    transition={animationVariants[animationStyle]?.card?.transition || animationVariants.none.card.transition}
                    className="flex justify-start"
                >
                    <div
                        className="bg-theme-card p-6 border border-white/5 shadow-2xl max-w-[85%] relative overflow-hidden"
                        style={{ borderBottomLeftRadius: 0 }}
                    >
                        <div className="relative z-10 text-[11px] text-[var(--theme-title)] font-medium leading-relaxed">
                            <span className="text-[var(--theme-primary)] font-black mr-2 opacity-60">Sarak Assistant:</span>
                            Olá! Eu sou o Sarak AI. Como posso otimizar seus fluxos de trabalho hoje?
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={animationVariants[animationStyle]?.card?.initial || animationVariants.none.card.initial}
                    animate={animationVariants[animationStyle]?.card?.animate || animationVariants.none.card.animate}
                    transition={{ ...(animationVariants[animationStyle]?.card?.transition || animationVariants.none.card.transition), delay: 0.1 }}
                    className="flex justify-end"
                >
                    <div className="bg-[var(--theme-primary)] p-4 rounded-t-[var(--radius-theme)] rounded-bl-[var(--radius-theme)] shadow-soft max-w-[80%]">
                        <div className="text-[11px] text-white leading-relaxed font-medium">
                            Can you show me the error logs from the last 2 hours on the dashboard?
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export const MockLogs: React.FC<any> = ({ config, animationVariants, animationStyle }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-sm font-bold text-[var(--theme-title)]">Execution History</h3>
            </div>
            <motion.div
                initial={animationVariants[animationStyle]?.card?.initial || animationVariants.none.card.initial}
                animate={animationVariants[animationStyle]?.card?.animate || animationVariants.none.card.animate}
                transition={animationVariants[animationStyle]?.card?.transition || animationVariants.none.card.transition}
                className="bg-theme-card overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-white/[0.02] pointer-events-none"></div>
                <table className="w-full text-left text-[10px] relative z-10">
                    <thead className="bg-[var(--theme-card)] border-b border-[var(--theme-border)]">
                        <tr style={{ fontFamily: 'var(--font-tab, var(--font-heading))' }}>
                            <th className="p-3 font-bold text-[var(--theme-muted)] uppercase tracking-wider">Payload</th>
                            <th className="p-3 font-bold text-[var(--theme-muted)] uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--theme-border)]/30">
                        {[
                            { name: "Scraper_V2", status: "Completed", color: "text-emerald-500" },
                            { name: "Parser_Engine", status: "Failed", color: "text-rose-500" }
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-[var(--theme-primary)]/5 transition-colors">
                                <td className="p-3 font-medium text-[var(--theme-title)]">{row.name}</td>
                                <td className={`p-3 font-bold ${row.color}`}>{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

export const MockSettings: React.FC<any> = ({ config, animationVariants, animationStyle }) => {
    return (
        <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-[var(--theme-title)] mb-6">Security Settings</h3>
            <div className="space-y-4">
                {[
                    { label: "Two-Factor Authentication", icon: <Shield />, active: true },
                    { label: "Real-time Access Logs", icon: <Database />, active: false }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={animationVariants[animationStyle]?.card?.initial || animationVariants.none.card.initial}
                        animate={animationVariants[animationStyle]?.card?.animate || animationVariants.none.card.animate}
                        transition={{ ...(animationVariants[animationStyle]?.card?.transition || animationVariants.none.card.transition), delay: i * 0.1 }}
                        className="bg-theme-card p-4 flex items-center justify-between group relative overflow-hidden"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-2 rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                                {React.cloneElement(item.icon as React.ReactElement, { className: "w-4 h-4" })}
                            </div>
                            <span className="text-[11px] font-medium text-[var(--theme-title)]">{item.label}</span>
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
