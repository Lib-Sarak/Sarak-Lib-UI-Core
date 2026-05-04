import { motion } from 'framer-motion';
import { ATMOSPHERE_PRESETS, AtmospherePreset } from '../../../../core/Design/presets';
import { Check, Grid } from 'lucide-react';

interface VisualsGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const VisualsGallery: React.FC<VisualsGalleryProps> = ({ onUpdateDraft, tokens }) => {
    // Usar os presets atômicos em vez da constante bruta
    const textures = ATMOSPHERE_PRESETS.filter(p => p.id !== 'none');

    return (
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {textures.map((preset: AtmospherePreset) => (
                <VisualsSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.design).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.texture === preset.id}
                    globalTokens={tokens}
                />
            ))}
        </div>
    );
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
};

const VisualsSpecimen: React.FC<{ preset: AtmospherePreset; onSelect: () => void; isActive: boolean; globalTokens: any }> = ({ 
    preset, onSelect, isActive, globalTokens
}) => {
    const textureId = preset.design.texture;
    const primaryColor = globalTokens.primaryColor || '#3b82f6';
    const primaryRgb = hexToRgb(primaryColor);
    
    const localStyle = {
        '--theme-primary': primaryColor,
        '--theme-primary-rgb': primaryRgb,
        '--theme-border': 'rgba(255,255,255,0.4)' // Boosted border visibility for Grid
    } as React.CSSProperties;

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={onSelect}
            style={localStyle}
            className={`group relative bg-white/[0.02] border rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-5 space-y-4">
                {/* Texture Display Area */}
                <div 
                    className="h-32 rounded-xl border border-white/10 relative overflow-hidden bg-slate-900"
                    style={{ backgroundColor: globalTokens.mode === 'light' ? '#f1f5f9' : '#020617' }}
                >
                    <div 
                        className={`SarakAtmosphereLayer texture-${textureId}`} 
                        style={{ 
                            opacity: 0.8, /* Forçado para alta visibilidade na preview apenas */
                            position: 'absolute',
                            inset: 0,
                            zIndex: 1
                        }} 
                    />
                    
                    {/* Contrast Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                         <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                             {preset.name}
                         </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-tight text-white">{preset.name}</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Aplicar Padrão</span>
                    </div>
                    <div className="flex gap-2">
                         <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)]/10 flex items-center justify-center">
                            <Grid size={14} className="text-[var(--theme-primary)]" />
                         </div>
                    </div>
                </div>
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div className="absolute top-4 right-4 z-30">
                    <div className="w-6 h-6 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="text-white" size={12} />
                    </div>
                </div>
            )}
        </motion.div>
    );
};
