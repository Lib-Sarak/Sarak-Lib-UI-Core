import { useMemo } from 'react';
import { SarakDesignState } from '../../Provider/types';
import { BREAKPOINT_DESKTOP } from '../../Design/breakpoints';

export interface ShellLayoutContext {
    shellClass: string;
    sidebarClass: string;
    topbarClass: string;
    mainContentClass: string;
}

const shellStrategies: Record<string, string> = {
    'right': 'flex-row-reverse',
    'floating': 'flex-row',
    'left': 'flex-row'
};

const sidebarStrategies: Record<string, string> = {
    'floating': 'absolute top-4 bottom-4 left-4 rounded-xl shadow-2xl',
    'right': 'border-l',
    'left': 'border-r'
};

const topbarStrategies: Record<string, string> = {
    'sticky': 'sticky top-0',
    'hidden': 'hidden',
    'relative': 'relative'
};

const BP_SM = 640;

const contentStrategies: Record<string, string> = {
    'center': `max-w-7xl mx-auto w-full px-4 @min-[${BP_SM}px]:px-6 @min-[${BREAKPOINT_DESKTOP}px]:px-8`,
    'stretch': 'w-full'
};

/**
 * Hook Controlador Estrutural (Camada 6) - Shell & Navegação
 * Traduz tokens de layout (sidebarPosition, navbarLayout, contentAlignment) em classes estruturais.
 */
export const useShellLayoutStyles = (design: SarakDesignState): ShellLayoutContext => {
    return useMemo(() => {
        const sidebarPosition = design?.sidebarPosition || 'left';
        const navbarLayout = design?.navbarLayout || 'sticky';
        const contentAlignment = design?.contentAlignment || 'stretch';

        const shClass = shellStrategies[sidebarPosition] || shellStrategies['left'];
        const shellClass = `flex h-screen w-full overflow-hidden relative ${shClass}`;

        const sbClass = sidebarStrategies[sidebarPosition] || sidebarStrategies['left'];
        const sidebarClass = `flex-shrink-0 h-full transition-all duration-300 z-30 ${sbClass}`;

        const tbClass = topbarStrategies[navbarLayout] || topbarStrategies['relative'];
        const topbarClass = `w-full flex items-center px-4 transition-all duration-300 z-20 ${tbClass}`;

        const cntClass = contentStrategies[contentAlignment] || contentStrategies['stretch'];
        const mainContentClass = `flex-1 flex flex-col overflow-y-auto relative ${cntClass}`;

        return {
            shellClass: shellClass.trim(),
            sidebarClass: sidebarClass.trim(),
            topbarClass: topbarClass.trim(),
            mainContentClass: mainContentClass.trim()
        };
    }, [design?.sidebarPosition, design?.navbarLayout, design?.contentAlignment]);
};
