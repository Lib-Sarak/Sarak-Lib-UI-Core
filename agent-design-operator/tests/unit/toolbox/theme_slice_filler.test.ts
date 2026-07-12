import { describe, it, expect, vi } from 'vitest';
import { getDesignScaffold } from '@sarak/lib-ui-core/backend/node';
import { fillThemeSlice, computeSliceMaxTokens } from '../../../src/toolbox/theme_slice_filler.js';
import { THEME_SLICES, getSliceTokens, deduplicateScaffoldById } from '../../../src/config/shared/theme_slices.js';
import type { ProviderInterface } from '../../../src/core/providers/provider_interface.js';

describe('computeSliceMaxTokens (função pura)', () => {
  it('nunca devolve menos que o configurado', () => {
    expect(computeSliceMaxTokens(5, 2000)).toBe(2000);
  });

  it('cresce quando a fatia tem mais chaves do que o configurado comporta com folga', () => {
    // Fatia "Superfícies" real tem 113 chaves — 113*20 + 300 = 2560, maior que o default 2000.
    const effective = computeSliceMaxTokens(113, 2000);
    expect(effective).toBeGreaterThan(2000);
    expect(effective).toBe(113 * 20 + 300);
  });
});

describe('fillThemeSlice', () => {
  const identity = 'identity text';
  const rules = 'rules text';
  const scaffold = deduplicateScaffoldById(getDesignScaffold());
  const controlsSlice = THEME_SLICES.find((s) => s.key === 'controls')!;

  it('deve retornar o objeto parseado quando o provider devolve JSON válido só com chaves da fatia', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('{"btnPrimaryBg": "#00ffcc"}');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    const result = await fillThemeSlice({
      slice: controlsSlice, scaffold, brief: 'brief qualquer', mode: 'create',
      provider, identity, rules, temperature: 0.1, maxTokens: 1000, model: 'test-model',
    });

    expect(result).toEqual({ btnPrimaryBg: '#00ffcc' });
  });

  it('deve retornar objeto vazio quando o provider devolve NENHUMA_ALTERACAO', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('NENHUMA_ALTERACAO');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    const result = await fillThemeSlice({
      slice: controlsSlice, scaffold, brief: 'brief qualquer', mode: 'create',
      provider, identity, rules, temperature: 0.1, maxTokens: 1000, model: 'test-model',
    });

    expect(result).toEqual({});
  });

  it('deve lançar erro quando o provider devolve JSON inválido', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('isso não é json');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    await expect(
      fillThemeSlice({
        slice: controlsSlice, scaffold, brief: 'brief qualquer', mode: 'create',
        provider, identity, rules, temperature: 0.1, maxTokens: 1000, model: 'test-model',
      })
    ).rejects.toThrow(/JSON válido/);
  });

  it('deve lançar erro ANTES de chamar o provider quando modo é patch sem baseTheme', async () => {
    const generateResponseMock = vi.fn();
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    await expect(
      fillThemeSlice({
        slice: controlsSlice, scaffold, brief: 'brief qualquer', mode: 'patch',
        provider, identity, rules, temperature: 0.1, maxTokens: 1000, model: 'test-model',
      })
    ).rejects.toThrow(/baseTheme/);
    expect(generateResponseMock).not.toHaveBeenCalled();
  });

  it('deve incluir no prompt só o tema base das chaves desta fatia (modo patch)', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('NENHUMA_ALTERACAO');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };
    const sliceIds = getSliceTokens(controlsSlice, scaffold).map((t) => t.id);
    const otherFamilyKey = 'primaryColor'; // pertence à fatia 'foundations', não 'controls'

    await fillThemeSlice({
      slice: controlsSlice, scaffold, brief: 'brief qualquer', mode: 'patch',
      baseTheme: { [sliceIds[0]]: 'valor-existente', [otherFamilyKey]: '#000000' },
      provider, identity, rules, temperature: 0.1, maxTokens: 1000, model: 'test-model',
    });

    const systemPromptSent = generateResponseMock.mock.calls[0][0] as string;
    expect(systemPromptSent).toContain('TEMA BASE ATUAL');
    expect(systemPromptSent).toContain(sliceIds[0]);
    expect(systemPromptSent).not.toContain('"primaryColor"'); // chave de outra fatia não vaza pro tema base
  });

  it('deve restringir [CHAVES DESTA FATIA] só às chaves da família — não lista chaves de outras fatias', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('NENHUMA_ALTERACAO');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    await fillThemeSlice({
      slice: controlsSlice, scaffold, brief: 'brief qualquer', mode: 'create',
      provider, identity, rules, temperature: 0.1, maxTokens: 1000, model: 'test-model',
    });

    const systemPromptSent = generateResponseMock.mock.calls[0][0] as string;
    // A instrução de regras também MENCIONA "[CHAVES DESTA FATIA]" genericamente —
    // o marcador real da seção é o cabeçalho com o label entre aspas, que só
    // aparece uma vez.
    const chavesBlock = systemPromptSent.split(`[CHAVES DESTA FATIA — "${controlsSlice.label}"`)[1];
    expect(chavesBlock).toBeDefined();
    const chavesSectionOnly = chavesBlock.split('[STRICT GUARDRAILS]')[0];
    expect(chavesSectionOnly).toContain('btnPrimaryBg'); // família 'buttons', pertence a 'controls'
    expect(chavesSectionOnly).not.toContain('primaryColor'); // família 'colors', pertence a 'foundations'
  });

  it('deve usar o maxTokens efetivo (computeSliceMaxTokens) na chamada ao provider pra fatias grandes', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('NENHUMA_ALTERACAO');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };
    const surfacesSlice = THEME_SLICES.find((s) => s.key === 'surfaces')!; // maior fatia real (113 chaves)
    const surfacesIds = getSliceTokens(surfacesSlice, scaffold).map((t) => t.id);

    await fillThemeSlice({
      slice: surfacesSlice, scaffold, brief: 'brief qualquer', mode: 'create',
      provider, identity, rules, temperature: 0.1, maxTokens: 500, model: 'test-model',
    });

    const maxTokensSent = generateResponseMock.mock.calls[0][3] as number;
    expect(maxTokensSent).toBe(computeSliceMaxTokens(surfacesIds.length, 500));
    expect(maxTokensSent).toBeGreaterThan(500);
  });
});
