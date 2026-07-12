import { ComponentSchema } from '../types';

/**
 * SCHEMA: MARCA & BRANDING
 * Identidade visual da marca do usuário e customização de logos.
 */
export const BrandingSchema: ComponentSchema = {
    id: 'branding',
    label: 'Identidade Visual',
    tokens: [
        // --- TIPOGRAFIA DA MARCA ---
        {
            id: 'identityAlignment',
            label: 'Alinhamento',
            type: 'select',
            description: 'Alinhamento horizontal do bloco de identidade (logo/nome da marca) dentro do seu container na navegação — Esquerda é o padrão em sidebars/topbars ocidentais, Centro é comum em navegações minimalistas.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'left', label: 'Esquerda' },
                    { id: 'center', label: 'Centro' },
                    { id: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'left',
            cssVars: ['--sarak-identity-align']
        },
        {
            id: 'identityPadding',
            label: 'Padding do Container',
            type: 'slider',
            description: 'Espaçamento interno, em pixels, ao redor do bloco de identidade (logo/nome) — controla o "respiro" entre a marca e as bordas do seu container na navegação.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 64 },
            defaultValue: 16,
            cssVars: ['--sarak-identity-padding']
        },

        // --- TIPOGRAFIA DA MARCA ---
        {
            id: 'identityFontFamily',
            label: 'Fonte do Logo',
            type: 'font',
            description: 'Família tipográfica usada no nome da marca (quando renderizado como texto, não imagem). Escolha uma fonte que reflita o caráter da marca — pode divergir da fonte do corpo do sistema para dar identidade própria.',
            axis: 'texture',
            defaultValue: 'Inter',
            cssVars: ['--sarak-identity-font']
        },
        {
            id: 'identityFontWeight',
            label: 'Peso da Fonte',
            type: 'slider',
            description: 'Peso (espessura) da fonte do nome da marca. Pesos altos (700-900) dão presença/impacto de logotipo; pesos baixos (100-400) produzem um clima mais discreto/editorial.',
            axis: 'density',
            constraints: { min: 100, max: 900, step: 100 },
            defaultValue: 700,
            cssVars: ['--sarak-identity-weight']
        },
        {
            id: 'identityTracking',
            label: 'Espaçamento (Tracking)',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) do nome da marca, em `em`. Valores positivos afastam as letras (clima editorial/premium, comum em wordmarks maiúsculos); valores negativos as aproximam.',
            axis: 'density',
            unit: 'em',
            constraints: { min: -0.1, max: 0.5, step: 0.01 },
            defaultValue: 0,
            cssVars: ['--sarak-identity-tracking']
        },

        // --- COMPORTAMENTO ---
        {
            id: 'identityRedirectUrl',
            label: 'Link de Redirecionamento',
            type: 'text',
            description: 'URL para onde o usuário é levado ao clicar no logo/nome da marca na navegação — tipicamente a rota raiz ("/") ou o dashboard principal. Comportamento funcional, não afeta a aparência.',
            defaultValue: '/',
            cssVars: ['--sarak-identity-link']
        },
        {
            id: 'identityHoverEffect',
            label: 'Efeito ao Hover',
            type: 'select',
            description: 'Efeito aplicado ao bloco de identidade quando o mouse passa por cima — Nenhum (sem feedback), Brilho (glow sutil), Opacidade (esmaece levemente) ou Escala (cresce/zoom). Sinaliza ao usuário que o logo é clicável.',
            axis: 'motion',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhum' },
                    { id: 'glow', label: 'Brilho' },
                    { id: 'opacity', label: 'Opacidade' },
                    { id: 'scale', label: 'Escala' }
                ]
            },
            defaultValue: 'opacity',
            cssVars: ['--sarak-identity-hover']
        }
    ]
};
