interface JsdomError {
    message: string;
}

type JsdomErrorListener = (error: JsdomError) => void;

const FILTERED_VIRTUAL_CONSOLE = Symbol('sarakStylesheetWarningFiltered');

interface JsdomVirtualConsole {
    [FILTERED_VIRTUAL_CONSOLE]?: boolean;
    rawListeners: (eventName: string) => JsdomErrorListener[];
    removeAllListeners: (eventName: string) => JsdomVirtualConsole;
    on: (eventName: string, listener: JsdomErrorListener) => JsdomVirtualConsole;
}

interface JsdomWindow extends Window {
    _virtualConsole?: JsdomVirtualConsole;
}

const isStylesheetParseWarning = (error: JsdomError): boolean =>
    error.message.includes('Could not parse CSS stylesheet');

const installStylesheetWarningFilter = (target: Window): void => {
    // Vitest's onConsoleLog cannot see jsdom's VirtualConsole errors.
    const virtualConsole = (target as JsdomWindow)._virtualConsole;
    if (!virtualConsole || virtualConsole[FILTERED_VIRTUAL_CONSOLE]) return;

    const existingListeners = virtualConsole.rawListeners('jsdomError');
    if (existingListeners.length === 0) return;

    virtualConsole.removeAllListeners('jsdomError');
    existingListeners.forEach((listener) => {
        virtualConsole.on('jsdomError', (error) => {
            if (!isStylesheetParseWarning(error)) listener(error);
        });
    });
    Object.defineProperty(virtualConsole, FILTERED_VIRTUAL_CONSOLE, { value: true });
};

export const installSarakTestEnvironment = (
    target: Window | undefined = typeof window === 'undefined' ? undefined : window,
): void => {
    if (!target) return;

    installStylesheetWarningFilter(target);
    if (typeof target.matchMedia === 'function') return;

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
