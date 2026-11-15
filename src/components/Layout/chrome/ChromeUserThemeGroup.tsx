import React from 'react';
import { SarakShellThemeToggle } from '../../atomic/Navigation/SarakShellThemeToggle';
import { SarakShellUserWidget } from '../../atomic/Navigation/SarakShellUserWidget';
import { SarakIcon } from '../../atomic/Icon/SarakIcon';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import type { SarakShellUser } from '../../atomic/Navigation/SarakShellUserWidget';
import { ChromeUnavailableWidget } from './ChromeUnavailableWidget';
import { VERTICAL_NAV_GAP, VERTICAL_NAV_PADDING } from '../../atomic/Navigation/menuItemMetrics';

export interface ChromeUserThemeGroupProps {
    showThemeToggle: boolean;
    showUser: boolean;
    user?: SarakShellUser;
    logout?: () => void;
    variant: 'horizontal' | 'vertical' | 'mini';
    className?: string;
}

export interface ChromeUserWidgetProps {
    user?: SarakShellUser;
    logout?: () => void;
    variant: 'horizontal' | 'vertical' | 'mini';
}

export const ChromeUserWidget: React.FC<ChromeUserWidgetProps> = (
    { user, logout, variant }: ChromeUserWidgetProps,
): React.ReactElement => {
    const t = useLibraryText();
    if (!user || !logout) {
        const unavailable = (
            <ChromeUnavailableWidget
                label={t('chromeUserUnavailableLabel')}
                icon={<SarakIcon name="User" size={16} />}
                variant={variant}
            />
        );
        // Na lateral a linha apagada fica na coluna dos itens da lista, como as outras linhas do rodapé.
        return variant === 'horizontal' ? unavailable : (
            <div style={{ paddingInline: VERTICAL_NAV_PADDING, paddingBlock: VERTICAL_NAV_GAP }}>{unavailable}</div>
        );
    }
    return <SarakShellUserWidget user={user} logout={logout} variant={variant} />;
};

/**
 * Agrupa dois widgets default do cromo apresentacional — alternância de tema e widget
 * de usuário — cada um desligável isolado pelo próprio opt-out. Nenhum dos dois tem
 * slot próprio no contrato de regiões (`ChromeSlots.tsx`); por isso nasce fora dele,
 * com o marcador `data-sarak-widget` (não `data-sarak-slot` — não é conteúdo do
 * consumidor, é default da lib).
 */
export const ChromeUserThemeGroup: React.FC<ChromeUserThemeGroupProps> = (
    { showThemeToggle, showUser, user, logout, variant, className = '' }: ChromeUserThemeGroupProps,
): React.ReactElement | null => {
    if (!showThemeToggle && !showUser) return null;
    return (
        <div data-sarak-widget="user-theme" className={className}>
            {showThemeToggle && <SarakShellThemeToggle variant={variant} />}
            {showUser && <ChromeUserWidget user={user} logout={logout} variant={variant} />}
        </div>
    );
};

export default ChromeUserThemeGroup;
