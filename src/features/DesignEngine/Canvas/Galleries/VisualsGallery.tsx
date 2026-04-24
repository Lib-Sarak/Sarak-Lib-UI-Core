import React from 'react';
import { GalleryItem } from './GalleryItem';
import { VISUAL_PRESETS } from './presets';

interface VisualsGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

export const VisualsGallery: React.FC<VisualsGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const colorVariations = VISUAL_PRESETS.colors;
    const textureVariations = VISUAL_PRESETS.textures;

    return (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-black/40 p-6 gap-8">
            <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 ml-2">Paletas de Destaque</h3>
                <div className="grid grid-cols-5 gap-3">
                    {colorVariations.map((c) => (
                        <button 
                            key={c.hex} 
                            onClick={() => onUpdateDraft('primaryColor', c.hex)}
                            className={`aspect-square rounded-2xl border-2 transition-all ${tokens.primaryColor === c.hex ? 'border-white scale-110 shadow-xl' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                        />
                    ))}
                </div>
            </section>

            <section className="flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 ml-2">Texturas Atmosféricas</h3>
                <div className="grid grid-cols-2 gap-4">
                    {textureVariations.map((t) => (
                        <GalleryItem 
                            key={t.id}
                            title={t.name}
                            description={t.description}
                            isActive={tokens.texture === t.id}
                            onClick={() => onUpdateDraft('texture', t.id)}
                        >
                            <div className={`w-full h-full bg-white/[0.03] texture-${t.id}`} />
                        </GalleryItem>
                    ))}
                </div>
            </section>
        </div>
    );
};
