import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Cpu, Shield, Globe, Terminal, ArrowUpRight, TrendingUp, AlertTriangle, Server, Database, Network, HardDrive, BarChart, Clock, Settings, Download } from 'lucide-react';
import SarakChartEngine from '../../../../components/engines/charts/SarakChartEngine';

export const MockDashboard: React.FC<any> = ({ animationVariants, animationStyle, tokens }) => {
    const tone = tokens?.systemTone || 'formal';
    const layout = tokens?.dashboardTemplate || 'executive';

    const t = (texts: { formal: string; friendly: string; cyber: string }) => {
        return texts[tone as keyof typeof texts] || texts.formal;
    };

    // Estilo de Card Reativo (Deixa o CSS gerenciar Materiais e Texturas)
    const cardStyle = {
        padding: `${tokens.cardPadding || 24}px`,
    };

    const getAnim = (index: number) => ({
        initial: animationVariants[animationStyle]?.page?.initial || animationVariants.none?.page?.initial,
        animate: animationVariants[animationStyle]?.page?.animate || animationVariants.none?.page?.animate,
        transition: { 
            ...(animationVariants[animationStyle]?.page?.transition || animationVariants.none?.page?.transition), 
            delay: index * 0.05, 
            duration: parseFloat(tokens.animationSpeed || '0.4') 
        }
    });

    const MiniSpark = ({ color = 'text-[var(--theme-primary)]', opacity = 0.2 }) => (
        <div className={`h-10 w-full mt-auto`} style={{ opacity }}>
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                <polyline 
                    points="0,15 10,25 20,5 30,20 40,10 50,28 60,12 70,25 80,8 90,20 100,10" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className={color}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );

    const renderExecutiveLayout = () => (
        <div className="grid grid-cols-12 auto-rows-fr gap-8">
             {/* Card de Receita */}
             <motion.div {...getAnim(0)} className="col-span-12 lg:col-span-4 bg-theme-card sarak-card flex flex-col justify-between shadow-2xl relative overflow-hidden" style={cardStyle}>
                <div className="absolute -top-4 -right-4 p-8 opacity-5">
                    <TrendingUp size={160} />
                </div>
                <div className="relative z-10">
                    <h4 className="text-5xl font-black text-[var(--theme-title)] mb-2 tracking-tighter">$2.4M</h4>
                    <div className="text-[11px] font-black text-[var(--theme-muted)] uppercase tracking-[0.3em] mb-6">Projected Revenue</div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                            <TrendingUp className="text-emerald-500 w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-emerald-500">+24.5% <span className="opacity-40 text-[10px] uppercase ml-1">vs Quarter 3</span></span>
                    </div>
                </div>
                <button className="w-full py-4 bg-[var(--theme-primary)] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl shadow-[var(--theme-primary)]/20 relative z-10">
                    <Download size={16} />
                    Download Report
                </button>
             </motion.div>

             {/* Card de Gráfico Principal */}
             <motion.div {...getAnim(1)} className="col-span-12 lg:col-span-8 bg-theme-card sarak-card" style={cardStyle}>
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <div className="text-[12px] font-black uppercase tracking-[0.25em] text-[var(--theme-muted)]">Market Share Growth</div>
                        <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-2">Sarak Intelligence Engine v8.5.2</div>
                    </div>
                    <div className="px-4 py-1.5 bg-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/10 rounded-full text-[9px] text-[var(--theme-primary)] font-black uppercase tracking-[0.2em]">
                        2024 GLOBAL DATA
                    </div>
                </div>
                <div className="h-[280px]">
                    <SarakChartEngine
                        type="bar"
                        data={[
                            { n: 'Jan', v: 400 }, { n: 'Feb', v: 800 }, { n: 'Mar', v: 600 },
                            { n: 'Apr', v: 950 }, { n: 'May', v: 700 }, { n: 'Jun', v: 1200 }
                        ]}
                        config={{ engine: 'echarts', dataKey: 'v', xAxisKey: 'n' }}
                    />
                </div>
             </motion.div>

             {/* Cards de KPI Inferiores */}
             <div className="col-span-12 grid grid-cols-3 gap-8">
                {[
                    { label: 'Conversion Rate', val: '3.2%', icon: Zap, color: 'text-amber-500' },
                    { label: 'Active Users', val: '44.5k', icon: Globe, color: 'text-blue-500' },
                    { label: 'Bounce Rate', val: '12.4%', icon: Shield, color: 'text-emerald-500' }
                ].map((stat, i) => (
                    <motion.div key={i} {...getAnim(i+2)} className="bg-theme-card sarak-card flex flex-col gap-6 relative overflow-hidden" style={cardStyle}>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} shadow-inner`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-[var(--theme-muted)] uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                                <div className="text-2xl font-black text-[var(--theme-title)] tracking-tight">{stat.val}</div>
                            </div>
                        </div>
                        <MiniSpark color={stat.color} />
                    </motion.div>
                ))}
             </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-black/10 overflow-y-auto" style={{ padding: `${(tokens.cardPadding || 24) * 1.5}px` }}>
            <header className="mb-16 flex justify-between items-start">
                <div>
                    <h3 className="text-4xl font-black text-[var(--theme-title)] tracking-tighter mb-2">
                        {layout === 'monitoring' ? 'Infrastructure Overseer' : 'Executive Business Core'}
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        <p className="text-[12px] font-black text-[var(--theme-muted)] uppercase tracking-[0.4em] opacity-40">
                            {t({ formal: 'Operational Parity: Optimal', friendly: 'Everything looks great!', cyber: 'SYS_OVERVIEW_CHANNEL_SYNCED' })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/30 uppercase tracking-widest shadow-inner">v8.5.2_Quant</div>
                    <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-500 uppercase tracking-widest shadow-lg shadow-emerald-500/5">Production</div>
                </div>
            </header>

            <div className="flex-grow">
                {renderExecutiveLayout()}
            </div>
            
            {/* Footer Decor */}
            <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center opacity-20">
                <span className="text-[9px] font-black uppercase tracking-[0.5em]">Sarak Dash Engine // Operational Intelligence</span>
                <div className="flex gap-8">
                    <span className="text-[9px] font-black uppercase tracking-widest">Lat: 0.24ms</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Nodes: 124</span>
                </div>
            </div>
        </div>
    );
};
