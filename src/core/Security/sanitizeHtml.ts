/**
 * Canal Centralizado de Sanitização de HTML (Spec 40 — Regra 2)
 *
 * ÚNICO ponto autorizado a transformar HTML/Markdown não confiável em HTML seguro na
 * biblioteca. Toda renderização rica (`SarakMarkdownRenderer`, `SarakRichText`) DEVE
 * passar por aqui; é PROIBIDO usar `dangerouslySetInnerHTML` com conteúdo de
 * usuário/IA fora deste canal. A única exceção conhecida é o `<style>` de `responsiveCSS`
 * no `DesignScope`, que é CSS gerado pela engine (não conteúdo externo) — ver Spec 42.
 *
 * Implementação: DOMPurify (allowlist) no browser; em SSR (sem DOM) cai num fallback
 * fail-closed que remove todas as tags, degradando para texto puro até a hidratação.
 */

import DOMPurify from 'dompurify';

export interface SanitizeOptions {
    /** Tags permitidas (default: perfil HTML seguro do DOMPurify). */
    allowedTags?: string[];
    /** Atributos permitidos (default: perfil HTML seguro do DOMPurify). */
    allowedAttributes?: string[];
}

/** Fail-closed para SSR/sem DOM: remove todas as tags, preservando só o texto. */
const stripAllTags = (input: string): string => input.replace(/<[^>]*>/g, '');

/**
 * Sanitiza uma string de HTML/Markdown-renderizado, neutralizando `<script>`,
 * handlers `on*`, URLs `javascript:` e demais vetores. Retorna HTML seguro.
 */
export const sanitizeHtml = (dirty: string, options?: SanitizeOptions): string => {
    if (typeof window === 'undefined' || !DOMPurify.isSupported) {
        return stripAllTags(dirty);
    }

    const config: DOMPurify.Config = { USE_PROFILES: { html: true } };
    if (options?.allowedTags) config.ALLOWED_TAGS = options.allowedTags;
    if (options?.allowedAttributes) config.ALLOWED_ATTR = options.allowedAttributes;

    return DOMPurify.sanitize(dirty, config) as string;
};
