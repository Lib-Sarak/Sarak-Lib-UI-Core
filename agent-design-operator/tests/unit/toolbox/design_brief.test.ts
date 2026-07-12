import { describe, it, expect, vi } from 'vitest';
import { generateDesignBrief } from '../../../src/toolbox/design_brief.js';
import type { ProviderInterface } from '../../../src/core/providers/provider_interface.js';

describe('generateDesignBrief', () => {
  const identity = 'identity text';
  const rules = 'rules text';

  it('deve retornar a prosa do provider, sem espaços nas bordas', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('  Escuro, alto contraste, acentos neon.  ');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    const brief = await generateDesignBrief('quero um tema escuro e neon', identity, rules, provider, 0.2, 1000, 'test-model');

    expect(brief).toBe('Escuro, alto contraste, acentos neon.');
  });

  it('deve proibir JSON/tokens técnicos explicitamente no prompt enviado ao provider', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('Um brief qualquer.');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    await generateDesignBrief('tema moderno', identity, rules, provider, 0.2, 1000, 'test-model');

    const systemPromptSent = generateResponseMock.mock.calls[0][0] as string;
    expect(systemPromptSent).toContain('TERMINANTEMENTE PROIBIDO');
    expect(systemPromptSent).toContain('JSON');
    expect(systemPromptSent).toContain('primaryColor');
    expect(systemPromptSent).toContain('cardBorderRadius');
  });

  it('deve incluir o conteúdo de referência no prompt quando fornecido (ponto de extensão pras Specs 05/06)', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('Brief a partir de referência.');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    await generateDesignBrief('replique este site', identity, rules, provider, 0.2, 1000, 'test-model', 'Site com fundo escuro e tipografia condensada.');

    const systemPromptSent = generateResponseMock.mock.calls[0][0] as string;
    expect(systemPromptSent).toContain('CONTEÚDO DE REFERÊNCIA EXTRAÍDO');
    expect(systemPromptSent).toContain('tipografia condensada');
  });

  it('deve lançar erro quando o provider devolve string vazia', async () => {
    const generateResponseMock = vi.fn().mockResolvedValue('   ');
    const provider: ProviderInterface = { generateResponse: generateResponseMock };

    await expect(
      generateDesignBrief('tema qualquer', identity, rules, provider, 0.2, 1000, 'test-model')
    ).rejects.toThrow('Design Brief vazio');
  });
});
