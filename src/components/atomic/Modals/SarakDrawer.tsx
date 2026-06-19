import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export interface SarakDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    direction?: 'left' | 'right' | 'top' | 'bottom';
    children: React.ReactNode;
    size?: string | number;
    className?: string;
}

/**
 * Componente de Painel Lateral Deslizante (Drawer).
 * Renderiza um overlay e conteúdo deslizante baseado na direção.
 */
export const SarakDrawer: React.FC<SarakDrawerProps> = ({
    isOpen,
    onClose,
    direction = 'right',
    children,
    size = 320,
    className = ''
}) => {
    const { design } = useSarakUI();
    const [shouldRender, setShouldRender] = useState(isOpen);

    const animSlow = design?.animSlow;
    const animDuration = typeof animSlow === 'number' ? `${animSlow}ms` : (animSlow as string) || '400ms';
    const animEasing = (design?.easeMain as string) || 'ease-in-out';
    const zIndex = (design?.zIndexModal as number) || 1000;
    const overlayBg = design?.modalOverlayColor || 'var(--sx-color-overlay-base)';

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, parseInt(String(animDuration)) || 400);
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, animDuration]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!shouldRender) return null;

    const isHorizontal = direction === 'left' || direction === 'right';

    const getTransform = () => {
        if (isOpen) return 'translate3d(0, 0, 0)';
        switch (direction) {
            case 'left': return 'translate3d(-100%, 0, 0)';
            case 'right': return 'translate3d(100%, 0, 0)';
            case 'top': return 'translate3d(0, -100%, 0)';
            case 'bottom': return 'translate3d(0, 100%, 0)';
        }
    };

    const getPositionStyles = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            position: 'fixed',
            transform: getTransform(),
            transitionProperty: 'transform',
            transitionDuration: String(animDuration),
            transitionTimingFunction: String(animEasing),
            backgroundColor: String(design?.bgBaseColor || 'var(--sx-color-surface-base)'),
            // sidebarShadow é o token de elevação composta disponível no sistema (não há modalShadow dedicado)
            boxShadow: String(design?.sidebarShadow || '0 10px 25px rgba(0,0,0,0.5)'),
            zIndex: (parseInt(String(zIndex)) || 1000) + 1,
        };

        if (isHorizontal) {
            base.top = 0;
            base.bottom = 0;
            base[direction as 'left' | 'right'] = 0;
            base.width = size;
            base.maxWidth = '100vw';
        } else {
            base.left = 0;
            base.right = 0;
            base[direction as 'top' | 'bottom'] = 0;
            base.height = size;
            base.maxHeight = '100vh';
        }

        return base;
    };

    const drawerElement = (
        <div style={{ position: 'relative', zIndex }}>
            {/* Overlay */}
            <div
                className="fixed inset-0 transition-opacity"
                data-testid="sarak-drawer-overlay"
                style={{
                    backgroundColor: String(overlayBg),
                    opacity: isOpen ? 1 : 0,
                    transitionDuration: String(animDuration),
                    zIndex: parseInt(String(zIndex)) || 1000
                }}
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Drawer */}
            <div 
                className={`overflow-y-auto ${className}`}
                style={getPositionStyles()}
                role="dialog"
                aria-modal="true"
            >
                {children}
            </div>
        </div>
    );

    // Usa portal para renderizar no topo do DOM se possível
    if (typeof document !== 'undefined') {
        return createPortal(drawerElement, document.body);
    }

    return drawerElement;
};
