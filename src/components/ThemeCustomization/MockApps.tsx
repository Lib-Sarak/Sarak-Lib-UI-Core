import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Sparkles, BarChart3, MessageSquare, History, Users, Shield, Database, Box
} from 'lucide-react';
import { EMOJI_SETS } from '../../constants/design-tokens';
import SarakChartEngine from '../engines/charts/SarakChartEngine';

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
                        <div className="text-[10px] text-[var(--theme-muted)] uppercase font-black tracking-widest mb-1">Layout</div>
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <div className="p-2 bg-[var(--theme-card)] border border-[var(--theme-border)] !rounded-lg flex flex-col items-center justify-center">
                                <div className="text-[8px] text-[var(--theme-muted)] mb-1 uppercase">Status</div>
                                <div className="text-[10px] font-bold text-emerald-500">Active</div>
                            </div>
                            <div className="p-2 bg-[var(--theme-card)] border border-[var(--theme-border)] !rounded-lg flex flex-col items-center justify-center">
                                <div className="text-[8px] text-[var(--theme-muted)] mb-1 uppercase">Uptime</div>
                                <div className="text-[10px] font-bold text-[var(--theme-title)]">99.9%</div>
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
                            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Performance Telemetry</div>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] font-bold text-[var(--theme-primary)] uppercase">Live</span>
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
                            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Core Temperature</div>
                        </div>
                        <div className="w-full h-[140px]">
                            <SarakChartEngine 
                                type="gauge"
                                data={[{ name: 'Temp', value: 68 }]}
                                config={{ engine: 'echarts', dataKey: 'value' }}
                            />
                        </div>
                        <div className="text-[10px] text-[var(--theme-muted)] mt-2 uppercase font-bold tracking-tighter">Thermal Status: <span className="text-emerald-500">Optimal</span></div>
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

