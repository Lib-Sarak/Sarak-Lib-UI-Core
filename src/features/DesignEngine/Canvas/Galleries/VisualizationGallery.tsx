import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Box, Network, Map as MapIcon, Database, Cpu, Activity, Layout } from 'lucide-react';
import SarakVisualEngine from '../../../../components/engines/visuals/SarakVisualEngine';

interface VisualizationGalleryProps {
    tokens: any;
}

export const VisualizationGallery: React.FC<VisualizationGalleryProps> = ({ tokens }) => {
    const visualTypes = [
        { id: 'factory-floor', name: 'Plantas Técnicas (Floor Plans)', icon: Layout, description: 'Visualização isométrica de áreas e posicionamento de componentes' },
        { id: 'motor-twin', name: 'Visualização de Componentes', icon: Activity, description: 'Renderização 3D de peças técnicas com mapeamento de sensores' },
        { id: 'globe', name: 'Sincronização Geográfica', icon: Globe, description: 'Monitoramento transcontinental de nós e latência global' },
        { id: 'map-density', name: 'Análise de Densidade Regional', icon: MapIcon, description: 'Mapas de calor e distribuição de carga em grids espaciais' },
        { id: 'topology', name: 'Topologia de Redes (3D)', icon: Network, description: 'Visualização tridimensional de barramentos e conexões lógicas' },
        { id: 'point-cloud', name: 'Nuvem de Pontos (Precision)', icon: Database, description: 'Representação de alta densidade para análise volumétrica bruta' },
        { id: 'hologram', name: 'Projeção Holográfica', icon: Cpu, description: 'Interface técnica para inspeção de hardware e wireframes' },
        { id: 'mesh', name: 'Renderização de Malhas', icon: Box, description: 'Estudo de superfícies complexas e geometria técnica' }
    ];

    return (
        <div className="p-8 space-y-12">
            <header>
                <h2 className="text-xl font-black uppercase text-white tracking-widest mb-2">Visualização de Projetos & Ativos</h2>
                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">Showcase de Capacidades de Renderização Técnica</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {visualTypes.map((visual, i) => (
                    <motion.div 
                        key={visual.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-black/40 border-2 border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:border-[var(--theme-primary)]/30 transition-all group overflow-hidden relative"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <visual.icon size={120} />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary)]/10 flex items-center justify-center text-[var(--theme-primary)]">
                                    <visual.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase text-white tracking-tighter">{visual.name}</h3>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed max-w-[200px]">{visual.description}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active_Render</span>
                                <span className="text-[10px] font-black text-white/20 uppercase">Sarak_Engine_v8</span>
                            </div>
                        </div>

                        <div className="h-64 bg-black/60 rounded-3xl border border-white/5 overflow-hidden relative shadow-inner">
                            <SarakVisualEngine 
                                type={visual.id as any} 
                                tokens={tokens} 
                            />
                            
                            {/* Scanning Overlay Effect */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="w-full h-1 bg-[var(--theme-primary)]/10 blur-sm absolute top-0 animate-[scan_3s_linear_infinite]" />
                                <div className="w-full h-full border border-[var(--theme-primary)]/5 rounded-3xl" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Pipeline</span>
                                    <span className="text-[10px] font-black text-white uppercase">Reactive_Sync</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Fidelity</span>
                                    <span className="text-[10px] font-black text-white uppercase">Industrial_HD</span>
                                </div>
                            </div>
                            <button className="px-6 py-2 bg-white/5 hover:bg-[var(--theme-primary)] hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">
                                Expand Viewport
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
