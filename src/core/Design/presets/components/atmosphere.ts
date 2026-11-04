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
        description: 'Faixas de cor em fluxo contínuo, geradas pela própria lib — sem vídeo externo.',
        texture: 'aurora',
        textureOpacity: 0.35
    },
    {
        id: 'bg-stellar-nebula',
        name: 'Nebulosa Estelar',
        description: 'Nebulosa e campo de estrelas gerados pela própria lib — sem foto de terceiro.',
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

/** O degradê do fundo: uma opção de `bgGradientMode` por preset (o linear leva também o ângulo). */
export const GRADIENT_PRESETS: ComponentPreset[] = [
    { id: 'bg-gradient-none', name: 'Fundo liso', description: 'Sem degradê: só a cor do fundo.', keywords: ['liso', 'solido', 'sem degrade', 'flat'], design: { bgGradientMode: 'none' } },
    { id: 'bg-gradient-linear', name: 'Degradê linear', description: 'Do fundo a uma camada tingida pela marca, em diagonal.', keywords: ['linear', 'degrade', 'gradient', 'diagonal'], design: { bgGradientMode: 'linear', bgGradientAngle: 135 } },
    { id: 'bg-gradient-radial', name: 'Foco de luz', description: 'Um foco suave acende o topo da tela.', keywords: ['radial', 'foco', 'luz', 'spotlight'], design: { bgGradientMode: 'radial' } },
    { id: 'bg-gradient-mesh', name: 'Manchas de cor', description: 'Quatro manchas de cor da paleta, misturadas como aquarela.', keywords: ['mesh', 'manchas', 'aquarela', 'organico'], design: { bgGradientMode: 'mesh' } },
];

/** Clima do fundo: vinheta, grão, filtros globais e o tom do sistema. Nenhum escreve cor. */
export const AMBIENT_PRESETS: ComponentPreset[] = [
    { id: 'bg-vignette-soft', name: 'Vinheta suave', description: 'Cantos levemente escurecidos, que puxam o olhar para o centro.', keywords: ['vinheta', 'vignette', 'cantos', 'foco'], design: { vignetteOpacity: 0.5, vignetteSoftness: 35 } },
    { id: 'bg-film-grain', name: 'Grão animado', description: 'Grão de filme fino e vivo sobre a tela toda.', keywords: ['grao', 'ruido', 'noise', 'filme'], design: { bgNoiseDensity: 0.18, bgNoiseAnimation: 3 } },
    { id: 'bg-vivid', name: 'Vívido', description: 'Cores mais saturadas e com mais contraste em todo o sistema.', keywords: ['vivido', 'saturado', 'contraste', 'vivid'], design: { globalSaturation: 1.3, globalContrast: 1.1 } },
    { id: 'bg-muted', name: 'Dessaturado', description: 'Cores abafadas e contraste suave: um clima sóbrio e calmo.', keywords: ['dessaturado', 'muted', 'sobrio', 'calmo'], design: { globalSaturation: 0.7, globalContrast: 0.95 } },
    { id: 'bg-tone-cyber', name: 'Tom cibernético', description: 'Camada de cor fria e tecnológica sobre o fundo.', keywords: ['cyber', 'tecnologico', 'frio', 'tom'], design: { systemTone: 'cyber', globalSaturation: 1.2 } },
    { id: 'bg-tone-tactical', name: 'Tom tático', description: 'Camada fosca e esverdeada, de ar militar e operacional.', keywords: ['tatico', 'tactical', 'militar', 'tom'], design: { systemTone: 'tactical', globalContrast: 1.05 } },
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
export const ATMOSPHERE_PRESETS: ComponentPreset[] = [...MEDIA_PRESETS, ...GRADIENT_PRESETS, ...AMBIENT_PRESETS, ...TEXTURE_PRESETS];
