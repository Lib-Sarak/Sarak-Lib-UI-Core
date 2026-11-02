import React from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import type { SidebarResize } from './useSidebarResize';

export interface ChromeSidebarResizeHandleProps {
    resize: SidebarResize;
    /** Lado da lateral na tela: a alça fica na borda voltada para o conteúdo. */
    side: 'left' | 'right';
}

/**
 * Alça de largura da lateral aberta: um separador vertical focável. Arrasto com o mouse ou o dedo, setas no teclado
 * (Shift anda mais; Home e End vão ao piso e ao teto) e duplo clique para voltar ao padrão.
 */
export const ChromeSidebarResizeHandle: React.FC<ChromeSidebarResizeHandleProps> = ({ resize, side }) => {
    const t = useLibraryText();
    const { bounds, handlers } = resize;
    return (
        <div
            role="separator"
            aria-orientation="vertical"
            aria-label={t('chromeSidebarResizeLabel')}
            aria-valuemin={bounds.min}
            aria-valuemax={bounds.max}
            aria-valuenow={bounds.now}
            tabIndex={0}
            data-sarak-widget="sidebar-resize"
            className="absolute inset-y-0 z-20 cursor-col-resize touch-none"
            style={{
                width: 'var(--sarak-layout-gap-sm, 8px)',
                [side === 'right' ? 'left' : 'right']: 0,
            }}
            {...handlers}
        />
    );
};

export default ChromeSidebarResizeHandle;
