export { createSarakKitMock, renderWithSarak } from './shared/testing/sarakTestKit';
export type { SarakRenderOptions, SarakRenderProviderProps } from './shared/testing/sarakTestKit';

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

/** Textos que `filterSarakTestConsoleLog` descarta: o jsdom não carrega CSS, e o diagnóstico do modo app dispara sempre. */
const FILTERED_LOG_FRAGMENTS = ['Could not parse CSS stylesheet', '[Sarak] CSS não detectado'];

/**
 * Para o `onConsoleLog` do vitest: descarta o aviso de CSS do jsdom e o "[Sarak] CSS não detectado" do modo app.
 * O aviso do modo embarcado ("CSS escopado não detectado") e qualquer outro log continuam passando.
 */
export const filterSarakTestConsoleLog = (log: string): false | undefined =>
    FILTERED_LOG_FRAGMENTS.some((fragment) => log.includes(fragment)) ? false : undefined;
