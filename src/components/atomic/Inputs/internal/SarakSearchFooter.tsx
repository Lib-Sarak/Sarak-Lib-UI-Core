import React from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

interface SarakSearchFooterProps {
    systemName?: string;
}

export const SarakSearchFooter = ({ systemName }: SarakSearchFooterProps): React.ReactElement => {
    const t = useLibraryText();

    return (
        <div className="bg-[var(--color-theme-card,#101622)]/40 border-t border-[var(--border-color,rgba(255,255,255,0.09))] flex items-center justify-between" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.75) var(--sarak-layout-gap-lg, 24px)' }}>
            <div className="flex" style={{ gap: 'var(--sarak-layout-gap-md,16px)' }}>
                <div className="flex items-center text-2xs font-bold text-[var(--text-muted,rgba(242,246,251,0.55))] uppercase tracking-widest" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.375)' }}>
                    <span className="rounded bg-[var(--color-theme-card,#101622)] border border-[var(--border-color,rgba(255,255,255,0.09))]" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.125) calc(var(--sarak-layout-gap-md,16px) * 0.375)' }}>ESC</span>
                    <span>{t('searchCloseHint')}</span>
                </div>
                <div className="flex items-center text-2xs font-bold text-[var(--text-muted,rgba(242,246,251,0.55))] uppercase tracking-widest" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.375)' }}>
                    <span className="rounded bg-[var(--color-theme-card,#101622)] border border-[var(--border-color,rgba(255,255,255,0.09))]" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.125) calc(var(--sarak-layout-gap-md,16px) * 0.375)' }}>↑↓</span>
                    <span>{t('searchNavigateHint')}</span>
                </div>
            </div>
            <span className="text-2xs font-black uppercase tracking-widest text-[var(--text-muted,rgba(242,246,251,0.55))] italic">
                {systemName ? t('searchEngineBrandedLabel', { systemName }) : t('searchEngineLabel')}
            </span>
        </div>
    );
};
