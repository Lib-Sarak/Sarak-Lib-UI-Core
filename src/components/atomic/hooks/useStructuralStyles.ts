import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

/**
 * Hook Controlador Estrutural (Fase 2 da Expansão).
 * Centraliza a leitura dos tokens de layout (Geometria) do Banco de Dados e 
 * os traduz para classes utilitárias ou variáveis CSS inline, removendo o hardcode do JSX.
 */
export const useStructuralStyles = () => {
    const { design } = useSarakUI();

    // ==========================================
    // EIXO 1: MACRO-LAYOUT (Grids e Containers)
    // ==========================================
    const getGridStyles = () => {
        const layoutType = design?.layoutGridTemplate || 'col-12';
        const gap = design?.globalSectionGap || 'var(--sx-spacing-md)';
        
        const gridStrategies: Record<string, string> = {
            'col-12': 'grid w-full grid-cols-1 md:grid-cols-12',
            'auto-fit': 'grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))]',
            'masonry': 'columns-1 md:columns-2 lg:columns-3 w-full'
        };

        return {
            className: gridStrategies[layoutType] || gridStrategies['col-12'],
            style: { gap, columnGap: layoutType === 'masonry' ? gap : undefined }
        };
    };

    // ==========================================
    // EIXO 2: FORMULÁRIOS E AGRUPAMENTOS
    // ==========================================
    const getFormGroupStyles = () => {
        const labelPos = design?.formLabelPosition || 'top';
        const density = design?.formFieldDensity || 'comfortable';

        const labelStrategies: Record<string, string> = {
            'left': 'flex flex-row items-center w-full',
            'top': 'flex flex-col w-full'
        };

        const densityStrategies: Record<string, string> = {
            'tight': 'var(--sx-spacing-2xs)',
            'relaxed': 'var(--sx-spacing-md)',
            'comfortable': 'var(--sx-spacing-xs)'
        };

        return {
            className: labelStrategies[labelPos] || labelStrategies['top'],
            style: { gap: densityStrategies[density] || densityStrategies['comfortable'] }
        };
    };

    // ==========================================
    // EIXO 3: ANATOMIA DE CARDS
    // ==========================================
    const getCardStyles = () => {
        const mediaPos = design?.cardMediaPlacement || 'top';
        const contentAlign = design?.cardContentAlignment || 'start';

        const mediaStrategies: Record<string, string> = {
            'left': 'flex flex-row relative overflow-hidden',
            'right': 'flex flex-row-reverse relative overflow-hidden',
            'top': 'flex flex-col relative overflow-hidden'
        };

        const alignStrategies: Record<string, string> = {
            'center': 'items-center text-center',
            'space-between': 'justify-between',
            'start': 'items-start'
        };

        const baseClass = mediaStrategies[mediaPos] || mediaStrategies['top'];
        const alignClass = alignStrategies[contentAlign] || alignStrategies['start'];

        return {
            className: `${baseClass} ${alignClass}`,
            style: {}
        };
    };

    // ==========================================
    // EIXO 4: MICRO-LAYOUT DE INPUTS
    // ==========================================
    const getInputIconStyles = () => {
        const iconPosition = design?.inputIconPosition || 'left';
        
        const posStrategies: Record<string, string> = {
            'right': 'absolute right-3',
            'left': 'absolute left-3'
        };

        return {
            iconPositionClass: posStrategies[iconPosition] || posStrategies['left'],
            isIconRight: iconPosition === 'right'
        };
    };

    // ==========================================
    // EIXO 5: MICRO-LAYOUT DE SWITCHES/CHECKBOXES
    // ==========================================
    const getSwitchLayoutStyles = () => {
        const switchPos = design?.switchLabelPosition || 'right';
        
        const switchStrategies: Record<string, string> = {
            'left': 'flex items-center cursor-pointer flex-row-reverse justify-end',
            'space-between': 'flex items-center cursor-pointer justify-between w-full',
            'right': 'flex items-center cursor-pointer flex-row'
        };

        return {
            containerClass: switchStrategies[switchPos] || switchStrategies['right'],
            textContainerClass: 'flex flex-col',
            style: { gap: 'var(--sx-spacing-sm)' }
        };
    };

    // ==========================================
    // EIXO 6: MACRO-CONTAINERS GENÉRICOS
    // ==========================================
    const getContainerStyles = () => {
        const flow = design?.globalFlowDirection || 'column';
        const align = design?.globalFlowAlign || 'stretch';

        const flowStrategies: Record<string, string> = {
            'row': 'flex flex-row flex-wrap',
            'column': 'flex flex-col'
        };

        const alignStrategies: Record<string, string> = {
            'center': 'items-center',
            'start': 'items-start',
            'end': 'items-end',
            'stretch': ''
        };

        const flowClass = flowStrategies[flow] || flowStrategies['column'];
        const alignClass = alignStrategies[align] || '';

        return {
            className: `${flowClass} ${alignClass}`.trim(),
            style: { gap: 'var(--sx-spacing-md)' }
        };
    };

    const getHeaderStyles = () => {
        const align = design?.headerAlignment || 'space-between';
        
        const alignStrategies: Record<string, string> = {
            'space-between': 'justify-between',
            'center': 'justify-center',
            'start': 'justify-start'
        };

        const alignClass = alignStrategies[align] || alignStrategies['space-between'];
        const headerClass = `flex flex-col md:flex-row md:items-center w-full ${alignClass}`;

        return {
            className: headerClass.trim(),
            style: { gap: 'calc(var(--sx-spacing-md) / 1.5)' }
        };
    };

    return { 
        getGridStyles, 
        getFormGroupStyles, 
        getCardStyles, 
        getInputIconStyles, 
        getSwitchLayoutStyles,
        getContainerStyles,
        getHeaderStyles
    };
};
