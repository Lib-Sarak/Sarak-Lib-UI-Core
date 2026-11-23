/**
 * O formato de escolhas no Provider: ler o gravado (cache ou `onLoad`) no formato dele, montar o que se grava, e refazer
 * o design quando o tema do gravado chega depois.
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { sarakLoadThemePreset } from '../../../Design/presets/themes/registry';
import { composeThemeForMode } from '../../../Design/presets/themes/compose';
import { validateDesign } from '../../utils/validation';
import { writeCachedDesign } from '../../utils/resolveStorageKey';
import { readCachedSavedDesign, restoreSavedDesign, useDesignChoices } from '../useDesignChoices';
import type { SarakDesignState, SarakThemeEntry, SarakThemePayload } from '../../types';

type DesignRecord = Record<string, unknown>;
const KEY = 'design-choices-test';
let clean: SarakDesignState;

beforeAll(async () => {
    const sovereign = await sarakLoadThemePreset('sarak-sovereign') as SarakThemeEntry;
    clean = validateDesign(composeThemeForMode({ design: sovereign.design as never, contraparte: sovereign.contraparte }, 'dark'));
});

afterEach(() => localStorage.clear());

describe('restoreSavedDesign', () => {
    it('formato 2: refaz pelo tema e substitui — o que só o anterior tinha não fica', () => {
        const previous = { ...clean, cardBorderColor: '#999999' } as SarakDesignState;
        const { design, restored } = restoreSavedDesign(previous, { design: { systemName: 'ERP' }, format: 2, themeId: 'sarak-sovereign' }, undefined, undefined);
        expect(restored).toBe(true);
        expect(design.systemName).toBe('ERP');
        expect(design.cardBorderColor).toBe(clean.cardBorderColor);
    });

    it('sem marcador: funde por cima e passa pela regra L1', () => {
        const saved = { design: { colorBgBody: '#000000', bodySize: '18px' }, themeId: 'sarak-sovereign' };
        const { design } = restoreSavedDesign(clean, saved, undefined, undefined);
        expect(design.colorBgBody).toBe(clean.colorBgBody);
        expect(design.bodySize).toBe('18px');
    });

    it('sem o tema em memória (ou sem id gravado): funde como antes e fica pendente', () => {
        const { design, restored } = restoreSavedDesign(clean, { design: { colorBgBody: '#000000' } }, undefined, undefined);
        expect(restored).toBe(false);
        expect(design.colorBgBody).toBe('#000000');
    });
});

describe('readCachedSavedDesign', () => {
    it('lê as escolhas quando acompanham o design inteiro gravado junto', () => {
        writeCachedDesign(KEY, clean, { format: 2, design: { systemName: 'ERP' } });
        expect(readCachedSavedDesign(KEY, 'sarak-sovereign')).toMatchObject({ design: { systemName: 'ERP' }, format: 2, themeId: 'sarak-sovereign' });
    });

    it('ignora as escolhas quando outra gravação (uma lib anterior em outra aba) regravou o design inteiro', () => {
        writeCachedDesign(KEY, clean, { format: 2, design: { systemName: 'ERP' } });
        localStorage.setItem(KEY, JSON.stringify({ ...clean, systemName: 'Outra aba' }));
        const saved = readCachedSavedDesign(KEY, 'sarak-sovereign');
        expect(saved?.format).toBeUndefined();
        expect(saved?.design.systemName).toBe('Outra aba');
    });

    it('sem nada gravado, nada', () => {
        expect(readCachedSavedDesign(KEY, undefined)).toBeUndefined();
    });
});

describe('useDesignChoices', () => {
    const configRef = { current: {} as SarakThemePayload };

    it('com o tema em memória, grava as escolhas e o marcador; sem ele, o design inteiro e sem marcador', () => {
        const { result } = renderHook(() => useDesignChoices(undefined, configRef));
        const edited = { ...clean, cardBorderColor: '#abcdef' } as SarakDesignState;
        expect(result.current.toPersisted(edited, 'sarak-sovereign')).toEqual({ design: { cardBorderColor: '#abcdef' }, format: 2 });
        const whole = result.current.toPersisted(edited, 'tema-que-nao-carregou');
        expect(whole.format).toBeUndefined();
        expect((whole.design as DesignRecord).cardBorderColor).toBe('#abcdef');
        expect(Object.keys(whole.design).length).toBe(Object.keys(edited).length);
    });

    it('restaurar sem o tema deixa a pendência; com o tema, apaga', () => {
        const { result } = renderHook(() => useDesignChoices(undefined, configRef));
        result.current.restore(clean, { design: {}, format: 2, themeId: 'tema-que-nao-carregou' });
        expect(result.current.pendingRef.current?.themeId).toBe('tema-que-nao-carregou');
        result.current.restore(clean, { design: {}, format: 2, themeId: 'sarak-sovereign' });
        expect(result.current.pendingRef.current).toBeNull();
    });
});
