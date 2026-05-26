export const sanitizeCategory = (rawCategory: string): string => {
    const raw = rawCategory.toLowerCase().trim();

    // Dicionário de Redução
    if (['cores', 'colors-and-atmosphere', 'identidade', 'branding', 'marca'].includes(raw)) return 'Cores e Marca';
    if (['tipografia', 'typography', 'peso'].includes(raw)) return 'Tipografia';
    if (['layout', 'layout_and_navigation', 'navegacao', 'navegação', 'estrutura', 'alinhamento', 'posicionamento', 'container'].includes(raw)) return 'Layout e Navegação';
    if (['efeito', 'efeitos', 'sombra-luz', 'filtros', 'iluminacao', 'ruído', 'glassmorphism', 'opacidade', 'texturas'].includes(raw)) return 'Efeitos e Superfície';
    if (['geometria', 'bordas', 'espessura', 'curvas', 'assimetria', 'tamanho', 'escala'].includes(raw)) return 'Geometria e Bordas';
    if (['cards', 'surface', 'superficie'].includes(raw)) return 'Cards e Superfícies';
    if (['animacao', 'animações', 'motion-and-animation', 'timing', 'física'].includes(raw)) return 'Animações';
    if (['botoes', 'interacao', 'interação', 'comportamento', 'estado'].includes(raw)) return 'Botões e Interação';
    if (['data-and-charts', 'tabelas', 'gráficos', 'indicadores'].includes(raw)) return 'Dados e Gráficos';
    if (['inputs', 'switches', 'comportamento', 'ajuste'].includes(raw)) return 'Formulários';
    if (['specialized-engines', 'media', 'imagem', 'câmera', 'overlays', 'status', 'scrollbar'].includes(raw)) return 'Especializado';

    // Capitalize default
    return raw.charAt(0).toUpperCase() + raw.slice(1);
};
