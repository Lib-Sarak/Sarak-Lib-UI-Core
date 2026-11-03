/** Tom de estado das telas de sistema. Cada tom leva cor do tema E uma forma, para nunca depender só da cor. */
export type SarakSystemTone = 'success' | 'error' | 'warning' | 'info' | 'muted';

export const SYSTEM_TONE_COLOR: Readonly<Record<SarakSystemTone, string>> = {
    success: 'var(--sarak-status-success-color, var(--theme-success))',
    error: 'var(--sarak-status-error-color, var(--theme-error))',
    warning: 'var(--sarak-status-warning-color, var(--theme-warning))',
    info: 'var(--sarak-status-info-color, var(--theme-info))',
    muted: 'var(--theme-muted)',
};

export const SYSTEM_TONE_SHAPE: Readonly<Record<SarakSystemTone, string>> = {
    success: '●',
    error: '◆',
    warning: '▲',
    info: '■',
    muted: '○',
};
