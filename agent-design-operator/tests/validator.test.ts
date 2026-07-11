import { expect, test, describe, beforeAll } from 'vitest';
import { themeValidator } from '../src/toolbox/validator.js';

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
