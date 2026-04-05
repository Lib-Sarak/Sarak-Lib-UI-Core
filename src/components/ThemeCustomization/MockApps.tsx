import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Sparkles, BarChart3, MessageSquare, History, Users, Shield, Database, Box
} from 'lucide-react';
import { EMOJI_SETS } from '@sarak/lib-shared';

export const MockDashboard: React.FC<any> = ({ config, animationVariants, animationStyle }) => {
    return (
        <>
            <div className="mb-8">
                <h3
                    style={{
                        fontFamily: config['--font-heading'],
                        fontWeight: config['--font-weight-heading'],
                        letterSpacing: config['--letter-spacing-heading']
                    }}
                    className="text-2xl text-[var(--theme-title)] mb-2"
                >
                    Dashboard
                </h3>
                <p className="text-[var(--theme-muted)] text-xs opacity-60" style={{ fontFamily: config['--font-main'] }}>
                    System overview and real-time metrics.
                </p>
            </div>

            <div
                className="grid grid-cols-12 auto-rows-fr flex-grow"
                style={{ gap: config['--theme-gap'] }}
            >
                {/* Agent Profile Widget */}
                <motion.div
                    initial={animationVariants[animationStyle]?.card?.initial || animationVariants.none.card.initial}
                    animate={animationVariants[animationStyle]?.card?.animate || animationVariants.none.card.animate}
                    transition={animationVariants[animationStyle]?.card?.transition || animationVariants.none.card.transition}
                    className="col-span-12 lg:col-span-4 bg-[var(--theme-card)] rounded-[var(--radius-theme)] border-[var(--border-width)] border-[var(--theme-border)] p-5 shadow-soft relative overflow-hidden flex flex-col items-center text-center"
                    style={{ boxShadow: `0 4px 20px var(--shadow-color)` }}
                >
                    <div className="absolute inset-0 glass-effect opacity-[var(--glass-opacity)]"></div>
                    <div className="relative z-10 w-full">
                        <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)]/10 border-2 border-[var(--theme-primary)]/30 mx-auto mb-4 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-[var(--theme-primary)]" />
                        </div>
                        <div className="text-sm font-bold text-[var(--theme-title)] mb-1">Sarak AI Elite</div>
                        <div className="text-[10px] text-[var(--theme-muted)] uppercase font-black tracking-widest mb-1">Layout</div>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <div className="p-2 rounded-lg bg-[var(--theme-body)]/30 border border-[var(--theme-border)]/50">
                                <div className="text-[10px] text-[var(--theme-muted)] mb-1">Status</div>
                                <div className="text-[10px] font-bold text-emerald-500">Active</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[var(--theme-body)]/30 border border-[var(--theme-border)]/50">
                                <div className="text-[10px] text-[var(--theme-muted)] mb-1">Uptime</div>
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
                    className="col-span-12 lg:col-span-8 bg-[var(--theme-card)] rounded-[var(--radius-theme)] border-[var(--border-width)] border-[var(--theme-border)] p-6 shadow-soft relative overflow-hidden"
                    style={{ boxShadow: `0 4px 20px var(--shadow-color)` }}
                >
                    <div className="absolute inset-0 glass-effect opacity-[var(--glass-opacity)]"></div>
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Collection Performance</div>
                            <Sparkles className="w-4 h-4 text-[var(--theme-primary)]" />
                        </div>
                        <div className="flex-grow flex items-end gap-3 px-2 pb-2">
                            {[40, 75, 45, 95, 65, 85, 55, 90, 70, 80].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-grow bg-gradient-to-t from-[var(--theme-primary)]/40 to-[var(--theme-primary)] rounded-t-md transition-all duration-500 hover:brightness-125 cursor-pointer"
                                    style={{ height: `${h}%` }}
                                ></div>
                            ))}
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
                    className="col-span-12 bg-[var(--theme-card)] rounded-[var(--radius-theme)] border-[var(--border-width)] border-[var(--theme-border)] p-6 shadow-soft"
                    style={{ boxShadow: `0 4px 20px var(--shadow-color)` }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[11px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Featured Components</div>
                        <div className="text-xl">✨</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Buttons section */}
                        <div className="space-y-3">
                            <div className="text-[9px] uppercase font-bold text-[var(--theme-muted)] mb-2">Button Styles</div>
                            <button className="w-full py-2 px-4 bg-[var(--theme-primary)] text-white text-[10px] font-bold rounded-[var(--radius-theme)] shadow-lg shadow-[var(--theme-primary)]/20 hover:brightness-110 transition-all">
                                Primary Action
                            </button>
                            <button className="w-full py-2 px-4 bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-title)] text-[10px] font-bold rounded-[var(--radius-theme)] hover:bg-[var(--theme-body)]/50 transition-all">
                                Outline Button
                            </button>
                            <button className="w-full py-2 px-4 text-[var(--theme-muted)] text-[10px] font-bold hover:text-[var(--theme-primary)] transition-all">
                                Ghost Variant
                            </button>
                        </div>

                        {/* Badges & Tags */}
                        <div className="space-y-3">
                            <div className="text-[9px] uppercase font-bold text-[var(--theme-muted)] mb-2">Identity & Status</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 text-[9px] font-bold text-[var(--theme-primary)]">Featured</span>
                                <span className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold text-emerald-500">Success</span>
                                <span className="px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-[9px] font-bold text-rose-500">Error</span>
                            </div>
                            <div className="p-3 rounded-[var(--radius-theme)] bg-[var(--theme-body)]/30 border border-[var(--theme-border)]/50">
                                <div className="text-[10px] text-[var(--theme-title)] font-medium leading-relaxed">
                                    Typography Test: The quick brown fox jumps over the lazy dog.
                                </div>
                            </div>
                        </div>

                        {/* Interactive */}
                        <div className="space-y-3">
                            <div className="text-[9px] uppercase font-bold text-[var(--theme-muted)] mb-2">Interactive Elements</div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Input field style..."
                                    readOnly
                                    className="w-full bg-[var(--theme-body)]/50 border border-[var(--theme-border)] rounded-[var(--radius-theme)] px-3 py-2 text-[10px] text-[var(--theme-title)] focus:outline-none focus:border-[var(--theme-primary)] transition-all"
                                />
                            </div>
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
                        className="bg-[var(--theme-card)] p-4 rounded-t-[var(--radius-theme)] rounded-br-[var(--radius-theme)] border-[var(--border-width)] border-[var(--theme-border)] shadow-soft max-w-[80%] relative overflow-hidden"
                        style={{ boxShadow: `0 2px 10px var(--shadow-color)` }}
                    >
                        <div className="absolute inset-0 glass-effect opacity-[var(--glass-opacity)]"></div>
                        <div className="relative z-10 text-[11px] text-[var(--theme-title)] leading-relaxed">
                            Hello! I am Sarak assistant. How can I help with your data analysis today?
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
                className="bg-[var(--theme-card)] rounded-[var(--radius-theme)] border-[var(--border-width)] border-[var(--theme-border)] overflow-hidden relative"
                style={{ boxShadow: `0 4px 20px var(--shadow-color)` }}
            >
                <div className="absolute inset-0 glass-effect opacity-[var(--glass-opacity)]"></div>
                <table className="w-full text-left text-[10px] relative z-10">
                    <thead className="bg-[var(--theme-card)] border-b border-[var(--theme-border)]">
                        <tr>
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
                        className="bg-[var(--theme-card)] p-4 rounded-[var(--radius-theme)] border-[var(--border-width)] border-[var(--theme-border)] flex items-center justify-between shadow-soft group relative overflow-hidden"
                        style={{ boxShadow: `0 2px 10px var(--shadow-color)` }}
                    >
                        <div className="absolute inset-0 glass-effect opacity-[var(--glass-opacity)]"></div>
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
