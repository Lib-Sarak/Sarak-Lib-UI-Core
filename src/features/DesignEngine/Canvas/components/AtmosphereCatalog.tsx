import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MEDIA_PRESETS, TEXTURE_PRESETS } from '../../../../core/Design/presets/components/atmosphere';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { Layers, Play, Image as ImageIcon, Video, Grid } from 'lucide-react';
import { SarakBackgroundRenderer } from '../../../../core/Design/components/SarakBackgroundRenderer';

import { SarakDesignState } from '../../../../core/Provider/types';

interface AtmosphereCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
    /** Sugestões geradas pelo Design Agent nesta sessão (nunca persistidas). */
    sessionPresets?: ComponentPreset[];
}

export const AtmosphereCatalog: React.FC<AtmosphereCatalogProps> = ({ onApplyPreset, currentMode, sessionPresets = [] }) => {
    const [activeTab, setActiveTab] = useState<'media' | 'textures'>('media');

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-theme-border">
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`px-4 py-2 rounded-lg text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'media' ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <Video size={12} />
                        Mídia Base
                    </button>
                    <button
                        onClick={() => setActiveTab('textures')}
                        className={`px-4 py-2 rounded-lg text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'textures' ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <Grid size={12} />
                        Texturas
                    </button>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-black/20 rounded-xl border border-theme-border">
                    <span className="text-[var(--sarak-type-scale2xs,10px)] font-black text-theme-text uppercase tracking-widest">Opacidade</span>
                    <input
                        key={activeTab}
                        type="range"
                        min="0" max="1" step="0.01"
                        defaultValue={activeTab === 'textures' ? 0.08 : 1}
                        onChange={(e) => onApplyPreset(
                            activeTab === 'textures'
                                ? { textureOpacity: parseFloat(e.target.value) }
                                : { globalBackgroundOpacity: parseFloat(e.target.value) }
                            , true)}
                        className="w-32 accent-[var(--theme-primary)] cursor-pointer"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(activeTab === 'media' ? [...sessionPresets, ...MEDIA_PRESETS] : TEXTURE_PRESETS).map((preset, i) => (
                    <AtmospherePresetPreview key={preset.id} preset={preset} index={i} currentMode={currentMode} onApply={() => onApplyPreset(preset.design, true)} />
                ))}
            </div>
        </div>
    );
};

const AtmospherePresetPreview = ({ preset, index, onApply, currentMode }: { preset: ComponentPreset, index: number, onApply: () => void, currentMode: string }) => {
    const isVideo = preset.design.globalBackgroundImageUrl && (
        preset.design.globalBackgroundImageUrl.includes('video') ||
        preset.design.globalBackgroundImageUrl.endsWith('.webm') ||
        preset.design.globalBackgroundImageUrl.endsWith('.mp4')
    );

    const isImage = preset.design.globalBackgroundImageUrl && !isVideo;

    return (
        <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onApply}
            className="group relative flex flex-col text-left rounded-2xl border border-theme-border overflow-hidden bg-theme-card hover:border-theme-primary hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.2)] transition-all duration-300"
        >
            <div
                className="h-64 w-full relative overflow-hidden flex items-center justify-center sarak-card"
                data-sx-card-texture-type={preset.design.texture && preset.design.texture !== 'none' ? preset.design.texture : undefined}
                style={{ '--sarak-card-texture-opacity': '0.8' } as React.CSSProperties}
            >
                <div className="absolute inset-0 z-0">
                    {preset.design.globalBackgroundImageUrl && (
                        <SarakBackgroundRenderer
                            imageUrl={preset.design.globalBackgroundImageUrl}
                            opacity={preset.design.globalBackgroundOpacity}
                            blur={preset.design.globalBackgroundBlur}
                            blendMode={preset.design.globalBackgroundBlendMode as React.CSSProperties['mixBlendMode']}
                            isFixed={false}
                            mode={(preset.design.mode || currentMode) as 'light' | 'dark'}
                            disableOverlay={true}
                            zIndex={0}
                        />
                    )}
                </div>

                {/* Removido o gradiente preto global para evitar escurecimento não intencional da mídia brilhante */}

                <div className="relative z-20 flex flex-col items-center gap-4 group-hover:scale-110 transition-transform duration-700">
                    <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white shadow-2xl">
                        {isVideo ? <Play size={32} /> : isImage ? <ImageIcon size={32} /> : <Layers size={32} />}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                    <div className="flex items-center gap-3 mb-2">
                        {isVideo && <span className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[var(--sarak-type-scale2xs,10px)] font-bold uppercase tracking-wider backdrop-blur-md">Live Media</span>}
                        {isImage && <span className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/50 text-purple-400 text-[var(--sarak-type-scale2xs,10px)] font-bold uppercase tracking-wider backdrop-blur-md">Static Image</span>}
                        {!isVideo && !isImage && <span className="px-2 py-1 rounded bg-neutral-500/20 border border-neutral-500/50 text-neutral-400 text-[var(--sarak-type-scale2xs,10px)] font-bold uppercase tracking-wider backdrop-blur-md">Solid Void</span>}
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider drop-shadow-lg">{preset.name}</h3>
                    <p className="text-sm text-white/70 mt-1 max-w-lg drop-shadow-md">{preset.description}</p>
                </div>
            </div>
        </motion.button>
    );
};
