import React, { useState } from 'react';
import { SarakIcon } from '../Icon/SarakIcon';
import { motion } from 'framer-motion';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakIconButton } from '../Buttons/SarakIconButton';

/** Identidade do usuário exibida pelo widget do cromo. */
export interface SarakShellUser {
    name: string;
    role?: string;
    avatarUrl?: string;
    email?: string;
}

export interface SarakShellUserWidgetProps {
    /** Fornece a identidade genérica do usuário; omitido, exibe o rótulo genérico. */
    user?: SarakShellUser;
    /** Executa o encerramento de sessão e habilita o botão de sair; omitida, esse botão não é renderizado. */
    logout?: () => void;
    /** Ajusta o arranjo à barra, à lateral ou ao modo compacto; omitida, usa `vertical`. */
    variant?: 'horizontal' | 'vertical' | 'mini';
}

/**
 * ShellUserWidget — Sovereign User Identity Component (v8.5)
 * Unifies profile display and logout actions across all Shell layouts.
 */
const isSafeAvatarUrl = (avatarUrl?: string): boolean => {
    if (!avatarUrl?.trim()) return false;
    try {
        const protocol = new URL(avatarUrl, 'https://sarak-avatar.invalid/').protocol;
        return protocol === 'http:' || protocol === 'https:';
    } catch {
        return false;
    }
};

const getUserInitials = (name: string): string => name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toLocaleUpperCase();

const SarakShellUserAvatar = ({ name, avatarUrl }: { name: string; avatarUrl?: string }): React.ReactElement => {
    const [failedAvatarUrl, setFailedAvatarUrl] = useState<string>();
    const showAvatar = isSafeAvatarUrl(avatarUrl) && failedAvatarUrl !== avatarUrl;

    return (
        <div aria-hidden="true" className="relative w-9 h-9 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)] overflow-hidden">
            {showAvatar ? (
                <img
                    src={avatarUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={() => setFailedAvatarUrl(avatarUrl)}
                />
            ) : (
                <span className="relative z-10 text-xs font-bold">{getUserInitials(name)}</span>
            )}
        </div>
    );
};

export const SarakShellUserWidget: React.FC<SarakShellUserWidgetProps> = ({
    user, logout, variant = 'vertical'
}) => {
    const t = useLibraryText();
    const isHorizontal = variant === 'horizontal';
    const isMini = variant === 'mini';
    const displayName = user?.name || t('genericUserLabel');

    if (isHorizontal) {
        return (
            <div
                className="flex items-center ml-auto border-l border-[var(--theme-border)]"
                style={{ gap: 'var(--sarak-layout-gap-md, 16px)', paddingLeft: 'var(--sarak-layout-gap-lg, 24px)' }}
            >
                <div className="flex items-end" style={{ flexDirection: 'column' }}>
                    <span className="text-2xs font-black text-[var(--theme-title)] uppercase tracking-widest leading-tight">
                        {displayName}
                    </span>
                    {user?.role && (
                        <span className="text-[var(--sarak-type-scale-micro,7px)] text-[var(--theme-primary)] font-bold tracking-[var(--sarak-tracking-tight,0.2em)]">
                            {user.role}
                        </span>
                    )}
                </div>

                <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    <SarakShellUserAvatar name={displayName} avatarUrl={user?.avatarUrl} />

                    {logout && (
                        <SarakIconButton
                            onClick={logout}
                            variant="ghost"
                            size="xs"
                            className="bg-[var(--theme-error-bg)] hover:bg-[var(--theme-error)] text-[var(--theme-error)] hover:text-[var(--theme-on-primary)] rounded-lg border border-[var(--theme-error-border)]"
                            title={t('userLogoutTitle')}
                            icon={<SarakIcon name="LogOut" size={12} />}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Vertical / Sidebar Variant
    return (
        <div
            className={`border-t border-[var(--theme-border)] bg-[var(--theme-card)]/50 relative z-20 ${isMini ? 'flex justify-center' : ''}`}
            style={{ padding: 'var(--sarak-layout-gap-md, 16px)' }}
        >
            <div
                className={`flex items-center group ${isMini ? '' : 'justify-between w-full'}`}
                style={isMini ? { flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 1.5)' } : undefined}
            >
                <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 1.5)', flexDirection: isMini ? 'column' : 'row' }}>
                    <SarakShellUserAvatar name={displayName} avatarUrl={user?.avatarUrl} />

                    {isMini && (
                        <span className="sr-only">{user?.role ? `${displayName}, ${user.role}` : displayName}</span>
                    )}

                    {!isMini && (
                        <div className="flex overflow-hidden" style={{ flexDirection: 'column' }}>
                            <span className="text-xs font-bold text-[var(--theme-title)]/90 leading-tight truncate">
                                {displayName}
                            </span>
                            {user?.role && (
                                <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.75)' }}>
                                    <SarakIcon name="Shield" size={8} className="text-[var(--theme-primary)]" />
                                    <span className="text-[var(--sarak-type-scale-tiny,8px)] text-[var(--theme-muted)] font-black">
                                        {user.role}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {logout && (
                    <SarakIconButton
                        onClick={logout}
                        variant="ghost"
                        size="xs"
                        className={`text-[var(--theme-muted)] hover:text-[var(--theme-error)] hover:bg-[var(--theme-error-bg)] ${isMini ? 'bg-[var(--theme-error-bg)] text-[var(--theme-error)]' : ''}`}
                        title={t('userLogoutTitle')}
                        icon={<SarakIcon name="LogOut" size={isMini ? 12 : 14} />}
                    />
                )}
            </div>
        </div>
    );
};

export default SarakShellUserWidget;
