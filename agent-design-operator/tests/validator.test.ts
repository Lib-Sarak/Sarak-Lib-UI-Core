import { expect, test, describe, beforeAll } from 'vitest';
import { themeValidator } from '../src/toolbox/validator.js';
import { getDesignScaffold, type DesignScaffoldToken } from '@sarak/lib-ui-core/backend/node';
import { deduplicateScaffoldById } from '../src/config/shared/theme_slices.js';

describe('ThemeValidator - Anti-Hallucination Middleware', () => {
  beforeAll(async () => {
    // Carrega o catálogo real de tokens da Sarak-Lib-UI-Core (Schema/MasterMap).
    await themeValidator.loadDynamicCatalog();
  });

  test('Deve aceitar payload que contém APENAS chaves reais do catálogo, com valor no domínio', () => {
    const validPayload = {
      cardLayoutDirection: 'row',
    };

    expect(() => themeValidator.validatePayload(validPayload)).not.toThrow();
  });

  test('Deve bloquear agressivamente e lançar erro se a LLM alucinar uma chave inexistente', () => {
    const invalidPayload = {
      cardLayoutDirection: 'row',
      naoExisteNoCatalogo: 'valor-qualquer',
    };

    expect(() => themeValidator.validatePayload(invalidPayload))
      .toThrowError(/SECURITY_VIOLATION.*naoExisteNoCatalogo.*/);
  });

  test('Deve bloquear valor fora das opções válidas de um token `select`', () => {
    const invalidPayload = {
      cardLayoutDirection: 'diagonal', // não é 'column' nem 'row'
    };

    expect(() => themeValidator.validatePayload(invalidPayload))
      .toThrowError(/SECURITY_VIOLATION.*cardLayoutDirection.*/);
  });
});

describe('ThemeValidator × deduplicateScaffoldById — desempate consistente pra ids duplicados', () => {
  beforeAll(async () => {
    await themeValidator.loadDynamicCatalog();
  });

  test('zIndexModal: valor válido pelo domínio mostrado na fatia (engineering.ts, sem min/max) não pode ser reprovado na validação final — bug real que existia antes do reparo (o Map do validador mantinha layers.ts, min 1000/max 5000)', () => {
    // 500 é válido pelo domínio de `engineering.ts` (sem min/max) — o que o LLM
    // via em [CATÁLOGO COMPLETO] ao preencher a fatia "Especializados" — mas é
    // INVÁLIDO pelo domínio de `layers.ts` (min 1000). Antes do reparo (Map
    // ingênuo = última ocorrência = layers.ts), esta chamada lançava
    // SECURITY_VIOLATION pra um valor que o preenchimento considerava correto.
    expect(() => themeValidator.validatePayload({ zIndexModal: 500 })).not.toThrow();
  });

  test('regressão: pra TODO id duplicado no gabarito bruto, o dono escolhido por deduplicateScaffoldById e o dono aplicado por ThemeValidator são o MESMO token (mesma description/type/min/max/options)', () => {
    const rawScaffold = getDesignScaffold();

    const occurrencesById = new Map<string, DesignScaffoldToken[]>();
    rawScaffold.forEach((token) => {
      const list = occurrencesById.get(token.id) ?? [];
      list.push(token);
      occurrencesById.set(token.id, list);
    });
    const duplicatedIds = [...occurrencesById.entries()]
      .filter(([, tokens]) => tokens.length > 1)
      .map(([id]) => id);

    // Sanity: se isto ficar vazio (ex. a duplicação de origem for corrigida
    // algum dia), o teste não pode passar silenciosamente sem testar nada.
    expect(duplicatedIds.length).toBeGreaterThan(0);

    const dedupedScaffold = deduplicateScaffoldById(rawScaffold);

    duplicatedIds.forEach((id) => {
      const scaffoldWinner = dedupedScaffold.find((t) => t.id === id);
      const validatorWinner = themeValidator.getToken(id);

      expect(scaffoldWinner, `scaffold deduplicado não tem "${id}"`).toBeDefined();
      expect(validatorWinner, `ThemeValidator não tem "${id}" carregado`).toBeDefined();

      expect(validatorWinner!.type).toBe(scaffoldWinner!.type);
      expect(validatorWinner!.description).toBe(scaffoldWinner!.description);
      expect(validatorWinner!.min).toBe(scaffoldWinner!.min);
      expect(validatorWinner!.max).toBe(scaffoldWinner!.max);
      expect(validatorWinner!.options).toEqual(scaffoldWinner!.options);
    });
  });
});
