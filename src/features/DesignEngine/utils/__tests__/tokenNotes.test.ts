import { describe, it, expect } from 'vitest';
import { personalOverrideOf, requiredOrientationIfInactive, sidebarWidthRange, withEffectiveBounds } from '../tokenNotes';
import type { SarakDesignToken } from '../../../../core/Design/types';

const widthToken = { id: 'sidebarWidth', label: 'Largura', type: 'slider', defaultValue: 240, constraints: { min: 200, max: 400 } } as unknown as SarakDesignToken;

describe('personalOverrideOf', () => {
    it('com a preferência gravada e oferecida pelo tema, devolve qual é e o valor', () => {
        expect(personalOverrideOf('navigationStyle', { navigationStyle: 'sidebar' }, {})).toEqual({ preference: 'navigationStyle', value: 'sidebar' });
        expect(personalOverrideOf('bodySize', { fontSize: 'lg' }, {})).toEqual({ preference: 'fontSize', value: 'lg' });
        expect(personalOverrideOf('mode', { colorMode: 'dark' }, {})).toEqual({ preference: 'colorMode', value: 'dark' });
        expect(personalOverrideOf('isNavHidden', { navCollapsed: false }, {})).toEqual({ preference: 'navCollapsed', value: false });
    });

    it('sem preferência gravada, ou em token que nenhuma preferência sobrepõe, não há o que avisar', () => {
        expect(personalOverrideOf('navigationStyle', {}, {})).toBeUndefined();
        expect(personalOverrideOf('navigationStyle', undefined, {})).toBeUndefined();
        expect(personalOverrideOf('headingFont', { navigationStyle: 'sidebar' }, {})).toBeUndefined();
    });

    it('preferência que o tema NÃO oferece (posição off) não vence nada: sem aviso', () => {
        expect(personalOverrideOf('navigationStyle', { navigationStyle: 'sidebar' }, { preferenceNavigationStylePosition: 'off' })).toBeUndefined();
        expect(personalOverrideOf('bodySize', { fontSize: 'sm' }, { preferenceFontSizePosition: 'off' })).toBeUndefined();
    });

    it('a largura só é sobreposta com a lateral redimensionável', () => {
        expect(personalOverrideOf('sidebarWidth', { sidebarWidth: 320 }, {})).toBeUndefined();
        expect(personalOverrideOf('sidebarWidth', { sidebarWidth: 320 }, { sidebarResizable: true })).toEqual({ preference: 'sidebarWidth', value: 320 });
    });
});

describe('requiredOrientationIfInactive', () => {
    const navbarLayout = { id: 'navbarLayout', interactsWith: ['navigationStyle'] };
    const sidebarPosition = { id: 'sidebarPosition', interactsWith: ['navigationStyle'] };

    it('navbarLayout com navegação lateral não vale: exige o topo', () => {
        expect(requiredOrientationIfInactive(navbarLayout, { navigationStyle: 'sidebar' })).toBe('topbar');
        expect(requiredOrientationIfInactive(navbarLayout, {})).toBe('topbar');
    });

    it('controle só de Sidebar com navegação no topo não vale: exige a lateral (o inverso)', () => {
        expect(requiredOrientationIfInactive(sidebarPosition, { navigationStyle: 'topbar' })).toBe('sidebar');
    });

    it('o controle vale quando a orientação é a dele', () => {
        expect(requiredOrientationIfInactive(navbarLayout, { navigationStyle: 'topbar' })).toBeUndefined();
        expect(requiredOrientationIfInactive(sidebarPosition, { navigationStyle: 'sidebar' })).toBeUndefined();
    });

    it('token sem dependência declarada de navigationStyle nunca é desabilitado, nem pelo nome', () => {
        expect(requiredOrientationIfInactive({ id: 'sidebarColor' }, { navigationStyle: 'topbar' })).toBeUndefined();
        expect(requiredOrientationIfInactive({ id: 'borderRadius', interactsWith: ['navigationStyle'] }, { navigationStyle: 'topbar' })).toBeUndefined();
    });
});

describe('sidebarWidthRange', () => {
    it('o piso do design vence o do token: com sidebarMinWidth 300 o intervalo começa em 300, não em 200', () => {
        expect(sidebarWidthRange(widthToken, { sidebarMinWidth: 300, sidebarMaxWidth: 600 }, 'desktop')).toEqual({ min: 300, max: 400 });
    });

    it('lê o piso e o teto do dispositivo da prévia', () => {
        const draft = { sidebarMinWidth: { mob: 150, tab: 180, desk: 260 }, sidebarMaxWidth: { mob: 300, tab: 320, desk: 380 } };
        expect(sidebarWidthRange(widthToken, draft, 'smartphone')).toEqual({ min: 200, max: 300 });
        expect(sidebarWidthRange(widthToken, draft, 'tablet')).toEqual({ min: 200, max: 320 });
        expect(sidebarWidthRange(widthToken, draft, 'desktop')).toEqual({ min: 260, max: 380 });
    });

    it('piso acima do teto não inverte o intervalo', () => {
        expect(sidebarWidthRange(widthToken, { sidebarMinWidth: 500, sidebarMaxWidth: 250 }, 'desktop')).toEqual({ min: 500, max: 500 });
    });

    it('withEffectiveBounds só mexe na largura da lateral', () => {
        const bounded = withEffectiveBounds(widthToken, { sidebarMinWidth: 300 }, 'desktop');
        expect(bounded.token.constraints).toMatchObject({ min: 300, max: 400 });
        const other = { ...widthToken, id: 'sidebarMinWidth' } as SarakDesignToken;
        expect(withEffectiveBounds(other, { sidebarMinWidth: 300 }, 'desktop')).toEqual({ token: other });
    });
});
