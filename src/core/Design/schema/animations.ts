import { ComponentSchema } from '../types';

/**
 * SCHEMA: ANIMATIONS (MOTION)
 * Define o ritmo, curvas de easing e durações de toda a interface.
 */
export const AnimationSchema: ComponentSchema = {
    id: 'animations',
    label: 'Transições e Animações',
    tokens: [
        // --- TIMING ---
        {
            id: 'animInstant',
            label: 'Duração: Instante',
            type: 'slider',
            description: 'Duração, em milissegundos, de transições quase imperceptíveis (ex. feedback de clique). É a mais curta das 4 escalas de tempo do sistema — use para micro-interações que não devem parecer "lentas".',
            axis: 'motion',
            unit: 'ms',
            constraints: { min: 0, max: 200, step: 10 },
            defaultValue: 100,
            cssVars: ['--sarak-anim-instant']
        },
        {
            id: 'animFast',
            label: 'Duração: Rápida',
            type: 'slider',
            description: 'Duração, em milissegundos, de transições rápidas (ex. hover de botão, troca de ícone). O padrão para a maioria das micro-interações de UI.',
            axis: 'motion',
            unit: 'ms',
            constraints: { min: 50, max: 400, step: 10 },
            defaultValue: 200,
            cssVars: ['--sarak-anim-fast']
        },
        {
            id: 'animNormal',
            label: 'Duração: Normal',
            type: 'slider',
            description: 'Duração, em milissegundos, de transições de escopo médio (ex. abrir/fechar um dropdown, expandir um card). Ritmo perceptível mas ainda ágil.',
            axis: 'motion',
            unit: 'ms',
            constraints: { min: 100, max: 800, step: 10 },
            defaultValue: 300,
            cssVars: ['--sarak-anim-normal']
        },
        {
            id: 'animSlow',
            label: 'Duração: Lenta',
            type: 'slider',
            description: 'Duração, em milissegundos, de transições mais dramáticas/cinematográficas (ex. transição de página inteira, entrada de um modal grande). Use com moderação — durações muito longas atrasam a percepção de resposta do sistema.',
            axis: 'motion',
            unit: 'ms',
            constraints: { min: 200, max: 2000, step: 50 },
            defaultValue: 500,
            cssVars: ['--sarak-anim-slow']
        },

        // --- EASING ---
        {
            id: 'easeMain',
            label: 'Curva: Padrão (Main)',
            type: 'select',
            description: 'Curva de aceleração (easing) usada como padrão pela maioria das transições do sistema. "Standard" é o mais neutro/universal; "Smooth Industrial" tem entrada mais abrupta; "Accelerated"/"Decelerated" enfatizam início ou fim do movimento.',
            axis: 'motion',
            constraints: {
                options: [
                    { id: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Standard' },
                    { id: 'cubic-bezier(0.6, 0.05, 0.01, 0.9)', label: 'Smooth Industrial' },
                    { id: 'cubic-bezier(0.4, 0, 1, 1)', label: 'Accelerated' },
                    { id: 'cubic-bezier(0, 0, 0.2, 1)', label: 'Decelerated' }
                ]
            },
            defaultValue: 'cubic-bezier(0.4, 0, 0.2, 1)',
            cssVars: ['--sarak-ease-main']
        },
        {
            id: 'easeOut',
            label: 'Curva: Saída Suave',
            type: 'select',
            description: 'Curva de aceleração usada especificamente para elementos que estão saindo de cena/encerrando um movimento (ex. fechamento de painel). "Quintic"/"Expo" desaceleram mais suavemente que "Standard".',
            axis: 'motion',
            constraints: {
                options: [
                    { id: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Standard' },
                    { id: 'cubic-bezier(0.23, 1, 0.32, 1)', label: 'Quintic' },
                    { id: 'cubic-bezier(0.19, 1, 0.22, 1)', label: 'Expo' }
                ]
            },
            defaultValue: 'cubic-bezier(0.4, 0, 0.2, 1)',
            cssVars: ['--sarak-ease-out']
        },

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
            description: 'Comportamento visual dos cards ao passar o mouse: Elevar (sobe/ganha sombra), Apenas Brilho (só glow, sem movimento), Expandir (cresce levemente) ou Inclinação 3D (tilt seguindo o cursor). Define o tipo de feedback tátil de toda a família de cards.',
            axis: 'motion',
            constraints: {
                options: [
                    { id: 'lift', value: 'lift', label: 'Elevar (Lift)' },
                    { id: 'glow-only', value: 'glow-only', label: 'Apenas Brilho' },
                    { id: 'expand', value: 'expand', label: 'Expandir' },
                    { id: '3d-tilt', value: '3d-tilt', label: 'Inclinação 3D' }
                ]
            },
            defaultValue: 'lift'
        }
    ]
};
