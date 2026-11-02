const TARGET_ATTRIBUTE = 'data-sarak-print-target';
const PRINTING_ATTRIBUTE = 'data-sarak-printing';

/** Imprime a página; com `element`, só ele sai no papel (a regra está em `src/styles/_print.css`). */
export const sarakPrint = (element?: HTMLElement | null): void => {
    if (typeof window === 'undefined') return;
    if (!element) {
        window.print();
        return;
    }
    const root = document.documentElement;
    const clear = (): void => {
        element.removeAttribute(TARGET_ATTRIBUTE);
        root.removeAttribute(PRINTING_ATTRIBUTE);
    };
    element.setAttribute(TARGET_ATTRIBUTE, 'true');
    root.setAttribute(PRINTING_ATTRIBUTE, 'true');
    window.addEventListener('afterprint', clear, { once: true });
    window.print();
};
