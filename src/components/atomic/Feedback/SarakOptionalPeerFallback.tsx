import { useEffect, useRef } from 'react';
import type React from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

interface SarakOptionalPeerFallbackProps {
    component: string;
    packages: readonly string[];
}

export function SarakOptionalPeerFallback({ component, packages }: SarakOptionalPeerFallbackProps): React.ReactElement {
    const text = useLibraryText();
    const warned = useRef(false);
    const packageList = packages.join(', ');
    const message = text('optionalPeerMissing', { component, packages: packageList });

    useEffect(() => {
        if (warned.current) return;
        warned.current = true;
        console.warn(`[${component}] ${message}`);
    });

    return <div role="alert" data-sarak-optional-peer-missing="true">{message}</div>;
}
