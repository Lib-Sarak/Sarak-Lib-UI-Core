import React from 'react';
import { ExternalLink } from 'lucide-react';

/** Esquemas de URL aceitos (allow-list — mais seguro que bloquear caso a caso). */
const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/** Remove caracteres de controle ASCII (tab/LF/CR/DEL) — navegadores os ignoram ao
 * resolver o esquema de uma URL, vetor de ofuscação clássico (`java` + TAB + `script:`).
 * Filtra por código de caractere (sem classe de regex de controle) para evitar
 * ambiguidade de escape. */
const stripControlChars = (value: string): string =>
    value
        .split('')
        .filter((char) => {
            const code = char.charCodeAt(0);
            return code > 31 && code !== 127;
        })
        .join('');

/**
 * Valida o esquema de um `href` de link contra uma allow-list (`http(s):`,
 * `mailto:`, `tel:`, caminhos relativos/âncora). Bloqueia `javascript:`, `data:`
 * e qualquer outro esquema executável — vetor clássico de XSS via link.
 */
export const isSafeLinkHref = (href: string): boolean => {
    const trimmed = (href ?? '').trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('?')) {
        return true;
    }
    const withoutControlChars = stripControlChars(trimmed);
    try {
        const url = new URL(withoutControlChars, 'https://sarak-link.invalid/');
        return SAFE_LINK_PROTOCOLS.has(url.protocol);
    } catch {
        return false;
    }
};

export interface SarakLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> {
    /** Destino do link. Esquemas perigosos (`javascript:`, `data:`, ...) são bloqueados. */
    href: string;
    /** Abre em nova aba com `rel="noreferrer noopener"` + indicação visual/a11y. */
    external?: boolean;
    children: React.ReactNode;
}

/**
 * Componente Atômico: SarakLink
 * Âncora acessível por tokens: anel de foco real (`--sarak-focus-width`), `href`
 * validado por allow-list de esquema, e marcação de link externo (`target="_blank"`
 * + `rel="noreferrer noopener"` + ícone/texto para leitor de tela).
 */
export const SarakLink: React.FC<SarakLinkProps> = ({
    href,
    external = false,
    children,
    className = '',
    style,
    ...props
}) => {
    const safe = isSafeLinkHref(href);

    if (!safe) {
        console.warn(`[Sarak:Link] href com esquema não permitido — descartado: "${href}"`);
    }

    const dynamicStyle: React.CSSProperties = {
        ...style,
        gap: 'var(--sarak-layout-gap-sm, 8px)',
        outlineColor: 'var(--sarak-primary-color, #3b82f6)',
        outlineWidth: 'var(--sarak-focus-width, 2px)',
    };

    return (
        <a
            {...props}
            href={safe ? href : undefined}
            aria-disabled={safe ? undefined : true}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer noopener' : undefined}
            className={`inline-flex items-center text-[var(--sarak-primary-color,#3b82f6)] underline-offset-2 hover:underline hover:brightness-110 transition-colors outline-none focus-visible:outline rounded-sm ${className}`}
            style={dynamicStyle}
        >
            {children}
            {external && (
                <>
                    <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
                    <span className="sr-only"> (abre em nova aba)</span>
                </>
            )}
        </a>
    );
};

export default SarakLink;
