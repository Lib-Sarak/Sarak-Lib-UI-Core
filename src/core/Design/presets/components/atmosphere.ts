import { ComponentPreset } from './cards';
import { TEXTURE_OPTIONS } from '../../schema/atmosphere';

export const MEDIA_PRESETS: ComponentPreset[] = [
    {
        id: 'bg-none',
        name: 'Nenhuma (Sem Mídia)',
        description: 'Remove vídeos e imagens de fundo.',
        design: {
            globalBackgroundImageUrl: ''
        }
    },
    {
        id: 'bg-kinetic-flow',
        name: 'Video Background',
        description: 'Fluid 3D animation loop.',
        design: {
            globalBackgroundImageUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4'
        }
    },
    {
        id: 'bg-stellar-nebula',
        name: 'Image Space',
        description: 'Deep space photo with organic mesh texture.',
        design: {
            globalBackgroundImageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop'
        }
    },
    {
        id: 'bg-cyber-grid-img',
        name: 'Image Cyber Grid',
        description: 'Neon grid over a dark void.',
        design: {
            globalBackgroundImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1920&auto=format&fit=crop'
        }
    },
    {
        id: 'bg-dark-cinematic',
        name: 'Dark Cinematic',
        description: 'Mídia noturna/escura para testes de contraste.',
        design: {
            globalBackgroundImageUrl: 'https://images.unsplash.com/photo-1503756234508-e32369269deb?q=80&w=1920&auto=format&fit=crop'
        }
    }
];

// Presets gerados dinamicamente a partir das texturas do Schema (1:1 Paridade)
export const TEXTURE_PRESETS: ComponentPreset[] = TEXTURE_OPTIONS.map(texture => ({
    id: `tex-${texture.value}`,
    name: texture.label,
    description: `Preset utilizando a textura ${texture.label}.`,
    design: {
        texture: texture.value
    }
}));

// Export legado para não quebrar outras importações
export const ATMOSPHERE_PRESETS: ComponentPreset[] = [...MEDIA_PRESETS, ...TEXTURE_PRESETS];
