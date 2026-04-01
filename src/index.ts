/**
 * Sarak UI Core — Entry Point Unificado
 *
 * Exporta o Design System completo: presets de tema, tokens de tipografia,
 * efeitos visuais, texturas e o Theme Engine de inicialização.
 *
 * Uso:
 *   import { BASE_PRESETS, initSarakTheme } from '@sarak/lib-ui-core';
 *   import '@sarak/lib-ui-core/style.css';
 */
export * from './themes';

/**
 * Injeta o tema Sarak no documento.
 *
 * Aplica o atributo data-sarak-theme no <html> para ativação de variáveis CSS
 * e garante que o link de estilo base não seja duplicado em re-renders.
 *
 * Deve ser chamada uma única vez no bootstrap da aplicação,
 * após importar o CSS via: `import '@sarak/lib-ui-core/style.css'`
 *
 * @param preset - Chave do preset de tema (key do BASE_PRESETS). Padrão: 'glass'
 */
export function initSarakTheme(preset: string = 'glass'): void {
    // Guard para SSR — não executa fora do browser
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-sarak-theme', preset);
}
