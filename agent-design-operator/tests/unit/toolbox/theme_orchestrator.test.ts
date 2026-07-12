import { describe, it, expect, vi } from 'vitest';
import { getDesignScaffold } from '@sarak/lib-ui-core/backend/node';
import { generateThemeSlices } from '../../../src/toolbox/theme_orchestrator.js';
import { THEME_SLICES, getSliceTokens, deduplicateScaffoldById } from '../../../src/config/shared/theme_slices.js';
import type { ProviderInterface } from '../../../src/core/providers/provider_interface.js';

// `routes.ts` sempre deduplica antes de passar o gabarito pro orchestrator
// (7 ids pré-existentes aparecem em duas famílias — ver `deduplicateScaffoldById`);
// os testes replicam isso pra refletir o uso real.
const scaffold = deduplicateScaffoldById(getDesignScaffold());
const identity = 'identity text';
const rules = 'rules text';

/** Descobre qual fatia um prompt de `fillThemeSlice` pertence, pelo marcador de label no prompt. */
function sliceForPrompt(systemPrompt: string) {
  return THEME_SLICES.find((slice) => systemPrompt.includes(`fatia "${slice.label}"`))!;
}

describe('generateThemeSlices', () => {
  it('deve mesclar as 6 fatias quando todas retornam JSON válido', async () => {
    const generateResponseMock = vi.fn().mockImplementation(async (systemPrompt: string) => {
      const slice = sliceForPrompt(systemPrompt);
      const [firstToken] = getSliceTokens(slice, scaffold);
      return JSON.stringify({ [firstToken.id]: firstToken.defaultValue });
    });
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    const result = await generateThemeSlices({
      scaffold, brief: 'brief qualquer', mode: 'create', provider, identity, rules,
      temperature: 0.1, maxTokens: 1000, model: 'test-model',
    });

    expect(result.failedSliceLabels).toEqual([]);
    expect(generateResponseMock).toHaveBeenCalledTimes(6);
    expect(Object.keys(result.payload!).length).toBe(6); // 1 chave por fatia
  });

  it('deve isolar a falha de UMA fatia (rejeição do provider) sem derrubar as demais', async () => {
    const generateResponseMock = vi.fn().mockImplementation(async (systemPrompt: string) => {
      const slice = sliceForPrompt(systemPrompt);
      if (slice.key === 'specialized') {
        throw new Error('provider indisponível');
      }
      const [firstToken] = getSliceTokens(slice, scaffold);
      return JSON.stringify({ [firstToken.id]: firstToken.defaultValue });
    });
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    const result = await generateThemeSlices({
      scaffold, brief: 'brief qualquer', mode: 'create', provider, identity, rules,
      temperature: 0.1, maxTokens: 1000, model: 'test-model',
    });

    expect(result.failedSliceLabels).toEqual(['Especializados']);
    expect(Object.keys(result.payload!).length).toBe(5); // as outras 5 fatias aplicaram normalmente
  });

  it('deve isolar a falha de UMA fatia (valor reprovado na validação de catálogo) sem derrubar as demais', async () => {
    const generateResponseMock = vi.fn().mockImplementation(async (systemPrompt: string) => {
      const slice = sliceForPrompt(systemPrompt);
      if (slice.key === 'controls') {
        // btnStyleType é 'select' com opções fixas — 'nao-existe' é sempre inválido.
        return JSON.stringify({ btnStyleType: 'nao-existe' });
      }
      const [firstToken] = getSliceTokens(slice, scaffold);
      return JSON.stringify({ [firstToken.id]: firstToken.defaultValue });
    });
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    const result = await generateThemeSlices({
      scaffold, brief: 'brief qualquer', mode: 'create', provider, identity, rules,
      temperature: 0.1, maxTokens: 1000, model: 'test-model',
    });

    expect(result.failedSliceLabels).toEqual(['Controles']);
    expect(result.payload!.btnStyleType).toBeUndefined();
    expect(Object.keys(result.payload!).length).toBe(5);
  });

  it('deve devolver payload undefined e nenhuma fatia falhada quando todas retornam NENHUMA_ALTERACAO', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('NENHUMA_ALTERACAO');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    const result = await generateThemeSlices({
      scaffold, brief: 'brief qualquer', mode: 'create', provider, identity, rules,
      temperature: 0.1, maxTokens: 1000, model: 'test-model',
    });

    expect(result.payload).toBeUndefined();
    expect(result.failedSliceLabels).toEqual([]);
  });

  it('caso "tema completo não trunca": um tema criado do zero preenche as 416 chaves do gabarito sem nenhuma fatia falhar', async () => {
    const generateResponseMock = vi.fn().mockImplementation(async (systemPrompt: string) => {
      const slice = sliceForPrompt(systemPrompt);
      const sliceTokens = getSliceTokens(slice, scaffold);
      const fullSlicePayload = Object.fromEntries(sliceTokens.map((token) => [token.id, token.defaultValue]));
      return JSON.stringify(fullSlicePayload);
    });
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    const result = await generateThemeSlices({
      scaffold, brief: 'brief qualquer', mode: 'create', provider, identity, rules,
      temperature: 0.1, maxTokens: 500, model: 'test-model', // maxTokens baixo de propósito — computeSliceMaxTokens deve compensar
    });

    expect(result.failedSliceLabels).toEqual([]);
    expect(Object.keys(result.payload!).length).toBe(scaffold.length);
    scaffold.forEach((token) => {
      expect(result.payload![token.id]).toEqual(token.defaultValue);
    });
  });

  it('modo patch: propaga o baseTheme só com as chaves de cada fatia (verificado indiretamente via NENHUMA_ALTERACAO + prompt)', async () => {
    const generateResponseMock = vi.fn().mockImplementation(async (systemPrompt: string) => {
      expect(systemPrompt).toContain('MODO PATCH');
      return 'NENHUMA_ALTERACAO';
    });
    const provider: ProviderInterface = { generateResponse: generateResponseMock };
    const baseTheme = Object.fromEntries(scaffold.map((t) => [t.id, t.defaultValue]));

    const result = await generateThemeSlices({
      scaffold, brief: 'ajuste só a cor primária', mode: 'patch', baseTheme, provider, identity, rules,
      temperature: 0.1, maxTokens: 1000, model: 'test-model',
    });

    expect(result.failedSliceLabels).toEqual([]);
    expect(generateResponseMock).toHaveBeenCalledTimes(6);
  });
});
