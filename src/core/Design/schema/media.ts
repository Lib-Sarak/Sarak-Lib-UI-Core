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
            description: 'URL de uma imagem exibida como fundo global da aplicação, atrás de todo o conteúdo — vazio significa nenhuma imagem de fundo (só a cor sólida de `colorBgBody`). Combine com `globalBackgroundOpacity`/`globalBackgroundBlur` para não comprometer a legibilidade do conteúdo.',
            axis: 'texture',
            defaultValue: '',
            legacyValue: '', // Garante que temas antigos apaguem a mídia de fundo
            cssVars: ['--sarak-global-bg-image']
        },
        {
            id: 'globalBackgroundBlur',
            label: 'Desfoque da Imagem Global',
            type: 'slider',
            description: 'Intensidade do desfoque aplicado à imagem de fundo global — só tem efeito quando `globalBackgroundImageUrl` está preenchido. Valores altos transformam a imagem numa mancha de cor ambiente em vez de um cenário reconhecível.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 0,
            cssVars: ['--sarak-global-bg-blur']
        },
        {
            id: 'globalBackgroundBlendMode',
            label: 'Blend Mode (Mistura)',
            type: 'select',
            description: 'Modo de mesclagem CSS entre a imagem de fundo global e as camadas de cor sobrepostas. Normal não mistura; Overlay/Multiply/Screen/Soft Light combinam a imagem com as cores do tema para efeitos mais integrados. Nota: atualmente sobrescrito para \'normal\' no código-fonte de `SarakBackgroundRenderer.tsx` — as demais opções não têm efeito visível até essa pendência de wiring (ver backlog de cobertura, spec 01) ser resolvida.',
            axis: 'texture',
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
            description: 'Opacidade da imagem de fundo global — valores baixos deixam a imagem como um traço sutil atrás do conteúdo; 1 = imagem totalmente visível (use com cautela para não prejudicar a legibilidade do texto).',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 1,
            cssVars: ['--sarak-global-bg-opacity']
        }
    ]
};
