import React from 'react';
import { useLibraryText, type LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useSystemFormat, type SarakSystemTimestamp } from './hooks/useSystemFormat';
import { SYSTEM_TONE_COLOR, SYSTEM_TONE_SHAPE, type SarakSystemTone } from './systemTone';

export type SarakLiveStatusState = 'connected' | 'reconnecting' | 'offline';

export interface SarakLiveStatusProps {
    status: SarakLiveStatusState;
    /** Nome da conexão mostrado antes do estado: "API", "Tempo real". */
    label?: string;
    /** Quando chegou o último dado; a lib não abre conexão nem mede o tempo. */
    lastDataAt?: SarakSystemTimestamp | null;
    /** Com ele, offline oferece "Tentar agora". */
    onRetry?: () => void;
    className?: string;
}

const STATE_PRESENTATION: Record<SarakLiveStatusState, { tone: SarakSystemTone; label: Parameters<LibraryTextFn>[0] }> = {
    connected: { tone: 'success', label: 'liveConnected' },
    reconnecting: { tone: 'warning', label: 'liveReconnecting' },
    offline: { tone: 'error', label: 'liveOffline' },
};

/** Estado de uma conexão ao vivo: conectado, reconectando ou offline, com o último dado. A forma e a palavra acompanham a cor. */
export const SarakLiveStatus = ({ status, label, lastDataAt, onRetry, className }: SarakLiveStatusProps): React.ReactElement => {
    const text = useLibraryText();
    const format = useSystemFormat();
    const presentation = STATE_PRESENTATION[status];
    const lastData = lastDataAt !== undefined && lastDataAt !== null ? format.dateTime(lastDataAt) : '';

    return (
        <SarakFlex role="status" aria-live="polite" data-live-status={status} align="center" gap="spacing-sm" className={mergeSarakClasses('sarak-live-status', className)}>
            <span style={{ color: SYSTEM_TONE_COLOR[presentation.tone], fontWeight: 'bold' }}>
                <span aria-hidden="true">{SYSTEM_TONE_SHAPE[presentation.tone]} </span>
                {label ? `${label}: ` : ''}{text(presentation.label)}
            </span>
            <span className="text-theme-muted">{lastData ? text('liveLastData', { time: lastData }) : text('liveNoData')}</span>
            {onRetry && status === 'offline' && <SarakButton type="button" size="sm" variant="outline" onClick={onRetry}>{text('liveRetry')}</SarakButton>}
        </SarakFlex>
    );
};
