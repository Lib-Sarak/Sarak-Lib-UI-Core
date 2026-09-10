import React from 'react';
import { ShellThemeToggle } from '../../atomic/Navigation/ShellThemeToggle';
import { ShellUserWidget } from '../../atomic/Navigation/ShellUserWidget';
import type { ShellUser } from '../../../core/Shell/Components/types';

export interface ChromeUserThemeGroupProps {
    showThemeToggle: boolean;
    showUser: boolean;
    user?: ShellUser;
    logout?: () => void;
    variant: 'horizontal' | 'vertical' | 'mini';
    className?: string;
}

/**
 * Agrupa dois widgets default do cromo apresentacional — alternância de tema e widget
 * de usuário — cada um desligável isolado pelo próprio opt-out. Nenhum dos dois tem
 * slot próprio no contrato de regiões (`ChromeSlots.tsx`); por isso nasce fora dele,
 * com o marcador `data-sarak-widget` (não `data-sarak-slot` — não é conteúdo do
 * consumidor, é default da lib).
 */
export const ChromeUserThemeGroup: React.FC<ChromeUserThemeGroupProps> = ({
    showThemeToggle, showUser, user, logout, variant, className = '',
}) => {
    if (!showThemeToggle && !showUser) return null;
    return (
        <div data-sarak-widget="user-theme" className={className}>
            {showThemeToggle && <ShellThemeToggle variant={variant} />}
            {showUser && <ShellUserWidget user={user} logout={logout} variant={variant} />}
        </div>
    );
};

export default ChromeUserThemeGroup;
