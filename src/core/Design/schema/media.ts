import { ComponentSchema } from '../types';

/**
 * SCHEMA: MEDIA & BACKGROUND
 * Governa imagens de fundo, filtros globais e configurações de imagem.
 */
export const MediaSchema: ComponentSchema = {
    id: 'media',
    label: 'Mídia e Background',
    tokens: [
        {
            id: 'globalBackgroundImageUrl',
            label: 'URL da Imagem de Fundo',
            type: 'image',
            defaultValue: '',
            legacyValue: '', // Garante que temas antigos apaguem a mídia de fundo
            cssVars: ['--sarak-global-bg-image']
        },
        {
            id: 'globalBackgroundBlur',
            label: 'Desfoque da Imagem Global',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 0,
            cssVars: ['--sarak-global-bg-blur']
        },
        {
            id: 'globalBackgroundBlendMode',
            label: 'Blend Mode (Mistura)',
            type: 'select',
            constraints: {
                options: [
                    { id: 'normal', value: 'normal', label: 'Normal' },
                    { id: 'overlay', value: 'overlay', label: 'Overlay' },
                    { id: 'multiply', value: 'multiply', label: 'Multiply' },
                    { id: 'screen', value: 'screen', label: 'Screen' },
                    { id: 'soft-light', value: 'soft-light', label: 'Soft Light' }
                ]
            },
            defaultValue: 'normal',
            cssVars: ['--sarak-global-bg-blend-mode']
        },
        {
            id: 'globalBackgroundOpacity',
            label: 'Opacidade da Imagem Global',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 1,
            cssVars: ['--sarak-global-bg-opacity']
        }
    ]
};
