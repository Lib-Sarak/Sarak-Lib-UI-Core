import React from 'react';
import { motion } from 'framer-motion';
import { CHART_TYPES_PRESETS, ChartPreset } from '../../../../core/Design/presets';
import SarakChartEngine from '../../../../components/engines/charts/SarakChartEngine';

interface DashboardGalleryProps {
    tokens: any;
}

export const DashboardGallery: React.FC<DashboardGalleryProps> = ({ tokens }) => {
    // Dados mockados genéricos para os gráficos
    const mockData = [
        { name: 'A', v: 400 }, { name: 'B', v: 700 }, { name: 'C', v: 500 },
        { name: 'D', v: 900 }, { name: 'E', v: 600 }, { name: 'F', v: 800 }
    ];

    return (
        <div className="p-8 space-y-12">
            <header>
                <h2 className="text-xl font-black uppercase text-white tracking-widest mb-2">Sarak Visualization Library</h2>
                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">Showcase técnico de todos os motores de renderização suportados</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {CHART_TYPES_PRESETS.map((chart: ChartPreset, i) => (
                    <motion.div 
                        key={chart.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-black/40 border border-white/5 rounded-[2.5rem] p-6 space-y-6 hover:border-[var(--theme-primary)]/30 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/10 flex items-center justify-center text-[var(--theme-primary)]">
                                    <chart.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase text-white">{chart.name}</h3>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{chart.description}</p>
                                </div>
                            </div>
                            <div className="px-2 py-1 bg-white/5 rounded-lg text-[8px] font-black text-white/30 uppercase">v8.5_Engine</div>
                        </div>

                        <div className="h-64 bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden flex items-center justify-center relative shadow-inner">
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(var(--theme-primary) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                            </div>
                            <SarakChartEngine 
                                type={chart.id} 
                                data={mockData} 
                                config={{ engine: 'echarts', dataKey: 'v', xAxisKey: 'name' }} 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">Herança Visual</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-full bg-[var(--theme-primary)]" />
                                    <div className="w-3 h-3 rounded-full bg-[var(--theme-secondary, #333)]" />
                                    <div className="w-3 h-3 rounded-full bg-white/10" />
                                </div>
                            </div>
                            <div className="text-right flex flex-col justify-end">
                                <span className="text-[9px] font-black text-emerald-500 uppercase">Estilo Sincronizado</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
