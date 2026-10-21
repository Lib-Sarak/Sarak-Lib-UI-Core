import { ComponentSchema } from '../types';

/**
 * SCHEMA: COMPONENTES AVANÇADOS
 * Governa componentes de alta complexidade como o SarakExpandableMatrix.
 */
export const AdvancedSchema: ComponentSchema = {
    id: 'advanced',
    label: 'Componentes Avançados',
    tokens: [
        {
            id: 'matrixGap',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espaço entre os sub-itens da matriz expansível (`SarakExpandableMatrix`) dentro de cada linha aberta; os filhos aninhados de um sub-item têm o espaçamento próprio.",
            label: 'Espaçamento da Matriz',
            type: 'slider',
            description: 'Espaçamento, em pixels, entre os sub-itens da matriz expansível (`SarakExpandableMatrix`) dentro de cada linha aberta. Valores maiores separam melhor nós irmãos em estruturas com muitos filhos; valores menores favorecem densidade em matrizes grandes.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 4, max: 32 },
            defaultValue: 12,
            cssVars: ['--sarak-matrix-gap']
        },
        {
            id: 'matrixRadius',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Arredondamento dos itens da matriz expansível (`SarakExpandableMatrix`); 0 os deixa em ângulo reto.",
            label: 'Arredondamento dos Itens',
            type: 'slider',
            description: 'Raio de borda dos itens/nós da matriz expansível, em pixels. 0 = anguloso/técnico; valores altos = arredondado/amigável.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-matrix-radius']
        },
        {
            id: 'matrixItemBg',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Fundo dos itens da matriz expansível; o padrão é um branco quase transparente que não aparece sobre fundo claro.",
            label: 'Fundo do Item Pai',
            type: 'color',
            description: 'Cor de fundo dos nós-pai (itens com filhos) da matriz expansível — normalmente sutil/translúcida, para diferenciar do fundo geral da tela sem competir com o conteúdo.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.02)',
            cssVars: ['--sarak-matrix-item-bg']
        },
        {
            id: 'matrixBorderColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Cor da borda dos itens da matriz expansível; o padrão é um branco translúcido que some sobre fundo claro.",
            label: 'Cor da Borda Base',
            type: 'color',
            description: 'Cor da borda que delimita os itens da matriz expansível — costuma ser sutil, só o suficiente para separar visualmente os nós sem criar ruído.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-matrix-border-color']
        },
        {
            id: 'matrixBlur',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Desfoque do vidro atrás dos itens da matriz expansível; 0 os deixa nítidos.",
            label: 'Desfoque de Vidro (Blur)',
            type: 'slider',
            description: 'Intensidade do desfoque (efeito vidro) aplicado ao fundo dos itens da matriz expansível quando o tema usa superfícies translúcidas.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 10,
            cssVars: ['--sarak-matrix-blur']
        }
    ]
};
