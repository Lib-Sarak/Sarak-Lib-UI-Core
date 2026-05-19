import React from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from './GalleryItem';
import { CARD_PRESETS, CardPreset } from '../../../../core/Design/presets';
import { DesignScope } from '../../../../core/Design/components/DesignScope';
import { SarakTitleCard } from '../../../../components/atomic/Cards/SarakTitleCard';
import { SarakActionCard } from '../../../../components/atomic/Cards/SarakActionCard';
import { SarakSearchCard } from '../../../../components/atomic/Cards/SarakSearchCard';
import { 
    Layers,
    Activity,
    Shield,
    TrendingUp,
    Zap,
    Check
} from 'lucide-react';

interface CardsGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

/**
 * MiniDashboardFragment: Uma réplica miniaturizada de um componente real de dashboard.
 * Usada para provar a fidelidade visual da anatomia aplicada.
 */
const MiniDashboardFragment: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <div className="w-full h-full flex flex-col p-5 gap-4 relative z-10">
            {/* Header com Status */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Real-time Node</span>
                </div>
                <Activity size={10} className="text-white/20" />
            </div>

            {/* Title & Value */}
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Operational Load</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white tracking-tighter italic">84.2%</span>
                    <TrendingUp size={12} className="text-emerald-400 opacity-60" />
                </div>
            </div>

            {/* Mini Chart (Pure CSS) */}
            <div className="flex-1 flex items-end gap-1 px-1 py-2 bg-black/20 rounded-lg border border-white/5">
                {[30, 50, 45, 70, 60, 85, 40, 65, 90, 75].map((h, i) => (
                    <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-[var(--theme-primary)]/10 to-[var(--theme-primary)]/40 rounded-t-[2px] transition-all duration-700" 
                        style={{ height: `${h}%`, opacity: 0.3 + (i * 0.05) }} 
                    />
                ))}
            </div>

            {/* Footer Metrics */}
            <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                    <span className="text-white/30">Protocol</span>
                    <span className="text-[var(--theme-primary)]">SX-OVR-9</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '84.2%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-[var(--theme-primary)]/60" 
                    />
                </div>
            </div>

            {/* Floating Protection Tag */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Shield size={12} className="text-white/10" />
            </div>
        </div>
    );
};

/**
 * CardSpecimen: Espécime isolado de ALTA FIDELIDADE.
 * 
 * Usa apenas DesignScope para injeção de variáveis — sem duplicação inline.
 * Os tokens do preset são mergeados com o estado atual do sistema (globalTokens),
 * mantendo reatividade para tema e modo, enquanto a anatomia vem 100% do preset.
 */
