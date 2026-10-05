import type { MouseEvent as ReactMouseEvent } from 'react';

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

const stripControlChars = (value: string): string =>
    value
        .split('')
        .filter((character) => {
            const code = character.charCodeAt(0);
            return code > 31 && code !== 127;
        })
        .join('');

export const sarakIsSafeLinkHref = (href: string): boolean => {
    const trimmed = (href ?? '').trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('?')) {
        return true;
    }

    try {
        const url = new URL(stripControlChars(trimmed), 'https://sarak-link.invalid/');
        return SAFE_LINK_PROTOCOLS.has(url.protocol);
    } catch {
        return false;
    }
};

export const shouldHandleSameTabNavigation = (
    event: ReactMouseEvent<HTMLElement>,
    target?: string,
): boolean => event.button === 0
    && !event.altKey
    && !event.ctrlKey
    && !event.metaKey
    && !event.shiftKey
    && !event.defaultPrevented
    && (target === undefined || target === '_self');
