import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { sarakIsSafeLinkHref, shouldHandleSameTabNavigation } from './linkNavigation';

export { sarakIsSafeLinkHref } from './linkNavigation';

export interface SarakLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel' | 'onClick'> {
    /** Destino do link. Esquemas perigosos (`javascript:`, `data:`, ...) são bloqueados. */
    href: string;
    /** Abre em nova aba com `rel="noopener noreferrer"` + indicação visual/a11y. */
    external?: boolean;
    /** Contexto de navegação nativo; fora de `_self`, o navegador mantém o comportamento. */
    target?: string;
    rel?: string;
    /** Intercepta apenas clique primário simples destinado à aba atual. */
    onNavigate?: (href: string) => void;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    children: React.ReactNode;
}

/**
 * Componente Atômico: SarakLink
 * Âncora acessível por tokens: anel de foco real (`--sarak-focus-width`), `href`
 * validado por allow-list de esquema, e marcação de link externo (`target="_blank"`
 * + `rel="noopener noreferrer"` + ícone/texto para leitor de tela).
 */
export const SarakLink: React.FC<SarakLinkProps> = ({
    href,
    external = false,
    target,
    rel,
    onNavigate,
    children,
    className = '',
    style,
    onClick,
    ...props
}) => {
    const t = useLibraryText();
    const safe = sarakIsSafeLinkHref(href);
    const effectiveTarget = target ?? (external ? '_blank' : undefined);
    const effectiveRel = effectiveTarget !== undefined && effectiveTarget !== '_self'
        ? Array.from(new Set([...(rel ?? '').split(/\s+/).filter(Boolean), 'noopener', 'noreferrer'])).join(' ')
        : rel;

    if (!safe) {
        console.warn(`[Sarak:Link] href com esquema não permitido — descartado: "${href}"`);
    }

    const dynamicStyle: React.CSSProperties = {
        ...style,
        gap: 'var(--sarak-layout-gap-sm, 8px)',
        outlineColor: 'var(--sarak-primary-color, #3b82f6)',
        outlineWidth: 'var(--sarak-focus-width, 2px)',
    };

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
        onClick?.(event);
        if (!safe || !onNavigate || !shouldHandleSameTabNavigation(event, effectiveTarget)) return;
        event.preventDefault();
        onNavigate(href);
    };

    return (
        <a
            {...props}
            href={safe ? href : undefined}
            aria-disabled={safe ? undefined : true}
            target={effectiveTarget}
            rel={effectiveRel}
            className={`inline-flex items-center text-[var(--sarak-primary-color,#3b82f6)] underline-offset-2 hover:underline hover:brightness-110 transition-colors outline-none focus-visible:outline rounded-sm ${className}`}
            style={dynamicStyle}
            onClick={handleClick}
        >
            {children}
            {external && (
                <>
                    <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
                    <span className="sr-only">{t('linkExternalHint')}</span>
                </>
            )}
        </a>
    );
};

export default SarakLink;
