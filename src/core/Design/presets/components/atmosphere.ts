import { ComponentPreset } from './cards';
import { TEXTURE_OPTIONS } from '../../schema/atmosphere';

// Atmosferas de tela cheia geradas pelo motor de textura da própria lib (`_atmosphere.css`) — sem
// dependência de servidor de terceiro. `globalBackgroundImageUrl` vai vazio em cada uma para limpar
// uma URL de mídia herdada de uma aplicação anterior do mesmo preset.
const MEDIA_ATMOSPHERE_OPTIONS: Array<{
    id: string;
    name: string;
    description: string;
    texture: string;
    textureOpacity: number;
    vignetteOpacity?: number;
}> = [
    {
        id: 'bg-kinetic-flow',
        name: 'Aurora Cinética',
        description: 'Faixas de cor em fluxo contínuo, geradas 100% em CSS — sem vídeo externo.',
        texture: 'aurora',
        textureOpacity: 0.35
    },
    {
        id: 'bg-stellar-nebula',
        name: 'Nebulosa Estelar',
        description: 'Nebulosa e campo de estrelas renderizados em CSS puro — sem foto de terceiro.',
        texture: 'nebula',
        textureOpacity: 0.4
    },
    {
        id: 'bg-cyber-grid-img',
        name: 'Grade Cibernética',
        description: 'Grade técnica com brilho, do mesmo motor de textura das superfícies — sem imagem externa.',
        texture: 'blueprint-pro',
        textureOpacity: 0.3
    },
    {
        id: 'bg-dark-cinematic',
        name: 'Cinemático Escuro',
        description: 'Grão de filme e vinheta acentuada, para telas de teste de contraste — sem mídia de terceiro.',
        texture: 'grain',
        textureOpacity: 0.18,
        vignetteOpacity: 0.55
    }
];

export const MEDIA_PRESETS: ComponentPreset[] = [
    {
        id: 'bg-none',
        name: 'Nenhuma (Sem Mídia)',
        description: 'Remove vídeos e imagens de fundo.',
        design: {
            globalBackgroundImageUrl: ''
        }
    },
    ...MEDIA_ATMOSPHERE_OPTIONS.map(({ id, name, description, texture, textureOpacity, vignetteOpacity }) => ({
        id,
        name,
        description,
        design: {
            globalBackgroundImageUrl: '',
            texture,
            textureOpacity,
            ...(vignetteOpacity !== undefined ? { vignetteOpacity } : {})
        }
    }))
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
