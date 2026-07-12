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
            label: 'Espaçamento da Matriz',
            type: 'slider',
            description: 'Espaçamento, em pixels, entre os itens da matriz expansível (`SarakExpandableMatrix`). Valores maiores separam melhor nós irmãos em estruturas com muitos filhos; valores menores favorecem densidade em matrizes grandes.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 4, max: 32 },
            defaultValue: 12,
            cssVars: ['--sarak-matrix-gap']
        },
        {
            id: 'matrixRadius',
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
            label: 'Fundo do Item Pai',
            type: 'color',
            description: 'Cor de fundo dos nós-pai (itens com filhos) da matriz expansível — normalmente sutil/translúcida, para diferenciar do fundo geral da tela sem competir com o conteúdo.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.02)',
            cssVars: ['--sarak-matrix-item-bg']
        },
        {
            id: 'matrixBorderColor',
            label: 'Cor da Borda Base',
            type: 'color',
            description: 'Cor da borda que delimita os itens da matriz expansível — costuma ser sutil, só o suficiente para separar visualmente os nós sem criar ruído.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-matrix-border-color']
        },
        {
            id: 'matrixSearchBg',
            label: 'Fundo da Busca',
            type: 'color',
            description: 'Cor de fundo da barra de busca embutida no topo da matriz expansível, usada para filtrar os nós exibidos.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-matrix-search-bg']
        },
        {
            id: 'matrixBlur',
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
