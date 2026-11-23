import React, { useState } from 'react';
import { SarakIcon } from '../Icon/SarakIcon';
import { motion } from 'framer-motion';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { useNavigationAppearance, type UserAvatarStyle } from '../../../core/Provider/useNavigationAppearance';
import { verticalMenuItemInset } from './menuItemMetrics';

/** Identidade do usuário exibida pelo widget do cromo. */
export interface SarakShellUser {
    name: string;
    role?: string;
    avatarUrl?: string;
    email?: string;
}

/** O botão de sair: a tinta do erro (a variante `-bg` que o motor emite, 15%), o texto misturado ao de maior contraste (o par é `mix:` em `contrast-pairs.ts`) e sólido no hover. A barra contrastante entrega a cor já calculada em `--sarak-shell-logout-text-color`, sem tocar a cor de erro que pinta o fundo sólido do hover. O prefixo `color:` é obrigatório: sem ele o `tailwind-merge` lê o `%` do `color-mix` como tamanho de fonte, não remove a cor do fantasma e apaga o `text-xs`. */
const LOGOUT_TINT = 'bg-[var(--theme-error-bg,rgba(239,68,68,0.15))]';
const LOGOUT_TEXT = 'text-[color:var(--sarak-shell-logout-text-color,color-mix(in_srgb,var(--sarak-status-error-color,#ef4444)_40%,var(--sarak-on-surface,#ffffff)))]';
const LOGOUT_BORDER = 'border-[var(--theme-error-border,rgba(239,68,68,0.25))]';
const LOGOUT_HOVER_TINT = 'hover:bg-[var(--theme-error-bg,rgba(239,68,68,0.15))]';
const LOGOUT_HOVER_TEXT = 'hover:text-[color:var(--sarak-shell-logout-text-color,color-mix(in_srgb,var(--sarak-status-error-color,#ef4444)_40%,var(--sarak-on-surface,#ffffff)))]';
const LOGOUT_HOVER_SOLID = 'hover:bg-[var(--sarak-status-error-color,#ef4444)] hover:text-[var(--sarak-on-error,#020617)]';

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

/**
 * A faixa do usuário na lateral: linha em cima na cor da borda da barra e fundo levemente tingido (um véu da cor do
 * marcador), sempre com a mesma anatomia. O recuo lateral leva o avatar à coluna dos ícones da lista.
 */
// sarak-allow-hardcode: o véu de 5% é o mesmo do brilho do item ativo; nenhum token o declara.
const USER_STRIP_TINT = 'color-mix(in srgb, var(--sarak-nav-marker-color, var(--theme-primary)) 5%, transparent)';
const USER_STRIP_LINE = 'var(--sarak-border-width, 1px) solid var(--sarak-sidebar-border-color, var(--border-color, rgba(255,255,255,0.09)))';

const SarakShellUserAvatar = ({ name, avatarUrl, avatarStyle }: { name: string; avatarUrl?: string; avatarStyle: UserAvatarStyle }): React.ReactElement => {
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
                avatarStyle === 'icon'
                    ? <SarakIcon name="User" size={16} className="relative z-10" />
                    : <span data-sarak-avatar-initials="true" className="relative z-10 text-xs font-bold">{getUserInitials(name)}</span>
            )}
        </div>
    );
};

export const SarakShellUserWidget: React.FC<SarakShellUserWidgetProps> = ({
    user, logout, variant = 'vertical'
}) => {
    const t = useLibraryText();
    const { sidebarItemDensity, userAvatarStyle } = useNavigationAppearance();
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
                        <span className="text-[var(--sarak-type-scale-micro,11px)] text-[var(--sarak-subtitle-color,var(--theme-subtitle,#f2f6fb))] font-bold tracking-[var(--sarak-tracking-tight,0.2em)]">
                            {user.role}
                        </span>
                    )}
                </div>

                <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    <SarakShellUserAvatar name={displayName} avatarUrl={user?.avatarUrl} avatarStyle={userAvatarStyle} />

                    {logout && (
                        <SarakIconButton
                            onClick={logout}
                            variant="ghost"
                            size="xs"
                            className={`${LOGOUT_TINT} ${LOGOUT_HOVER_SOLID} ${LOGOUT_TEXT} rounded-lg border ${LOGOUT_BORDER}`}
                            title={t('userLogoutTitle')}
                            icon={<SarakIcon name="LogOut" size={12} />}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Vertical / Sidebar Variant: o nome em cima, mais forte; embaixo o papel pequeno, em caixa alta, com o escudo; sair à direita.
    // Recolhida (`mini`), o avatar e o botão de sair ficam um por linha, centrados no eixo dos ícones da lista.
    return (
        <div
            data-sarak-user-strip="true"
            className={`relative z-20 flex items-center ${isMini ? 'justify-center' : 'justify-between'}`}
            style={{
                flexDirection: isMini ? 'column' : 'row',
                borderTop: USER_STRIP_LINE,
                background: USER_STRIP_TINT,
                paddingBlock: 'var(--sarak-layout-gap-sm, 8px)',
                paddingInline: isMini ? undefined : verticalMenuItemInset(sidebarItemDensity),
                gap: 'var(--sarak-layout-gap-sm, 8px)',
            }}
        >
            <div className="flex min-w-0 items-center" style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 1.5)' }}>
                <SarakShellUserAvatar name={displayName} avatarUrl={user?.avatarUrl} avatarStyle={userAvatarStyle} />

                {isMini && (
                    <span className="sr-only">{user?.role ? `${displayName}, ${user.role}` : displayName}</span>
                )}

                {!isMini && (
                    <div className="flex min-w-0 overflow-hidden" style={{ flexDirection: 'column' }}>
                        <span data-sarak-user-name="true" className="text-sm font-bold text-[var(--sarak-sidebar-item-hover-text-color,var(--theme-title))] leading-tight truncate">
                            {displayName}
                        </span>
                        {user?.role && (
                            <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.75)' }}>
                                <SarakIcon name="Shield" size={8} className="shrink-0 text-[var(--sarak-nav-active-color,var(--theme-primary))]" />
                                <span data-sarak-user-role="true" className="text-2xs font-black uppercase tracking-widest text-[var(--sarak-sidebar-item-text-color,var(--theme-muted))] truncate">
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
                    className={`shrink-0 text-[var(--theme-muted)] ${LOGOUT_HOVER_TEXT} ${LOGOUT_HOVER_TINT} ${isMini ? `${LOGOUT_TINT} ${LOGOUT_TEXT}` : ''}`}
                    title={t('userLogoutTitle')}
                    icon={<SarakIcon name="LogOut" size={isMini ? 12 : 14} />}
                />
            )}
        </div>
    );
};

export default SarakShellUserWidget;
