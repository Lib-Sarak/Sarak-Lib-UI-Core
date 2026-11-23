import React from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

export interface ShellNavBrandProps {
    brand: { name?: string; logoUrl?: string };
    /** Na topbar a marca é um bloco em linha; na lateral, ela ganha o vão de baixo. */
    horizontal: boolean;
}

/** A marca no topo do menu do shell: imagem e nome, cada um só quando o consumidor os passou. */
export const ShellNavBrand: React.FC<ShellNavBrandProps> = ({ brand, horizontal }) => {
    const t = useLibraryText();
    return (
        <div
            className="flex items-center shrink-0"
            style={{
                gap: 'var(--sarak-layout-gap-sm, 8px)',
                background: horizontal
                    ? 'var(--sarak-topbar-brand-bg, transparent)'
                    : 'var(--sarak-sidebar-brand-bg, transparent)',
                marginBottom: horizontal ? undefined : 'var(--sarak-layout-gap-md, 16px)',
                marginInlineEnd: horizontal ? 'var(--sarak-layout-gap-md, 16px)' : undefined,
            }}
        >
            {brand.logoUrl ? (
                <img
                    src={brand.logoUrl}
                    alt={brand.name ?? t('shellNavBrandLogoAlt')}
                    className="object-contain"
                    style={{ height: 'var(--sarak-shell-brand-logo-size, 32px)' }}
                />
            ) : null}
            {brand.name ? (
                <span
                    className="truncate"
                    style={{
                        color: horizontal
                            ? 'var(--sarak-topbar-brand-color, var(--sarak-topbar-title-color, #f2f6fb))'
                            : 'var(--sarak-sidebar-brand-color, var(--sarak-on-sidebar, #f2f6fb))',
                        fontFamily: 'var(--sarak-identity-font, var(--font-heading, var(--font-main, inherit)))',
                        fontWeight: 'var(--sarak-identity-weight, 800)',
                        letterSpacing: 'var(--sarak-identity-tracking, 0px)',
                    }}
                >
                    {brand.name}
                </span>
            ) : null}
        </div>
    );
};

export default ShellNavBrand;
