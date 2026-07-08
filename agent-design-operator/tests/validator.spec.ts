import { expect, test, describe, beforeAll } from 'vitest';
import { themeValidator } from '../src/toolbox/validator.js';

describe('ThemeValidator - Anti-Hallucination Middleware', () => {
  beforeAll(async () => {
    // Carrega o dicionário dinâmico que representa o RAG
    await themeValidator.loadDynamicCatalog();
  });

  test('Deve aceitar payload que contém APENAS chaves reais mapeadas', () => {
    const validPayload = {
      "cardLayoutDirection": "row",
      "--sx-color-primary": "#fff"
    };
    
    expect(() => themeValidator.validatePayload(validPayload)).not.toThrow();
  });

  test('Deve bloquear agressivamente e lançar erro se a LLM alucinar uma chave órfã', () => {
    const invalidPayload = {
      "cardLayoutDirection": "column",
      "--sx-color-primary": "#000",
      "--sx-invented-shadow": "10px" // <- Variável Fantasma
    };
    
    expect(() => themeValidator.validatePayload(invalidPayload))
      .toThrowError(/SECURITY_VIOLATION.*--sx-invented-shadow.*/);
  });
});
