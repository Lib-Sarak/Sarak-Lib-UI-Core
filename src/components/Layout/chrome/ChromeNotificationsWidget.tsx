import React, { useState } from 'react';
import { SarakIcon } from '../../atomic/Icon/SarakIcon';
import { SarakIconButton } from '../../atomic/Buttons/SarakIconButton';
import { SarakMenuItem } from '../../atomic/Navigation/SarakMenuItem';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { ChromeUnavailableWidget } from './ChromeUnavailableWidget';

export interface SarakChromeNotification {
    id: string;
    label: string;
    description?: string;
}

export interface ChromeNotificationsWidgetProps {
    notifications?: readonly SarakChromeNotification[];
    onSelect?: (notification: SarakChromeNotification) => void;
    variant: 'horizontal' | 'vertical' | 'mini';
}

interface ChromeNotificationsButtonProps {
    isOpen: boolean;
    notificationCount: number;
    onToggle: () => void;
    label: string;
}

const ChromeNotificationsButton: React.FC<ChromeNotificationsButtonProps> = ({
    isOpen,
    notificationCount,
    onToggle,
    label,
}: ChromeNotificationsButtonProps): React.ReactElement => (
    <SarakIconButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        icon={(
            <span className="relative inline-flex">
                <SarakIcon name="Bell" size={16} />
                <span aria-hidden="true" className="absolute -right-2 -top-1 text-[var(--sarak-type-scale-tiny,11px)]">
                    {notificationCount}
                </span>
            </span>
        )}
    />
);

interface ChromeNotificationMenuProps {
    notifications: readonly SarakChromeNotification[];
    onSelect: (notification: SarakChromeNotification) => void;
    onClose: () => void;
    label: string;
    /** Na lateral a linha fica no pé da barra: a lista abre para cima e alinhada à esquerda. */
    opensUpward?: boolean;
}

const ChromeNotificationMenu: React.FC<ChromeNotificationMenuProps> = (
    { notifications, onSelect, onClose, label, opensUpward }: ChromeNotificationMenuProps,
): React.ReactElement => (
    <div role="menu" aria-label={label} className={`absolute z-[calc(var(--sarak-z-sidebar,500)_+_100)] min-w-56 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-2 shadow-xl ${opensUpward ? 'left-0 bottom-full' : 'right-0 top-full'}`}>
        {notifications.map((notification) => (
            <SarakMenuItem
                key={notification.id}
                label={notification.label}
                onClick={() => {
                    onSelect(notification);
                    onClose();
                }}
            >
                {notification.description}
            </SarakMenuItem>
        ))}
    </div>
);

interface ChromeNotificationRowProps {
    collapsed: boolean;
    notificationCount: number;
    isOpen: boolean;
    onToggle: () => void;
    label: string;
}

/**
 * A linha da lateral, com a métrica do item de menu: o ícone, o rótulo e, à direita, o contador. Recolhida, é só o ícone
 * centrado no eixo da lista, e o aviso é um ponto aceso fora do fluxo, que não desloca o ícone.
 */
/** O ponto da barra recolhida: no canto de cima à direita do ícone (centrado na linha), fora do desenho do sino. */
const NOTIFICATION_DOT_SIZE = 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)';
const NOTIFICATION_DOT_STYLE: React.CSSProperties = {
    width: NOTIFICATION_DOT_SIZE,
    height: NOTIFICATION_DOT_SIZE,
    left: `calc(50% + var(--sarak-sidebar-icon-size, 18px) / 2 - ${NOTIFICATION_DOT_SIZE} / 2)`,
    top: `calc(50% - var(--sarak-sidebar-icon-size, 18px) / 2 - ${NOTIFICATION_DOT_SIZE} / 2)`,
};

const ChromeNotificationRow: React.FC<ChromeNotificationRowProps> = ({
    collapsed, notificationCount, isOpen, onToggle, label,
}: ChromeNotificationRowProps): React.ReactElement => (
    <>
        <SarakMenuItem
            icon="Bell"
            label={label}
            collapsed={collapsed}
            onClick={onToggle}
            aria-haspopup="menu"
            aria-expanded={isOpen}
        >
            {!collapsed && (
                <span data-sarak-row-indicator="true" className="shrink-0 text-2xs font-bold text-[var(--sarak-nav-active-color,var(--theme-primary))]">
                    {notificationCount}
                </span>
            )}
        </SarakMenuItem>
        {collapsed && notificationCount > 0 && (
            <span
                aria-hidden="true"
                data-sarak-row-indicator="true"
                className="pointer-events-none absolute rounded-full bg-[var(--sarak-nav-active-color,var(--theme-primary))]"
                style={NOTIFICATION_DOT_STYLE}
            />
        )}
    </>
);

export const ChromeNotificationsWidget: React.FC<ChromeNotificationsWidgetProps> = ({
    notifications = [],
    onSelect,
    variant,
}: ChromeNotificationsWidgetProps): React.ReactElement => {
    const [isOpen, setIsOpen] = useState(false);
    const t = useLibraryText();
    if (notifications.length === 0 || !onSelect) {
        return (
            <ChromeUnavailableWidget
                label={t('chromeNotificationsUnavailableLabel')}
                icon={<SarakIcon name="Bell" size={16} />}
                variant={variant}
            />
        );
    }

    const label = t('sidebarNotificationsLabel');
    const isRow = variant !== 'horizontal';
    const toggle = (): void => setIsOpen((open) => !open);
    return (
        <div className="relative" data-sarak-widget="notifications">
            {isRow
                ? <ChromeNotificationRow collapsed={variant === 'mini'} notificationCount={notifications.length} isOpen={isOpen} onToggle={toggle} label={label} />
                : <ChromeNotificationsButton isOpen={isOpen} notificationCount={notifications.length} onToggle={toggle} label={label} />}
            {isOpen && (
                <ChromeNotificationMenu
                    notifications={notifications}
                    onSelect={onSelect}
                    onClose={() => setIsOpen(false)}
                    label={label}
                    opensUpward={isRow}
                />
            )}
        </div>
    );
};
