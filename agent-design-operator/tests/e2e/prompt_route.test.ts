import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { routes } from '../../src/api/routes.js';
import * as providerFactory from '../../src/core/providers/provider_factory.js';
import * as fileLoader from '../../src/utils/file_loader.js';
import * as themeWriter from '../../src/toolbox/theme_writer.js';
import { agentRepository } from '../../src/database/repository.js';
import type { ProviderInterface } from '../../src/core/providers/provider_interface.js';
import type { AgentResponse } from '../../src/toolbox/response_assembler.js';

import { settings } from '../../src/config/shared/settings.js';

// Não há supertest no package.json: a rota é resolvida manualmente via routes.stack
// e o handler é chamado direto com um par req/res mockado (fronteira dinâmica de teste).

interface MockResponse {
  status: (code: number) => MockResponse;
  json: (data: AgentResponse) => void;
}

function findPromptRoute() {
  const layer = routes.stack.find(
    (l): l is typeof l & { route: { path: string; stack: { handle: (req: Request, res: Response, next: () => void) => Promise<void> }[] } } =>
      Boolean(l.route) && l.route.path === '/prompt'
  );
  return layer;
}

function createMockRes(): { res: MockResponse; getStatus: () => number; getData: () => AgentResponse } {
  let resData: AgentResponse | undefined;
  let resStatus = 0;
  const res: MockResponse = {
    status: vi.fn().mockImplementation((s: number) => {
      resStatus = s;
      return res;
    }),
    json: vi.fn().mockImplementation((d: AgentResponse) => {
      resData = d;
    }),
  };
  return { res, getStatus: () => resStatus, getData: () => resData as AgentResponse };
}

describe('POST /prompt E2E', () => {
  beforeEach(() => {
    // Mock the loader
    vi.spyOn(fileLoader, 'loadAgentAssets').mockReturnValue([
      {}, // config
      'identity text', // identity
      'schema', // schema
      'catalog', // catalog
      'rules' // rules
    ]);

    vi.spyOn(agentRepository, 'getConversationHistory').mockResolvedValue([]);
    vi.spyOn(agentRepository, 'saveMessage').mockResolvedValue();

    // Mock settings
    settings.DESIGN_AGENT_LLM_PROVIDER = 'mock_provider';
    settings.DESIGN_AGENT_LLM_MODEL = 'mock_model';
    settings.DESIGN_AGENT_LLM_TEMPERATURE = 0.7;
    settings.DESIGN_AGENT_LLM_MAX_TOKENS = 500;
  });

  it('deve validar que a rota obedece ao contrato e não vaza JSON', async () => {
    const req = {
      body: { prompt: 'tema dark', session_id: 'test-session-e2e' }
    } as unknown as Request;

    const { res, getStatus, getData } = createMockRes();

    const generateResponseMock = vi.fn()
      .mockResolvedValueOnce('Entendido, aplicando tema escuro.') // chat
      .mockResolvedValueOnce('{"mode": "dark"}'); // action

    const mockProvider: ProviderInterface = { generateResponse: generateResponseMock };
    vi.spyOn(providerFactory.ProviderFactory, 'getProvider').mockReturnValue(mockProvider);

    vi.spyOn(themeWriter, 'processThemeUpdate').mockResolvedValue({ mode: 'dark' });

    // Encontrar a rota '/prompt' e executá-la
    const postRoute = findPromptRoute();
    expect(postRoute).toBeDefined();

    await postRoute!.route.stack[0].handle(req, res as unknown as Response, () => {});

    expect(getStatus()).toBe(200);
    expect(getData().success).toBe(true);
    expect(getData().message).toBe('Entendido, aplicando tema escuro.');
    expect(getData().payload).toEqual({ mode: 'dark' });
    expect(getData().message).not.toContain('{'); // NUNCA deve conter json cru
  });

  it('deve tratar o fluxo de estresse protegendo contra vazamento', async () => {
    const req = {
      body: { prompt: 'mude tudo', session_id: 'test-session-e2e-2' }
    } as unknown as Request;

    const { res, getStatus, getData } = createMockRes();

    // Mock the provider simulando um max_tokens cutoff (JSON malformado)
    const generateResponseMock = vi.fn()
      .mockResolvedValueOnce('Tentando aplicar várias mudanças.') // chat
      .mockResolvedValueOnce('{"mode": "dark", "primaryColor": "#000'); // json cortado

    const mockProvider: ProviderInterface = { generateResponse: generateResponseMock };
    vi.spyOn(providerFactory.ProviderFactory, 'getProvider').mockReturnValue(mockProvider);

    const postRoute = findPromptRoute();
    expect(postRoute).toBeDefined();

    await postRoute!.route.stack[0].handle(req, res as unknown as Response, () => {});

    expect(getStatus()).toBe(200);
    expect(getData().success).toBe(true);
    // Garantir que a mensagem final contém o texto + fallback, e não o json quebrado
    expect(getData().message).toContain('Tentando aplicar várias mudanças.');
    expect(getData().message).toContain('reformular');
    expect(getData().payload).toBeUndefined();
  });
});
