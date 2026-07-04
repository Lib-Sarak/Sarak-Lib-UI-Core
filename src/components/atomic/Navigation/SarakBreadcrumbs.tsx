import React from 'react';

/** Migalha do caminho de navegação (Spec 14, Regra 3). */
export interface BreadcrumbItem {
    /** Rótulo exibido. */
    label: string;
    /** Destino opcional (acionado via `onNavigate`, não pela URL diretamente). */
    href?: string;
    /** Ícone opcional à esquerda do rótulo. */
    icon?: React.ReactNode;
}

export interface SarakBreadcrumbsProps {
    /** Caminho do usuário, da raiz à folha. */
    items: BreadcrumbItem[];
    /** Separador entre migalhas (default: `/`). */
    separator?: React.ReactNode;
    /** Delega a navegação ao host (Spec 33, Regra 3) — não manipula a URL. */
    onNavigate?: (href: string) => void;
    className?: string;
}

/** Trilha semântica com ícones e separador customizável (Spec 14, Regra 3). */
export const SarakBreadcrumbs: React.FC<SarakBreadcrumbsProps> = ({
    items,
    separator = '/',
    onNavigate,
    className = '',
}) => (
    <nav className={`flex items-center flex-wrap text-sm ${className}`} style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }} aria-label="Trilha de navegação">
        {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const interactive = !isLast && Boolean(item.href);
            return (
                <span key={`${item.label}-${index}`} className="inline-flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    <span
                        role={interactive ? 'link' : undefined}
                        tabIndex={interactive ? 0 : undefined}
                        aria-current={isLast ? 'page' : undefined}
                        onClick={interactive ? () => onNavigate?.(item.href as string) : undefined}
                        onKeyDown={
                            interactive
                                ? (e) => {
                                      // a11y (Spec 41, Regra 3): Enter/Espaço ativam o link como o clique.
                                      if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          onNavigate?.(item.href as string);
                                      }
                                  }
                                : undefined
                        }
                        style={{ gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)' }}
                        className={`inline-flex items-center ${
                            isLast
                                ? 'text-[var(--sarak-text-main,#ffffff)] font-medium'
                                : 'text-[var(--text-muted,#94a3b8)]'
                        } ${interactive ? 'cursor-pointer hover:text-[var(--sarak-primary-color,#3b82f6)]' : ''}`}
                    >
                        {item.icon}
                        {item.label}
                    </span>
                    {!isLast && (
                        <span className="text-[var(--text-muted,#94a3b8)] select-none" aria-hidden="true">
                            {separator}
                        </span>
                    )}
                </span>
            );
        })}
    </nav>
);
