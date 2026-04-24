import React from 'react';
import { CardsGallery } from './CardsGallery';
import { TypographyGallery } from './TypographyGallery';
import { AnimationsGallery } from './AnimationsGallery';
import { BrandingGallery } from './BrandingGallery';
import { VisualsGallery } from './VisualsGallery';
import { ComponentsGallery } from './ComponentsGallery';
import { DashboardGallery } from './DashboardGallery';
import { ChatGallery } from './ChatGallery';
import { VisualizationGallery } from './VisualizationGallery';
import { LayoutGallery } from './LayoutGallery';
import { PresetsGallery } from './PresetsGallery';

interface GalleryRouterProps {
    activeCategory: string;
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
    activePreviewApp?: string;
}

export const GalleryRouter: React.FC<GalleryRouterProps> = ({ activeCategory, tokens, onUpdateDraft, activePreviewApp }) => {
    switch (activeCategory) {
        case 'presets':
            return <PresetsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} activePreviewApp={activePreviewApp} />;
        case 'cards':
            return <CardsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        case 'fonts':
            return <TypographyGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        case 'animations':
            return <AnimationsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        case 'branding':
            return <BrandingGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        case 'visuals':
            return <VisualsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        case 'components':
            return <ComponentsGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        case 'dashboard':
            return <DashboardGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        case 'chats':
            return <ChatGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        case 'visuals-3d':
            return <VisualizationGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        case 'layout':
            return <LayoutGallery tokens={tokens} onUpdateDraft={onUpdateDraft} />;
        default:
            return (
                <div className="flex items-center justify-center h-full text-white/20 uppercase tracking-[0.3em] font-black text-xs">
                    Selecione uma categoria para explorar variações
                </div>
            );
    }
};
