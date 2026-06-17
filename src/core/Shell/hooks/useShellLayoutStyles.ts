import { useMemo } from 'react';

export interface ShellLayoutContext {
    shellClass: string;
    sidebarClass: string;
    topbarClass: string;
    mainContentClass: string;
}

/**
 * Hook Controlador Estrutural (Camada 6) - Shell & Navegação
 * Traduz tokens de layout (sidebarPosition, navbarLayout, contentAlignment) em classes estruturais.
 */
export const useShellLayoutStyles = (design: any): ShellLayoutContext => {
    return useMemo(() => {
        const sidebarPosition = design?.sidebarPosition || 'left';
        const navbarLayout = design?.navbarLayout || 'sticky';
        const contentAlignment = design?.contentAlignment || 'stretch';

        // 1. Container Geral do Shell
        let shellClass = 'flex h-screen w-full overflow-hidden relative ';
        if (sidebarPosition === 'right') {
            shellClass += 'flex-row-reverse';
        } else if (sidebarPosition === 'floating') {
            shellClass += 'flex-row'; // floating will position absolutely inside
        } else {
            shellClass += 'flex-row';
        }

        // 2. Comportamento da Sidebar
        let sidebarClass = 'flex-shrink-0 h-full transition-all duration-300 z-30 ';
        if (sidebarPosition === 'floating') {
            sidebarClass += 'absolute top-4 bottom-4 left-4 rounded-xl shadow-2xl ';
        } else if (sidebarPosition === 'right') {
            sidebarClass += 'border-l ';
        } else {
            sidebarClass += 'border-r ';
        }

        // 3. Comportamento da Topbar
        let topbarClass = 'w-full flex items-center px-4 transition-all duration-300 z-20 ';
        if (navbarLayout === 'sticky') {
            topbarClass += 'sticky top-0 ';
        } else if (navbarLayout === 'hidden') {
            topbarClass += 'hidden ';
        } else {
            topbarClass += 'relative ';
        }

        // 4. Alinhamento do Conteúdo Central
        let mainContentClass = 'flex-1 flex flex-col overflow-y-auto relative ';
        if (contentAlignment === 'center') {
            // Container centralizado com limite de max-width
            mainContentClass += 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 ';
        } else {
            // Stretch normal
            mainContentClass += 'w-full ';
        }

        return {
            shellClass: shellClass.trim(),
            sidebarClass: sidebarClass.trim(),
            topbarClass: topbarClass.trim(),
            mainContentClass: mainContentClass.trim()
        };
    }, [design?.sidebarPosition, design?.navbarLayout, design?.contentAlignment]);
};
