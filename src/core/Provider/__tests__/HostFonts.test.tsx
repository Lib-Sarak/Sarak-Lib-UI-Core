/**
 * Fontes do host pelo Provider real: registrar faz a família ser CARREGADA (e listada no painel); não muda o que o
 * tema aceita. Uma pilha de fontes segura vale registrada ou não (o comportamento de sempre do `validateDesign`);
 * CSS cru continua recusado; e cada Provider carrega só as famílias que ELE registrou — o registro é das `options`
 * de cada Provider, não há estado de módulo que uma ilha possa preencher para a outra.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../SarakUIProvider';
import type { SarakCustomFont, SarakUIOptions } from '../types';

const islandA: SarakCustomFont[] = [{ family: 'Ilha Norte', files: [{ url: '/norte.woff2', weight: 400 }] }];
const islandB: SarakCustomFont[] = [{ family: 'Ilha Sul', files: [{ url: '/sul.woff2', weight: 400 }] }];
const NORTH_VALUE = "'Ilha Norte', sans-serif";
const SOUTH_VALUE = "'Ilha Sul', sans-serif";

const seen: Record<string, unknown> = {};
const Probe: React.FC<{ name: string }> = ({ name }) => {
    seen[name] = useSarakUI().design.headingFont;
    return null;
};

const island = (name: string, headingFont: string, options: SarakUIOptions) => (
    <SarakUIProvider config={{ headingFont }} options={{ mode: 'embedded', embedded: { injectGlobalFonts: true }, persistence: { storageKey: `host-fonts-${name}` }, ...options }}>
        <Probe name={name} />
    </SarakUIProvider>
);

const fontStyle = (family: string) =>
    Array.from(document.head.querySelectorAll('style[data-sarak-font]')).find((el) => el.getAttribute('data-sarak-font') === family);

afterEach(() => {
    document.head.querySelectorAll('style[data-sarak-font]').forEach((el) => el.remove());
    localStorage.clear();
    vi.restoreAllMocks();
});

describe('fontes do host pelo Provider', () => {
    it('registrar e usar: o tema guarda o valor e o `@font-face` da família do host vai para o `<head>`', () => {
        render(<SarakUIProvider config={{ headingFont: NORTH_VALUE }} options={{ fonts: { custom: islandA } }}><Probe name="app" /></SarakUIProvider>);
        expect(seen.app).toBe(NORTH_VALUE);
        expect(fontStyle('Ilha Norte')?.textContent).toContain('font-family: "Ilha Norte";');
        expect(fontStyle('Ilha Norte')?.textContent).toMatch(/src: url\("[^"]*\/norte\.woff2"\) format\("woff2"\);/);
    });

    it('pilha de fontes segura vale sem registro (como antes); a família não registrada não ganha `@font-face`', () => {
        render(<SarakUIProvider config={{ headingFont: 'Georgia, serif' }}><Probe name="georgia" /></SarakUIProvider>);
        expect(seen.georgia).toBe('Georgia, serif');
        render(<SarakUIProvider config={{ headingFont: "'Fonte Visitante', serif" }}><Probe name="visitante" /></SarakUIProvider>);
        expect(seen.visitante).toBe("'Fonte Visitante', serif");
        expect(fontStyle('Fonte Visitante')).toBeUndefined();
        expect(fontStyle('Georgia')).toBeUndefined();
    });

    it('valor com CSS cru continua recusado (`isSafeCssString`)', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        render(<SarakUIProvider config={{ headingFont: 'red;}body{x' }}><Probe name="cru" /></SarakUIProvider>);
        expect(seen.cru).not.toBe('red;}body{x');
    });

    it('`none`: a família registrada vale no tema, mas a lib não injeta o `@font-face` dela', () => {
        render(<SarakUIProvider config={{ headingFont: NORTH_VALUE }} options={{ fonts: { source: 'none', custom: islandA } }}><Probe name="none" /></SarakUIProvider>);
        expect(seen.none).toBe(NORTH_VALUE);
        expect(document.head.querySelector('style[data-sarak-font]')).toBeNull();
    });

    it('duas ilhas não trocam arquivos: cada uma carrega só a família que ELA registrou', () => {
        const { unmount } = render(island('a-usa-sul', SOUTH_VALUE, { fonts: { custom: islandA } }));
        expect(seen['a-usa-sul']).toBe(SOUTH_VALUE);
        expect(fontStyle('Ilha Sul')).toBeUndefined();
        unmount();
        render(island('b-usa-sul', SOUTH_VALUE, { fonts: { custom: islandB } }));
        expect(fontStyle('Ilha Sul')?.textContent).toMatch(/\/sul\.woff2/);
        expect(fontStyle('Ilha Norte')).toBeUndefined();
    });
});
