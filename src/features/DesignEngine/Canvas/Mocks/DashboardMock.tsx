import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import SarakChartEngine from '../../../../components/engines/charts/SarakChartEngine';

export const MockDashboard: React.FC<any> = ({ animationVariants, animationStyle, tokens }) => {
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
                    initial={animationVariants[animationStyle]?.page?.initial || animationVariants.none?.page?.initial}
                    animate={animationVariants[animationStyle]?.page?.animate || animationVariants.none?.page?.animate}
                    transition={{ ...(animationVariants[animationStyle]?.page?.transition || animationVariants.none?.page?.transition), duration: parseFloat(tokens.animationSpeed || '0.4') }}
                    className="col-span-12 lg:col-span-4 bg-theme-card relative overflow-hidden flex flex-col items-center text-center shadow-[var(--theme-shadow)]"
                    style={{ 
                        padding: 'var(--theme-card-pad)', 
                        borderRadius: 'var(--radius-theme)',
                        borderWidth: 'var(--theme-border-width)',
                        borderStyle: 'var(--theme-border-style)',
                        borderColor: 'var(--theme-border)'
                    }}
                >
                    <div className="relative z-10 w-full">
                        <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)]/10 border-2 border-[var(--theme-primary)]/30 mx-auto mb-4 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-[var(--theme-primary)]" />
                        </div>
                        <div className="text-sm font-bold text-[var(--theme-title)] mb-1">Sarak AI Elite</div>
                        <div className="text-2xs text-[var(--theme-muted)] uppercase font-black tracking-widest mb-1">Layout</div>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <div className="p-2 bg-[var(--theme-card)] border border-[var(--theme-border)] !rounded-lg flex flex-col items-center justify-center">
                                <div className="text-3xs text-[var(--theme-muted)] mb-1 uppercase">Status</div>
                                <div className="text-2xs font-bold text-emerald-500">Active</div>
                            </div>
                            <div className="p-2 bg-[var(--theme-card)] border border-[var(--theme-border)] !rounded-lg flex flex-col items-center justify-center">
                                <div className="text-3xs text-[var(--theme-muted)] mb-1 uppercase">Uptime</div>
                                <div className="text-2xs font-bold text-[var(--theme-title)]">99.9%</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Large Performance Widget */}
                <motion.div
                    initial={animationVariants[animationStyle]?.page?.initial || animationVariants.none?.page?.initial}
                    animate={animationVariants[animationStyle]?.page?.animate || animationVariants.none?.page?.animate}
                    transition={{ ...(animationVariants[animationStyle]?.page?.transition || animationVariants.none?.page?.transition), delay: 0.1, duration: parseFloat(tokens.animationSpeed || '0.4') }}
                    className="col-span-12 lg:col-span-8 bg-theme-card relative overflow-hidden shadow-[var(--theme-shadow)]"
                    style={{ 
                        padding: 'var(--theme-card-pad)', 
                        borderRadius: 'var(--radius-theme)',
                        borderWidth: 'var(--theme-border-width)',
                        borderStyle: 'var(--theme-border-style)',
                        borderColor: 'var(--theme-border)'
                    }}
                >
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Performance Telemetry</div>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-2xs font-bold text-[var(--theme-primary)] uppercase">Live</span>
                            </div>
                        </div>
                        <div className="flex-grow min-h-[160px] relative">
                            <SarakChartEngine 
                                type={(tokens?.chartType || 'bar') as any}
                                data={[
                                    { name: 'Jan', value: 400 },
                                    { name: 'Feb', value: 750 },
                                    { name: 'Mar', value: 450 },
                                    { name: 'Apr', value: 950 },
                                    { name: 'May', value: 650 },
                                    { name: 'Jun', value: 850 },
                                    { name: 'Jul', value: 550 },
                                    { name: 'Aug', value: 900 },
                                    { name: 'Sep', value: 700 },
                                    { name: 'Oct', value: 800 }
                                ]}
                                config={{
                                    engine: 'echarts',
                                    xAxisKey: 'name',
                                    dataKey: 'value'
                                }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Temperature / Health Widget */}
                <motion.div
                    initial={animationVariants[animationStyle]?.page?.initial || animationVariants.none?.page?.initial}
                    animate={animationVariants[animationStyle]?.page?.animate || animationVariants.none?.page?.animate}
                    transition={{ ...(animationVariants[animationStyle]?.page?.transition || animationVariants.none?.page?.transition), delay: 0.2, duration: parseFloat(tokens.animationSpeed || '0.4') }}
                    className="col-span-12 lg:col-span-4 bg-theme-card relative overflow-hidden shadow-[var(--theme-shadow)]"
                    style={{ 
                        padding: 'var(--theme-card-pad)', 
                        borderRadius: 'var(--radius-theme)',
                        borderWidth: 'var(--theme-border-width)',
                        borderStyle: 'var(--theme-border-style)',
                        borderColor: 'var(--theme-border)'
                    }}
                >
                    <div className="relative z-10 h-full flex flex-col items-center justify-center">
                        <div className="w-full text-left mb-4">
                            <div className="text-xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Core Temperature</div>
                        </div>
                        <div className="w-full h-[140px]">
                            <SarakChartEngine 
                                type="gauge"
                                data={[{ name: 'Temp', value: 68 }]}
                                config={{ engine: 'echarts', dataKey: 'value' }}
                            />
                        </div>
                        <div className="text-2xs text-[var(--theme-muted)] mt-2 uppercase font-bold tracking-tighter">Thermal Status: <span className="text-emerald-500">Optimal</span></div>
                    </div>
                </motion.div>

                {/* Featured Components Widget */}
                    <motion.div
                    initial={animationVariants[animationStyle]?.page?.initial || animationVariants.none?.page?.initial}
                    animate={animationVariants[animationStyle]?.page?.animate || animationVariants.none?.page?.animate}
                    transition={{ ...(animationVariants[animationStyle]?.page?.transition || animationVariants.none?.page?.transition), delay: 0.3, duration: parseFloat(tokens.animationSpeed || '0.4') }}
                    className="col-span-12 bg-theme-card shadow-[var(--theme-shadow)]"
                    style={{ 
                        padding: 'var(--theme-card-pad)', 
                        borderRadius: 'var(--radius-theme)',
                        borderWidth: 'var(--theme-border-width)',
                        borderStyle: 'var(--theme-border-style)',
                        borderColor: 'var(--theme-border)'
                    }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Featured Components</div>
                        <div className="text-xl">✨</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--theme-gap)' }}>
                        {/* Buttons section */}
                        <div className="space-y-3">
                            <div className="uppercase font-bold text-[var(--theme-muted)] mb-2" style={{ fontSize: 'calc(var(--theme-font-size-base) * 0.7)' }}>Button Styles</div>
                            <button className="w-full py-2 px-4 bg-[var(--theme-primary)] text-white font-bold rounded-[var(--radius-theme)] shadow-lg shadow-[var(--theme-primary)]/20 hover:brightness-110 transition-all" style={{ fontSize: 'calc(var(--theme-font-size-base) * 0.8)', fontFamily: 'var(--font-tab, var(--font-heading))' }}>
                                Primary Action
                            </button>
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