export const MockChat: React.FC<any> = ({ config, animationVariants, animationStyle, tokens }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow flex flex-col gap-4 mb-4">
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: (tokens?.chatAnimationSpeed || 0.05) * 10 }}
                    className="flex justify-start"
                >
                    <div
                        className={`p-6 border border-white/5 shadow-2xl max-w-[85%] relative overflow-hidden transition-all duration-500
                            ${tokens?.chatBubbleStyle === 'glass' ? 'bg-white/10 backdrop-blur-md rounded-2xl rounded-bl-none' : ''}
                            ${tokens?.chatBubbleStyle === 'solid' ? 'bg-[var(--theme-card)] rounded-2xl rounded-bl-none shadow-xl' : ''}
                            ${tokens?.chatBubbleStyle === 'minimal' ? 'bg-transparent border-l-4 border-l-[var(--theme-primary)] rounded-none p-4' : ''}
                        `}
                    >
                        <div className="relative z-10 text-[11px] text-[var(--theme-title)] font-medium leading-relaxed">
                            <span className="text-[var(--theme-primary)] font-black mr-2 opacity-60 uppercase text-[8px] tracking-widest">Sarak AI:</span>
                            Olá! Eu sou o Sarak AI. Como posso otimizar seus fluxos de trabalho hoje?
                        </div>
                    </div>
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                        duration: (tokens?.chatAnimationSpeed || 0.05) * 10, 
                        delay: (tokens?.chatAnimationSpeed || 0.05) * 5 
                    }}
                    className="flex justify-end"
                >
                    <div className={`p-4 shadow-soft max-w-[80%] transition-all duration-500
                        ${tokens?.chatBubbleStyle === 'minimal' ? 'bg-white/5 border border-white/10 rounded-lg' : 'bg-[var(--theme-primary)] rounded-2xl rounded-br-none'}
                    `}>
                        <div className={`text-[11px] leading-relaxed font-medium ${tokens?.chatBubbleStyle === 'minimal' ? 'text-[var(--theme-title)]/80' : 'text-white'}`}>
                            Pode me mostrar os logs de erro das últimas 2 horas?
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export const MockLogs: React.FC<any> = ({ config, animationVariants, animationStyle, tokens }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-sm font-bold text-[var(--theme-title)]">Execution History</h3>
            </div>
            <motion.div
                initial={animationVariants[animationStyle]?.page?.initial || animationVariants.none?.page?.initial}
                animate={animationVariants[animationStyle]?.page?.animate || animationVariants.none?.page?.animate}
                transition={{ ...(animationVariants[animationStyle]?.page?.transition || animationVariants.none?.page?.transition), duration: parseFloat(tokens.animationSpeed || '0.4') }}
                className="bg-theme-card shadow-[var(--theme-shadow)] overflow-hidden relative"
                style={{ 
                    borderRadius: 'var(--radius-theme)',
                    borderWidth: 'var(--theme-border-width)',
                    borderStyle: 'var(--theme-border-style)',
                    borderColor: 'var(--theme-border)'
                }}
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

export const MockSettings: React.FC<any> = ({ config, animationVariants, animationStyle, tokens }) => {
    return (
        <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-[var(--theme-title)] mb-6">Engine Visualization</h3>
            
            {/* Flow Engine Mock */}
            <div className="flex-grow bg-black/20 rounded-2xl border border-white/5 relative overflow-hidden p-4 mb-6">
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
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
                    <div 
                        className="p-4 bg-[var(--theme-primary)]/20 border border-[var(--theme-primary)]/40 flex items-center gap-3 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.2)]"
                        style={{ borderRadius: `${tokens?.flowNodeRadius ?? 12}px` }}
                    >
                        <Zap className="w-4 h-4 text-[var(--theme-primary)]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Source Engine</span>
                    </div>
                    
                    <div className="w-px h-8 bg-gradient-to-b from-[var(--theme-primary)] to-transparent" />
                    
                    <div 
                        className="p-4 bg-white/5 border border-white/10 flex items-center gap-3"
                        style={{ borderRadius: `${tokens?.flowNodeRadius ?? 12}px` }}
                    >
                        <Box className="w-4 h-4 text-white/40" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Data Processor</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { label: "Two-Factor Authentication", icon: <Shield />, active: true },
                    { label: "Real-time Access Logs", icon: <Database />, active: false }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={animationVariants[animationStyle]?.page?.initial || animationVariants.none?.page?.initial}
                        animate={animationVariants[animationStyle]?.page?.animate || animationVariants.none?.page?.animate}
                        transition={{ ...(animationVariants[animationStyle]?.page?.transition || animationVariants.none?.page?.transition), delay: i * 0.1, duration: parseFloat(tokens.animationSpeed || '0.4') }}
                        className="bg-theme-card border-[var(--theme-border-width)] border-[var(--theme-border-style)] border-[var(--theme-border)] p-4 flex items-center justify-between group relative overflow-hidden"
                        style={{ borderRadius: 'var(--radius-theme)' }}
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

export const MockComponents: React.FC<any> = ({ tokens }) => {
    return (
        <div className="space-y-8">
            <h3 className="text-sm font-bold text-[var(--theme-title)] mb-6">Component Showcase</h3>
            
            <div className="grid grid-cols-2 gap-6">
                {/* Buttons */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Button States</div>
                    <div className="flex flex-col gap-3">
                        <button className="bg-[var(--theme-primary)] text-white px-4 py-2 rounded-theme shadow-theme font-bold text-[11px]">Primary Action</button>
                        <button className="border border-[var(--theme-primary)] text-[var(--theme-primary)] px-4 py-2 rounded-theme font-bold text-[11px]">Secondary Outline</button>
                        <button className="text-[var(--theme-title)] px-4 py-2 rounded-theme bg-white/5 font-bold text-[11px]">Ghost Neutral</button>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Inputs & Toggles</div>
                    <div className="space-y-3">
                        <input type="text" placeholder="Design Engine Input..." className="w-full bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-theme px-3 py-2 text-[11px] text-[var(--theme-title)]" />
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-theme">
                            <span className="text-[10px] text-[var(--theme-title)]">Dynamic Switch</span>
                            <div className="w-8 h-4 bg-[var(--theme-primary)] rounded-full relative">
                                <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges & Feedback */}
            <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Badges & Indicators</div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold">Success</span>
                    <span className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-bold">Alert</span>
                    <span className="px-2 py-1 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 text-[9px] font-bold">Processing</span>
                    <span className="px-2 py-1 rounded-full bg-white/5 text-white/40 border border-white/10 text-[9px] font-bold">Offline</span>
                </div>
            </div>
        </div>
    );
};

export const MockTypography: React.FC<any> = ({ tokens }) => {
    return (
        <div className="space-y-8 max-w-2xl">
            <header>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-primary)] mb-2">Typography Engine</div>
                <h1 style={{ fontSize: 'calc(var(--theme-font-size-base) * 2.5)', fontWeight: 'var(--heading-weight)', letterSpacing: 'var(--heading-spacing)', fontFamily: 'var(--font-heading)' }} className="text-[var(--theme-title)]">The quick brown fox</h1>
            </header>

            <div className="space-y-6">
                <section>
                    <h2 style={{ fontSize: 'calc(var(--theme-font-size-base) * 1.8)', fontWeight: 'var(--heading-weight)', fontFamily: 'var(--font-heading)' }} className="text-[var(--theme-title)] mb-3">Heading Scale 02</h2>
                    <p style={{ fontSize: 'var(--theme-font-size-base)', fontFamily: 'var(--font-main)' }} className="text-[var(--theme-main)] leading-relaxed">
                        Soberania visual não é apenas sobre cores, é sobre a harmonia entre geometria e tipografia. 
                        Este parágrafo demonstra a legibilidade da fonte principal sob a escala <span className="text-[var(--theme-primary)] font-bold">{tokens.fontScale || 'm'}</span>.
                    </p>
                </section>

                <section className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 style={{ fontSize: 'calc(var(--theme-font-size-base) * 1.2)', fontWeight: 'var(--heading-weight)', fontFamily: 'var(--font-subtitle, var(--font-heading))' }} className="text-[var(--theme-title)] mb-2">Subtitle Font</h3>
                        <p className="text-[var(--theme-muted)] text-[11px]">Utilizada em labels, sub-cabeçalhos e metadados auxiliares.</p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 'calc(var(--theme-font-size-base) * 1.2)', fontWeight: 'var(--heading-weight)', fontFamily: 'var(--font-tab, var(--font-heading))' }} className="text-[var(--theme-title)] mb-2">Tab Font</h3>
                        <p className="text-[var(--theme-muted)] text-[11px]">Otimizada para navegação e elementos de interface interativos.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};
