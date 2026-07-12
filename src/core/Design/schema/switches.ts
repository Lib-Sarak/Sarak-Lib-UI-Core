import { ComponentSchema } from '../types';

/**
 * SCHEMA: ALTERNADORES & SWITCHES
 * Governa seletores binários, checkboxes, switches premium e toggles táteis.
 */
export const SwitchesSchema: ComponentSchema = {
    id: 'switches',
    label: 'Alternadores (Toggles)',
    tokens: [
        {
            id: 'switchTrackActiveBg',
            label: 'Cor: Switch Ativo',
            type: 'color',
            description: 'Cor de fundo do trilho do switch quando ligado (estado "true"). Deve ser facilmente distinguível do estado desligado — costuma usar a cor primária do sistema. Gera variantes automáticas.',
            axis: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-switch-active-bg']
        },
        {
            id: 'switchThumbBg',
            label: 'Cor: Switch Botão',
            type: 'color',
            description: 'Cor do botão circular (thumb) que desliza dentro do switch — precisa manter contraste alto contra o trilho em ambos os estados (ligado/desligado).',
            axis: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-switch-thumb']
        },
        {
            id: 'checkboxActiveColor',
            label: 'Cor do Check Selecionado',
            type: 'color',
            description: 'Cor de preenchimento/marca de um checkbox quando selecionado — normalmente espelha a cor primária do sistema para consistência com outros controles ativos (switch, radio). Gera variantes automáticas.',
            axis: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-checkbox-active']
        },
        {
            id: 'switchStyleType',
            label: 'Estilo do Alternador (Switch)',
            type: 'select',
            description: 'Linguagem visual do switch: Tactile Slider (deslizante clássico, o mais neutro), Asymmetric Toggle (formato assimétrico, mais orgânico), Pulsing Dot (ponto que pulsa quando ativo, chama atenção) ou Micro Glass Tab (vidro translúcido, minimalista). Escolha antes de ajustar `switchPulseColor`, que só faz efeito em \'pulsing\'.',
            axis: 'texture',
            constraints: {
                options: [
                    { id: 'tactile', value: 'tactile', label: 'Tactile Slider' },
                    { id: 'asymmetric', value: 'asymmetric', label: 'Asymmetric Toggle' },
                    { id: 'pulsing', value: 'pulsing', label: 'Pulsing Dot' },
                    { id: 'glass', value: 'glass', label: 'Micro Glass Tab' }
                ]
            },
            defaultValue: 'tactile',
            cssVars: ['--sarak-switch-style-type']
        },
        {
            id: 'switchBackdropBlur',
            label: 'Desfoque do Alternador (Vidro)',
            type: 'slider',
            description: 'Intensidade do desfoque de fundo do switch — só relevante quando `switchStyleType` é \'glass\' (Micro Glass Tab), onde o trilho é translúcido.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 4,
            cssVars: ['--sarak-switch-backdrop-blur']
        },
        {
            id: 'switchPulseColor',
            label: 'Cor do Pulso (Pulsing Dot)',
            type: 'color',
            description: 'Cor do pulso de destaque ao redor do switch — só tem efeito visível quando `switchStyleType` é \'pulsing\'. Normalmente a mesma cor de `switchTrackActiveBg` em tom translúcido.',
            axis: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-switch-pulse-color']
        }
    ]
};
