import React, { useState, useRef, useEffect } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export interface SarakAccordionProps {
    title: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

/**
 * Componente Atômico de Acordeão (Expansível).
 * Empurra o conteúdo abaixo fluidamente lendo os tokens de animação da Engine.
 */
export const SarakAccordion: React.FC<SarakAccordionProps> = ({
    title,
    children,
    defaultOpen = false,
    className = ''
}) => {
    const { design } = useSarakUI();
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [height, setHeight] = useState<number | 'auto'>(defaultOpen ? 'auto' : 0);
    const contentRef = useRef<HTMLDivElement>(null);

    const animNormal = design?.animNormal;
    const animDuration = typeof animNormal === 'number' ? `${animNormal}ms` : '300ms';
    const animEasing = (design?.easeMain as string) || 'ease-in-out';
    const borderRadius = (design?.borderRadius as string | number) || 'var(--sarak-card-radius,12px)';
    const borderColor = 'var(--border-color,#334155))';

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (!contentRef.current) return;
        if (isOpen) {
            const contentHeight = contentRef.current.scrollHeight;
            setHeight(contentHeight);
            
            const timer = setTimeout(() => {
                setHeight('auto');
            }, parseInt(animDuration) || 300);
            return () => clearTimeout(timer);
        } else {
            setHeight(contentRef.current.scrollHeight);
            // Request animation frame to allow DOM to process the specific height before going to 0
            requestAnimationFrame(() => {
                setHeight(0);
            });
        }
    }, [isOpen, animDuration]);

    return (
        <div
            className={`flex border ${className}`}
            style={{
                flexDirection: 'column',
                borderColor,
                borderRadius
            }}
        >
            <button
                type="button"
                className="flex items-center justify-between w-full text-left focus:outline-none transition-colors hover:bg-white/5"
                style={{ padding: 'var(--sarak-layout-gap-md, 16px)' }}
                onClick={toggleOpen}
            >
                <div className="flex-1">{title}</div>
                <div 
                    className="transform transition-transform"
                    style={{ 
                        transitionDuration: animDuration, 
                        transitionTimingFunction: animEasing,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                >
                    ▼
                </div>
            </button>
            <div 
                className="overflow-hidden transition-all"
                style={{ 
                    height, 
                    transitionDuration: animDuration,
                    transitionTimingFunction: animEasing
                }}
            >
                <div ref={contentRef} className="border-t" style={{ padding: 'var(--sarak-layout-gap-md, 16px)', borderColor }}>
                    {children}
                </div>
            </div>
        </div>
    );
};
