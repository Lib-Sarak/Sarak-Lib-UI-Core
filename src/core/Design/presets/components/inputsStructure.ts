import type { ComponentPreset } from './cards';

/** Campos de estrutura: contorno, cantos, desfoque e a busca. Nenhum escreve cor nem sombra em texto. */
export const INPUT_STRUCTURE_PRESETS: ComponentPreset[] = [
    {
        id: 'input-soft-round',
        name: 'Macio e redondo',
        description: 'Contorno sólido com cantos generosos e nenhum desfoque.',
        keywords: ['redondo', 'round', 'suave', 'macio'],
        design: { inputBorderType: 'solid', inputBorderRadius: 14, inputBackdropBlur: 4 },
    },
    {
        id: 'input-flat-filled',
        name: 'Preenchido sem borda',
        description: 'Sem contorno e com cantos curtos: o campo se separa só pelo fundo.',
        keywords: ['sem borda', 'filled', 'plano', 'flat'],
        design: { inputBorderType: 'none', inputBorderRadius: 6, inputBackdropBlur: 0 },
    },
    {
        id: 'input-sharp-outline',
        name: 'Contorno reto',
        description: 'Cantos retos e contorno sólido: formulário sério e técnico.',
        keywords: ['reto', 'sharp', 'tecnico', 'formal'],
        design: { inputBorderType: 'solid', inputBorderRadius: 0, inputBackdropBlur: 0 },
    },
    {
        id: 'input-glass-deep',
        name: 'Vidro profundo',
        description: 'Contorno sólido com desfoque forte por trás, para campos sobre atmosfera.',
        keywords: ['vidro', 'glass', 'desfoque', 'blur'],
        design: { inputBorderType: 'solid', inputBorderRadius: 16, inputBackdropBlur: 28 },
    },
    {
        id: 'input-search-pill',
        name: 'Busca em pílula',
        description: 'Campo em pílula sem contorno, com a caixa de busca desfocada.',
        keywords: ['busca', 'search', 'pilula', 'pesquisa'],
        design: { inputBorderType: 'none', inputBorderRadius: 120, searchBackdropBlur: 24, inputBackdropBlur: 10 },
    },
    {
        id: 'input-dashed-draft',
        name: 'Rascunho tracejado',
        description: 'Contorno tracejado e cantos suaves: ar de formulário em construção.',
        keywords: ['tracejado', 'dashed', 'rascunho'],
        design: { inputBorderType: 'dashed', inputBorderRadius: 10, inputBackdropBlur: 0 },
    },
];
