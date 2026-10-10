import type { ReactElement } from 'react';
import { SarakDataErrorNotice } from './SarakDataErrorNotice';

interface SarakTableErrorStateProps {
    containerClassName?: string;
    error: string;
    onRetry?: () => void;
}

export const SarakTableErrorState = ({ containerClassName, error, onRetry }: SarakTableErrorStateProps): ReactElement => {
    return (
        <div className={containerClassName} style={{ padding: 'var(--sarak-layout-gap-md,16px)' }}>
            <SarakDataErrorNotice error={error} onRetry={onRetry} />
        </div>
    );
};
