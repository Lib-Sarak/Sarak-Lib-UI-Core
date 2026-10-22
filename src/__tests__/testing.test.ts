import { afterEach, describe, expect, it, vi } from 'vitest';
import { filterSarakTestConsoleLog, installSarakTestEnvironment } from '../testing';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
    if (originalMatchMedia) {
        Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: originalMatchMedia });
    } else {
        Reflect.deleteProperty(window, 'matchMedia');
    }
});

describe('Sarak test setup helpers', () => {
    it('installs a minimal matchMedia only when the environment lacks one', () => {
        Reflect.deleteProperty(window, 'matchMedia');

        installSarakTestEnvironment();

        const media = window.matchMedia('(min-width: 700px)');
        expect(media.media).toBe('(min-width: 700px)');
        expect(media.matches).toBe(false);
        expect(media.dispatchEvent(new Event('change'))).toBe(false);
    });

    it('preserves an existing matchMedia implementation', () => {
        const existing = vi.fn();
        Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: existing });

        installSarakTestEnvironment();

        expect(window.matchMedia).toBe(existing);
    });

    it('filters only the jsdom stylesheet parser warning', () => {
        expect(filterSarakTestConsoleLog('Error: Could not parse CSS stylesheet')).toBe(false);
        expect(filterSarakTestConsoleLog('Error: network request failed')).toBeUndefined();
    });
});
