import { useSarak } from '../../../core/Provider/SarakProvider';

/**
 * Hook Controlador Estrutural (Fase 2 da Expansão).
 * Centraliza a leitura dos tokens de layout (Geometria) do Banco de Dados e 
 * os traduz para classes utilitárias ou variáveis CSS inline, removendo o hardcode do JSX.
 */
export const useStructuralStyles = () => {
    const { design } = useSarak();

    // ==========================================
    // EIXO 1: MACRO-LAYOUT (Grids e Containers)
    // ==========================================
    const getGridStyles = () => {
        // Fallbacks seguros até que os tokens sejam injetados no MasterMap
        const layoutType = design?.layoutGridTemplate || 'col-12';
        const gap = design?.globalSectionGap || 'var(--sx-spacing-md)';
        
        let layoutClass = 'grid w-full ';
        if (layoutType === 'col-12') {
            layoutClass += 'grid-cols-1 md:grid-cols-12';
        } else if (layoutType === 'auto-fit') {
            // Um grid que se auto-preenche sem media queries fixas
            layoutClass += 'grid-cols-[repeat(auto-fit,minmax(280px,1fr))]';
        } else if (layoutType === 'masonry') {
            layoutClass = 'columns-1 md:columns-2 lg:columns-3 w-full '; // Remove 'grid'
        }

        return {
            className: layoutClass,
            style: { gap, columnGap: layoutType === 'masonry' ? gap : undefined }
        };
    };

    // ==========================================
    // EIXO 2: FORMULÁRIOS E AGRUPAMENTOS
    // ==========================================
    const getFormGroupStyles = () => {
        const labelPos = design?.formLabelPosition || 'top';
        const density = design?.formFieldDensity || 'comfortable';

        let groupClass = 'flex w-full ';
        
        // Direcionamento do Label (Cima vs Lado)
        if (labelPos === 'left') {
            groupClass += 'flex-row items-center ';
        } else {
            groupClass += 'flex-col ';
        }

        // Densidade de Espaçamento
        let gap = 'var(--sx-spacing-xs)'; // Default Comfortable
        if (density === 'tight') gap = 'var(--sx-spacing-2xs)';
        if (density === 'relaxed') gap = 'var(--sx-spacing-md)';

        return {
            className: groupClass,
            style: { gap }
        };
    };

    // ==========================================
    // EIXO 3: ANATOMIA DE CARDS
    // ==========================================
    const getCardStyles = () => {
        const mediaPos = design?.cardMediaPlacement || 'top';
        const contentAlign = design?.cardContentAlignment || 'start';

        let cardClass = 'flex relative overflow-hidden ';
        
        // Posição da Mídia (Imagem) vs Conteúdo
        if (mediaPos === 'left') {
            cardClass += 'flex-row ';
        } else if (mediaPos === 'right') {
            cardClass += 'flex-row-reverse ';
        } else {
            // top ou default
            cardClass += 'flex-col ';
        }

        // Alinhamento do conteúdo
        if (contentAlign === 'center') {
            cardClass += 'items-center text-center ';
        } else if (contentAlign === 'space-between') {
            cardClass += 'justify-between ';
        } else {
            cardClass += 'items-start ';
        }

        return {
            className: cardClass,
            style: {}
        };
    };

    return { getGridStyles, getFormGroupStyles, getCardStyles };
};