const CardSpecimen: React.FC<{ preset: CardPreset, globalTokens: any, isActive: boolean }> = ({ preset, globalTokens, isActive }) => {
    const mergedTokens = React.useMemo(() => {
        // Base: estado real do sistema (não defaults estáticos)
        const final = { ...globalTokens, ...preset.design };
        
        // Mantemos reatividade para tema e modo — a anatomia é soberana do preset
        const reactiveTokens = ['themePrimary', 'mode'];
        reactiveTokens.forEach(token => {
            if (globalTokens[token] !== undefined) final[token] = globalTokens[token];
        });

        return final;
    }, [preset, globalTokens]);

    const activeVariant = mergedTokens.cardVariant || 'classic';

    // Mock data item for high-fidelity specimen representation
    const sampleItem = {
        title: 'Gemini 1.5 Pro',
        subtitle: 'Sarak AI Orchestrator',
        context: '1000000',
        input_caps: ['chat', 'vision', 'web'],
        description: 'Next-generation multimodal orchestration engine designed for complex reasoning tasks.',
        price_in: 0.007,
        price_out: 0.021,
        tokenizer: 'Gemini Tokenizer',
        icon: 'Cpu'
    };

    const sampleMapping = {
        title: 'title',
        subtitle: 'subtitle',
        context: 'context',
        input_caps: 'input_caps',
        description: 'description',
        price_in: 'price_in',
        price_out: 'price_out',
        tokenizer: 'tokenizer',
        icon: 'icon'
    };

    return (
        <DesignScope design={mergedTokens}>
            <div className="w-full h-full p-6 relative overflow-hidden group bg-[#050505] border border-white/5 flex flex-col justify-center">
                
                {/* Transparency Checkerboard */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ 
                    backgroundImage: `
                        linear-gradient(45deg, #fff 25%, transparent 25%), 
                        linear-gradient(-45deg, #fff 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #fff 75%), 
                        linear-gradient(-45deg, transparent 75%, #fff 75%)
                    `,
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
                }} />

                {/* Specimen Render */}
                <div className="relative z-10 w-full group-hover:scale-[1.01] transition-transform duration-700">
                    {activeVariant === 'title' ? (
                        <SarakTitleCard item={sampleItem} mapping={sampleMapping} />
                    ) : activeVariant === 'action' ? (
                        <SarakActionCard item={sampleItem} mapping={sampleMapping} />
                    ) : activeVariant === 'search' ? (
                        <SarakSearchCard item={sampleItem} mapping={sampleMapping} />
                    ) : (
                        <div 
                            className="sarak-card w-full h-[260px] relative z-10 transition-all duration-700 isolate flex flex-col"
                            data-sx-card-texture-type={mergedTokens.cardTextureType}
                        >
                            <div className="relative z-10 flex-1 overflow-hidden">
                                <MiniDashboardFragment isActive={isActive} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Labeling Overlay */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">{preset.id}</span>
                </div>
            </div>
        </DesignScope>
    );
};

export const CardsGallery: React.FC<CardsGalleryProps> = ({ tokens, onUpdateDraft }) => {
    
    const handleSelect = (preset: CardPreset) => {
        // Injeção Atômica: aplica TODOS os tokens definidos no preset
        // sem filtro restritivo — o preset já é alinhado 1:1 com o CardSchema
        Object.entries(preset.design).forEach(([key, val]) => {
            onUpdateDraft(key, val);
        });
        // Persiste o identificador do preset ativo
        onUpdateDraft('cardPresetId', preset.id);
    };

    return (
        <div className="flex flex-col h-full bg-[#050505]">
            {/* Gallery Header */}
            <div className="flex items-center justify-between px-10 py-10 border-b border-white/5 bg-black/20 backdrop-blur-2xl sticky top-0 z-20">
                <div className="flex flex-col">
                    <h2 className="text-sm font-black uppercase tracking-[0.5em] text-white italic">Card Surface Repository</h2>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Anatomical DNA & Geometric Structures</p>
                </div>
                
                <div className="flex items-center gap-4 px-5 py-2 bg-white/5 rounded-2xl border border-white/10">
                    <Zap size={14} className="text-[var(--theme-primary)]" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{CARD_PRESETS.length} Anatomies</span>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {CARD_PRESETS.map((preset: CardPreset) => {
                        const isActive = tokens.cardPresetId === preset.id;

                        return (
                            <div key={preset.id} className="space-y-4">
                                <motion.div 
                                    whileHover={{ y: -8 }}
                                    onClick={() => handleSelect(preset)}
                                    className={`relative h-[380px] rounded-[2.5rem] overflow-hidden cursor-pointer border transition-all duration-700 ${
                                        isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/20' : 'border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <CardSpecimen 
                                        preset={preset} 
                                        globalTokens={tokens}
                                        isActive={isActive}
                                    />
                                    
                                    {/* Active Badge */}
                                    {isActive && (
                                        <div className="absolute top-6 right-6 z-30">
                                            <div className="w-8 h-8 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 border border-white/20 scale-110">
                                                <Check className="text-white" size={14} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay de Interação */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-sm group z-20">
                                        <div className="p-5 bg-white/10 rounded-2xl border border-white/20 mb-4 scale-75 group-hover:scale-100 transition-transform duration-500">
                                            <Layers size={24} className="text-white" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Apply Blueprint</span>
                                    </div>
                                </motion.div>

                                <div className="px-4">
                                    <h3 className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-[var(--theme-primary)]' : 'text-white/80'}`}>{preset.name}</h3>
                                    <p className="text-[9px] text-white/30 uppercase leading-relaxed mt-1 tracking-wider line-clamp-1">{preset.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
