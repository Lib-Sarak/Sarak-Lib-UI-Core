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
                <span aria-hidden="true" className="absolute -right-2 -top-1 text-[var(--sarak-type-scale-tiny,8px)]">
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
}

const ChromeNotificationMenu: React.FC<ChromeNotificationMenuProps> = (
    { notifications, onSelect, onClose, label }: ChromeNotificationMenuProps,
): React.ReactElement => (
    <div role="menu" aria-label={label} className="absolute right-0 top-full z-[1000] min-w-56 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-2 shadow-xl">
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
    return (
        <div className="relative" data-sarak-widget="notifications">
            <ChromeNotificationsButton
                isOpen={isOpen}
                notificationCount={notifications.length}
                onToggle={() => setIsOpen((open) => !open)}
                label={label}
            />
            {isOpen && (
                <ChromeNotificationMenu
                    notifications={notifications}
                    onSelect={onSelect}
                    onClose={() => setIsOpen(false)}
                    label={label}
                />
            )}
        </div>
    );
};
