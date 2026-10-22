export const installSarakTestEnvironment = (
    target: Window | undefined = typeof window === 'undefined' ? undefined : window,
): void => {
    if (!target || typeof target.matchMedia === 'function') return;

    Object.defineProperty(target, 'matchMedia', {
        configurable: true,
        writable: true,
        value: (media: string): MediaQueryList => ({
            matches: false,
            media,
            onchange: null,
            addListener: () => undefined,
            removeListener: () => undefined,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            dispatchEvent: () => false,
        } as MediaQueryList),
    });
};

export const filterSarakTestConsoleLog = (log: string): false | undefined =>
    log.includes('Could not parse CSS stylesheet') ? false : undefined;
