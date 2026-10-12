import { ComponentSchema } from '../types';

/**
 * SCHEMA: ANIMATIONS (MOTION)
 * Comportamento do movimento: liga/desliga e o estilo das transições. O ritmo (durações) e as
 * curvas vivem num lugar só, o schema `motion.ts`.
 */
export const AnimationSchema: ComponentSchema = {
    id: 'animations',
    label: 'Transições e Animações',
    tokens: [
        // --- BEHAVIOR ---
        {
            id: 'animEnabled',
            label: 'Ativar Movimentos',
            type: 'boolean',
            description: 'Chave-mestra que liga/desliga animações e transições em toda a aplicação. Desligar é diferente de `reducedMotion` (acessibilidade): aqui é uma preferência estética/performance, não necessariamente ligada a `prefers-reduced-motion`.',
            axis: 'motion',
            defaultValue: true,
        },
        // --- ADVANCED EFFECTS ---
        {
            id: 'pageTransitionType',
            label: 'Transição de Página',
            type: 'select',
            description: 'Efeito de transição ao navegar entre páginas/rotas. Fade Suave é o mais neutro; Deslizar (para Cima/Lateral) dá sensação de navegação espacial; Zoom Espacial é o mais expressivo; Desativado remove a transição.',
            axis: 'motion',
            constraints: {
                options: [
                    { id: 'fade', value: 'fade', label: 'Fade Suave' },
                    { id: 'slide-up', value: 'slide-up', label: 'Deslizar para Cima' },
                    { id: 'slide-side', value: 'slide-side', label: 'Deslizar Lateral' },
                    { id: 'zoom', value: 'zoom', label: 'Zoom Espacial' },
                    { id: 'none', value: 'none', label: 'Desativado' }
                ]
            },
            defaultValue: 'fade'
        },
        {
            id: 'cardHoverStyle',
            label: 'Estilo de Hover (Cards)',
            type: 'select',
            description: 'Comportamento visual dos cards ao passar o mouse: Elevar (sobe/ganha sombra), Apenas Brilho (só glow, sem movimento) ou Expandir (cresce levemente). Define o tipo de feedback tátil de toda a família de cards; no Elevar, o deslocamento vem de `cardHoverTranslate`.',
            axis: 'motion',
            constraints: {
                options: [
                    { id: 'lift', value: 'lift', label: 'Elevar (Lift)' },
                    { id: 'glow-only', value: 'glow-only', label: 'Apenas Brilho' },
                    { id: 'expand', value: 'expand', label: 'Expandir' }
                ]
            },
            defaultValue: 'lift'
        }
    ]
};
