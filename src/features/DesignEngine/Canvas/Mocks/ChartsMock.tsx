import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';

interface ChartsMockProps {
    tokens: any;
    config: any;
    animationVariants: any;
    animationStyle: string;
}

export const MockCharts: React.FC<ChartsMockProps> = ({ tokens, animationVariants, animationStyle }) => {
    // Cores e configurações reativas extraídas dos tokens
    const primaryColor = 'var(--sarak-chart-primary, #00f2ff)';
    const strokeThickness = 'var(--sarak-chart-thickness, 2px)';
    const gridOpacity = 'var(--sarak-chart-grid-opacity, 0.05)';
    const tooltipBg = 'var(--sarak-chart-tooltip-bg, rgba(15, 23, 42, 0.9))';

    return (
        <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col gap-6"
        >
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <SarakIcon name="BarChart3" className="text-[var(--theme-primary)]" size={20} />
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest text-left">Advanced Analytics & Charts</h2>
                    </div>
                    <p className="text-sm text-white/40 uppercase tracking-tighter text-left">Galeria de Múltiplos Espécimes de Gráficos Reativos ao Motor Sarak</p>
                </div>
            </div>

            {/* GRID DOS GRÁFICOS */}
            <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-6 auto-rows-auto">
                
                {/* 1. LINE CHART (SVG) */}
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <SarakIcon name="LineChart" size={14} className="text-[var(--theme-primary)]" /> Gráfico de Linha (Line)
                        </span>
                        <SarakIcon name="TrendingUp" size={12} className="text-emerald-400" />
                    </div>
                    
                    <div className="h-48 w-full relative flex items-end">
                        {/* Grid de Fundo */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-full h-[1px] bg-white" style={{ opacity: gridOpacity }} />
                            ))}
                        </div>
                        
                        {/* Gráfico SVG */}
                        <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 300 120" preserveAspectRatio="none">
                            <path 
                                d="M 0 90 Q 50 30 100 70 T 200 20 T 300 60" 
                                fill="none" 
                                stroke={primaryColor} 
                                strokeWidth={strokeThickness}
                                className="transition-all duration-500"
                            />
                            {/* Pontos de Interação */}
                            <circle cx="100" cy="70" r="4" fill="white" stroke={primaryColor} strokeWidth="2" className="cursor-pointer hover:scale-150 transition-transform" />
                            <circle cx="200" cy="20" r="4" fill="white" stroke={primaryColor} strokeWidth="2" className="cursor-pointer hover:scale-150 transition-transform" />
                        </svg>

                        {/* Tooltip Simulado */}
                        <div 
                            className="absolute top-4 right-4 px-2 py-1 rounded text-[8px] font-mono border border-white/10 z-20 text-white/90 animate-pulse"
                            style={{ backgroundColor: tooltipBg }}
                        >
                            Valor: 85.4%
                        </div>
                    </div>
                </div>

                {/* 2. AREA CHART (SVG) */}
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <SarakIcon name="LineChart" size={14} className="text-[var(--theme-primary)]" /> Gráfico de Área (Area)
                        </span>
                        <SarakIcon name="Info" size={12} className="text-slate-500" />
                    </div>
                    
                    <div className="h-48 w-full relative flex items-end">
                        {/* Grid de Fundo */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-full h-[1px] bg-white" style={{ opacity: gridOpacity }} />
                            ))}
                        </div>
                        
                        {/* Gráfico SVG */}
                        <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 300 120" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
                                    <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            <path 
                                d="M 0 100 Q 60 40 120 80 T 240 10 T 300 120 L 300 120 L 0 120 Z" 
                                fill="url(#areaGrad)"
                                className="transition-all duration-500"
                            />
                            <path 
                                d="M 0 100 Q 60 40 120 80 T 240 10 T 300 120" 
                                fill="none" 
                                stroke={primaryColor} 
                                strokeWidth={strokeThickness}
                                className="transition-all duration-500"
                            />
                        </svg>
                    </div>
                </div>

                {/* 3. BAR CHART (SVG/DIVS) */}
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <SarakIcon name="BarChart3" size={14} className="text-[var(--theme-primary)]" /> Gráfico de Barras (Bar)
                        </span>
                        <SarakIcon name="HelpCircle" size={12} className="text-slate-500" />
                    </div>
                    
                    <div className="h-48 w-full relative flex items-end gap-3 justify-between">
                        {/* Grid de Fundo */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-full h-[1px] bg-white" style={{ opacity: gridOpacity }} />
                            ))}
                        </div>
                        
                        {[40, 80, 55, 95, 70, 30, 85].map((val, idx) => (
                            <div key={idx} className="flex-1 flex flex-col justify-end h-full z-10 group relative">
                                <div 
                                    className="w-full rounded-t transition-all duration-500 group-hover:brightness-125"
                                    style={{ 
                                        height: `${val}%`, 
                                        backgroundColor: primaryColor,
                                        opacity: 0.8
                                    }}
                                />
                                <div 
                                    className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-white/10"
                                    style={{ backgroundColor: tooltipBg }}
                                >
                                    {val}k
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. PIE CHART */}
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <SarakIcon name="PieChart" size={14} className="text-[var(--theme-primary)]" /> Gráfico de Pizza (Donut)
                        </span>
                    </div>
                    
                    <div className="h-48 w-full relative flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90 overflow-visible" viewBox="0 0 36 36">
                            {/* Círculo base cinza */}
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                            {/* Segmento reativo */}
                            <circle 
                                cx="18" 
                                cy="18" 
                                r="15.915" 
                                fill="none" 
                                stroke={primaryColor} 
                                strokeWidth="4" 
                                strokeDasharray="65 35" 
                                strokeDashoffset="0"
                                className="transition-all duration-500"
                                strokeLinecap="round"
                            />
                            {/* Outro segmento decorativo */}
                            <circle 
                                cx="18" 
                                cy="18" 
                                r="15.915" 
                                fill="none" 
                                stroke="rgba(255,255,255,0.15)" 
                                strokeWidth="4" 
                                strokeDasharray="30 70" 
                                strokeDashoffset="-65"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-mono font-black text-white">65%</span>
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Node Core</span>
                        </div>
                    </div>
                </div>

                {/* 5. SCATTER PLOT */}
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <SarakIcon name="ScatterChart" size={14} className="text-[var(--theme-primary)]" /> Gráfico de Dispersão (Scatter)
                        </span>
                    </div>
                    
                    <div className="h-48 w-full relative flex items-end">
                        {/* Grid de Fundo */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-full h-[1px] bg-white" style={{ opacity: gridOpacity }} />
                            ))}
                        </div>
                        
                        {/* Pontos dispersos */}
                        <div className="absolute inset-0 z-10">
                            {[
                                { x: '20%', y: '30%', size: 'w-2 h-2' },
                                { x: '45%', y: '60%', size: 'w-3 h-3' },
                                { x: '70%', y: '25%', size: 'w-2 h-2' },
                                { x: '30%', y: '75%', size: 'w-4 h-4' },
                                { x: '80%', y: '80%', size: 'w-3 h-3' },
                                { x: '15%', y: '50%', size: 'w-3 h-3' },
                                { x: '60%', y: '45%', size: 'w-2 h-2' },
                            ].map((pt, idx) => (
                                <div 
                                    key={idx}
                                    className={`${pt.size} rounded-full absolute -translate-x-1/2 translate-y-1/2 hover:scale-150 transition-transform cursor-pointer border border-white/20`}
                                    style={{ 
                                        left: pt.x, 
                                        bottom: pt.y, 
                                        backgroundColor: primaryColor,
                                        opacity: 0.8
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 6. RADAR CHART */}
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <SarakIcon name="TrendingUp" size={14} className="text-[var(--theme-primary)]" /> Teia de Performance (Radar)
                        </span>
                    </div>
                    
                    <div className="h-48 w-full relative flex items-center justify-center">
                        <svg className="w-32 h-32 overflow-visible" viewBox="0 0 100 100">
                            {/* Grid poligonal (Pentágonos) */}
                            <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            <polygon points="50,25 80,48 68,80 32,80 20,48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            <polygon points="50,40 70,55 62,70 38,70 30,55" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            {/* Dados do Radar reativo */}
                            <polygon 
                                points="50,20 85,42 70,75 45,88 28,52" 
                                fill={primaryColor} 
                                fillOpacity="0.25" 
                                stroke={primaryColor} 
                                strokeWidth="2" 
                                className="transition-all duration-500"
                            />
                        </svg>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
