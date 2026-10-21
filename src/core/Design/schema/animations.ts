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
            kind: 'functional',
            modeDependent: false,
            usage: "Liga e desliga a transição entre páginas (`SarakPageTransition`): desligada, a página troca no mesmo quadro. Não desliga as transições dos componentes.",
            interactsWith: ['pageTransitionType'],
            label: 'Ativar Movimentos',
            type: 'boolean',
            description: 'Liga/desliga a transição entre páginas (`SarakPageTransition`): desligada, a página troca sem animar. Não desliga as transições dos componentes — para isso há `reducedMotion` (acessibilidade) e `motionDuration*`.',
            axis: 'motion',
            defaultValue: true,
        },
        // --- ADVANCED EFFECTS ---
        {
            id: 'pageTransitionType',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Efeito da troca de página: Fade, Deslizar para cima (20 px), Deslizar lateral (50 px), Zoom (±5%) ou Desativado; a duração vem de `motionDurationNormal`.",
            interactsWith: ['animEnabled', 'motionDurationNormal'],
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Resposta do cartão ao ponteiro: Elevar (sobe e ganha sombra), Apenas brilho (só o brilho, sem mover) ou Expandir (cresce 2%).",
            interactsWith: ['cardHoverTranslate'],
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
            defaultValue: 'glow-only'}
    ]
};
