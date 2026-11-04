import React__default from 'react';
import { RenderOptions, RenderResult } from '@testing-library/react';

/**
 * Props do `SarakUIProvider`, sem o tipo da lib: importá-lo aqui faz o build mover os tipos que este
 * subpath divide com o barril para um `.d.ts` compartilhado, e `dist/index.d.ts` deixa de declará-los.
 */
interface SarakRenderProviderProps extends Record<string, unknown> {
    options?: Record<string, unknown>;
}
interface SarakRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Props do `SarakUIProvider`; `options.fonts` nasce `'none'`, para o teste não carregar fonte. */
    provider?: SarakRenderProviderProps;
}
/** Renderiza dentro do `SarakUIProvider`. É assíncrona: a lib só carrega quando o teste pede. */
declare const renderWithSarak: (ui: React__default.ReactElement, { provider, ...renderOptions }?: SarakRenderOptions) => Promise<RenderResult>;
/**
 * A lib real com os dublês dos três componentes que não rodam no jsdom. Para o `vi.mock` do
 * consumidor: `vi.mock('@sarak/lib-ui-core', () => createSarakKitMock())`. `overrides`
 * troca ou acrescenta qualquer nome, inclusive os dublês.
 */
declare const createSarakKitMock: (overrides?: Record<string, unknown>) => Promise<Record<string, unknown>>;

declare const installSarakTestEnvironment: (target?: Window | undefined) => void;
declare const filterSarakTestConsoleLog: (log: string) => false | undefined;

export { type SarakRenderOptions, type SarakRenderProviderProps, createSarakKitMock, filterSarakTestConsoleLog, installSarakTestEnvironment, renderWithSarak };
