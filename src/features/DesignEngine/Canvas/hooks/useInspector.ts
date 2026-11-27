import { useState, useEffect } from 'react';

// Cada seletor aponta para a classe exata que o componente carrega: `[class*="card"]` casava
// qualquer utilitária com "card" no nome e a tratava como componente.
const INSPECTOR_SELECTORS: Array<[string, string]> = [
    ['button', 'controls'],
    ['input, select, textarea', 'controls'],
    ['.sarak-card', 'cards'],
    ['h1, h2, h3, h4, h5, h6, p, span, a', 'typography']
];

export const resolveSchemaId = (target: HTMLElement): string => {
    for (const [selector, id] of INSPECTOR_SELECTORS) {
        if (target.closest(selector)) return id;
    }
    return 'shell';
};

export const useInspector = (onInspectComponent?: (schemaId: string) => void) => {
    const [isInspecting, setIsInspecting] = useState(false);

    useEffect(() => {
        if (!isInspecting) return;

        const handleInspectClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const schemaId = resolveSchemaId(e.target as HTMLElement);

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
