import { useState, useEffect } from 'react';

export const useInspector = (onInspectComponent?: (schemaId: string) => void) => {
    const [isInspecting, setIsInspecting] = useState(false);

    useEffect(() => {
        if (!isInspecting) return;

        const handleInspectClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target as HTMLElement;
            let schemaId = 'shell';

            const selectors: Record<string, string> = {
                'button': 'controls',
                'input, select, textarea': 'controls',
                '.card, [class*="card"], [class*="panel"]': 'cards',
                'h1, h2, h3, h4, h5, h6, p, span, a': 'typography'
            };

            for (const [selector, id] of Object.entries(selectors)) {
                if (target.closest(selector)) {
                    schemaId = id;
                    break;
                }
            }

            setIsInspecting(false);
            if (onInspectComponent) {
                onInspectComponent(schemaId);
            }
        };

        document.addEventListener('click', handleInspectClick, true);
        return () => document.removeEventListener('click', handleInspectClick, true);
    }, [isInspecting, onInspectComponent]);

    return {
        isInspecting,
        setIsInspecting
    };
};
