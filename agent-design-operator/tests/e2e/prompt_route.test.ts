import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { routes } from '../../src/api/routes.js';
import * as providerFactory from '../../src/core/providers/provider_factory.js';
import * as fileLoader from '../../src/utils/file_loader.js';
import { agentRepository } from '../../src/database/repository.js';
import type { ProviderInterface } from '../../src/core/providers/provider_interface.js';
import type { AgentResponse } from '../../src/toolbox/response_assembler.js';

import { settings } from '../../src/config/shared/settings.js';
import { getDesignScaffold, type DesignScaffoldToken } from '@sarak/lib-ui-core/backend/node';
import { THEME_SLICES, getSliceTokens, deduplicateScaffoldById } from '../../src/config/shared/theme_slices.js';

// Não há supertest no package.json: a rota é resolvida manualmente via routes.stack
// e o handler é chamado direto com um par req/res mockado (fronteira dinâmica de teste).

interface MockResponse {
  status: (code: number) => MockResponse;
  json: (data: AgentResponse | { error: string }) => void;
}

function findPromptRoute() {
  const layer = routes.stack.find(
    (l): l is typeof l & { route: { path: string; stack: { handle: (req: Request, res: Response, next: () => void) => Promise<void> }[] } } =>
      Boolean(l.route) && l.route.path === '/prompt'
  );
  return layer;
}

function createMockRes(): { res: MockResponse; getStatus: () => number; getData: () => AgentResponse; getError: () => { error: string } } {
  let resData: AgentResponse | { error: string } | undefined;
  let resStatus = 0;
  const res: MockResponse = {
    status: vi.fn().mockImplementation((s: number) => {
      resStatus = s;
      return res;
    }),
    json: vi.fn().mockImplementation((d) => {
      resData = d;
    }),
  };
  return { res, getStatus: () => resStatus, getData: () => resData as AgentResponse, getError: () => resData as { error: string } };
}

const scaffold: DesignScaffoldToken[] = deduplicateScaffoldById(getDesignScaffold());

/**
 * Provider mockado que roteia a resposta pelo CONTEÚDO do prompt (Brief, Chat,
 * ou uma das 6 fatias — identificadas pelo marcador `fatia "<label>"`), já que
 * a rota agora dispara 1 (Brief) + 1 (Chat) + 6 (fatias) = 8 chamadas por
 * requisição, não mais 2.
 */
function buildRoutedProviderMock(options: {
  briefText?: string;
  chatText?: string;
  sliceResponses?: Partial<Record<string, string>>; // por `ThemeSlice.key`
  sliceDefaultResponse?: string;
} = {}) {
  const {
    briefText = 'Escuro, alto contraste, acentos ciano neon, cantos quase retos.',
    chatText = 'Entendido, ajustando o tema conforme pedido.',
    sliceResponses = {},
    sliceDefaultResponse = 'NENHUMA_ALTERACAO',
  } = options;

  const generateResponseMock = vi.fn().mockImplementation(async (systemPrompt: string) => {
    if (systemPrompt.includes('intérprete de intenção visual')) {
      return briefText;
    }
    if (systemPrompt.includes('Você está respondendo SOMENTE o texto que o usuário vai ler no chat')) {
      return chatText;
    }
    const slice = THEME_SLICES.find((s) => systemPrompt.includes(`fatia "${s.label}"`));
    if (!slice) {
      throw new Error('[test] Prompt não corresponde a Brief, Chat, nem a nenhuma fatia conhecida.');
    }
    return sliceResponses[slice.key] ?? sliceDefaultResponse;
  });

  const provider: ProviderInterface = { generateResponse: generateResponseMock };
  return { generateResponseMock, provider };
}

describe('POST /prompt E2E (Brief → (Chat ‖ 6 fatias) → merge → validate → aplica)', () => {
  beforeEach(() => {
    vi.spyOn(fileLoader, 'loadAgentAssets').mockReturnValue([
      {}, // config
      'identity text', // identity
      'schema', // schema
      'catalog', // catalog
      'rules' // rules
    ]);

    vi.spyOn(agentRepository, 'getConversationHistory').mockResolvedValue([]);
    vi.spyOn(agentRepository, 'saveMessage').mockResolvedValue();
    vi.spyOn(agentRepository, 'saveArtifact').mockResolvedValue();

    settings.DESIGN_AGENT_LLM_PROVIDER = 'mock_provider';
    settings.DESIGN_AGENT_LLM_MODEL = 'mock_model';
    settings.DESIGN_AGENT_LLM_TEMPERATURE = 0.7;
    settings.DESIGN_AGENT_LLM_MAX_TOKENS = 500;
  });

  it('deve validar que a rota obedece ao contrato e não vaza JSON no chat, no caminho feliz (modo create)', async () => {
    const req = {
      body: { prompt: 'tema escuro com acentos neon', session_id: 'test-session-e2e-1' }
    } as unknown as Request;
    const { res, getStatus, getData } = createMockRes();

    const { generateResponseMock, provider } = buildRoutedProviderMock({
      chatText: 'Entendido, deixando o tema mais escuro com acentos neon.',
      sliceResponses: {
        foundations: '{"primaryColor": "#00f2ff"}',
        surfaces: '{"cardBorderRadius": 4}',
      },
    });
    vi.spyOn(providerFactory.ProviderFactory, 'getProvider').mockReturnValue(provider);

    const postRoute = findPromptRoute();
    expect(postRoute).toBeDefined();
    await postRoute!.route.stack[0].handle(req, res as unknown as Response, () => {});

    expect(getStatus()).toBe(200);
    expect(getData().success).toBe(true);
    expect(getData().message).toBe('Entendido, deixando o tema mais escuro com acentos neon.');
    expect(getData().payload).toEqual({ primaryColor: '#00f2ff', cardBorderRadius: 4 });
    expect(getData().message).not.toContain('{'); // NUNCA deve conter json cru
    expect(getData().message).not.toContain('[THEME_UPDATE');

    // 1 Brief + 1 Chat + 6 fatias = 8 chamadas de LLM por requisição.
    expect(generateResponseMock).toHaveBeenCalledTimes(8);
  });

  it('modo "patch" sem "base_theme" no corpo da requisição deve retornar 400, sem chamar nenhum LLM', async () => {
    const req = {
      body: { prompt: 'deixa mais compacto', session_id: 'test-session-e2e-2', mode: 'patch' }
    } as unknown as Request;
    const { res, getStatus, getError } = createMockRes();

    const { generateResponseMock, provider } = buildRoutedProviderMock();
    vi.spyOn(providerFactory.ProviderFactory, 'getProvider').mockReturnValue(provider);

    const postRoute = findPromptRoute();
    await postRoute!.route.stack[0].handle(req, res as unknown as Response, () => {});

    expect(getStatus()).toBe(400);
    expect(getError().error).toContain('base_theme');
    expect(generateResponseMock).not.toHaveBeenCalled();
  });

  it('modo "patch" com "base_theme" deve propagar o tema base pras fatias e aplicar só os overrides', async () => {
    const baseTheme = Object.fromEntries(scaffold.map((t) => [t.id, t.defaultValue]));
    const req = {
      body: { prompt: 'deixa a cor primária mais vibrante', session_id: 'test-session-e2e-3', mode: 'patch', base_theme: baseTheme }
    } as unknown as Request;
    const { res, getStatus, getData } = createMockRes();

    const { generateResponseMock, provider } = buildRoutedProviderMock({
      sliceResponses: { foundations: '{"primaryColor": "#ff00d4"}' },
    });
    vi.spyOn(providerFactory.ProviderFactory, 'getProvider').mockReturnValue(provider);

    const postRoute = findPromptRoute();
    await postRoute!.route.stack[0].handle(req, res as unknown as Response, () => {});

    expect(getStatus()).toBe(200);
    expect(getData().payload).toEqual({ primaryColor: '#ff00d4' });

    const foundationsPromptSent = generateResponseMock.mock.calls.find((call) =>
      (call[0] as string).includes('fatia "Fundações"')
    )![0] as string;
    expect(foundationsPromptSent).toContain('MODO PATCH');
    expect(foundationsPromptSent).toContain('TEMA BASE ATUAL');
  });

  it('falha parcial: uma fatia rejeitada não derruba as demais — payload combina as que passaram, mensagem avisa por nome humano (nunca JSON/erro cru)', async () => {
    const req = {
      body: { prompt: 'muda tudo', session_id: 'test-session-e2e-4' }
    } as unknown as Request;
    const { res, getStatus, getData } = createMockRes();

    const generateResponseMock = vi.fn().mockImplementation(async (systemPrompt: string) => {
      if (systemPrompt.includes('intérprete de intenção visual')) return 'Brief qualquer.';
      if (systemPrompt.includes('Você está respondendo SOMENTE o texto')) return 'Tentando aplicar várias mudanças.';
      const slice = THEME_SLICES.find((s) => systemPrompt.includes(`fatia "${s.label}"`));
      if (slice?.key === 'specialized') {
        return '{"badgeRadius": "isso não é um número, é lixo'; // JSON cortado/malformado
      }
      return 'NENHUMA_ALTERACAO';
    });
    const provider: ProviderInterface = { generateResponse: generateResponseMock };
    vi.spyOn(providerFactory.ProviderFactory, 'getProvider').mockReturnValue(provider);

    const postRoute = findPromptRoute();
    await postRoute!.route.stack[0].handle(req, res as unknown as Response, () => {});

    expect(getStatus()).toBe(200);
    expect(getData().success).toBe(true);
    expect(getData().message).toContain('Tentando aplicar várias mudanças.');
    expect(getData().message).toContain('Especializados'); // nome humano da fatia que falhou
    expect(getData().message).not.toContain('{'); // nunca o JSON cortado cru
    expect(getData().message).not.toContain('badgeRadius'); // nunca a chave técnica
  });

  it('caso "tema completo não trunca": modo create com todas as fatias cheias aplica as 409 chaves reais do gabarito', async () => {
    const req = {
      body: { prompt: 'crie um tema completo do zero', session_id: 'test-session-e2e-5' }
    } as unknown as Request;
    const { res, getStatus, getData } = createMockRes();

    const sliceResponses: Record<string, string> = {};
    THEME_SLICES.forEach((slice) => {
      const sliceTokens = getSliceTokens(slice, scaffold);
      const fullSlicePayload = Object.fromEntries(sliceTokens.map((t) => [t.id, t.defaultValue]));
      sliceResponses[slice.key] = JSON.stringify(fullSlicePayload);
    });

    const { provider } = buildRoutedProviderMock({ sliceResponses });
    vi.spyOn(providerFactory.ProviderFactory, 'getProvider').mockReturnValue(provider);

    const postRoute = findPromptRoute();
    await postRoute!.route.stack[0].handle(req, res as unknown as Response, () => {});

    expect(getStatus()).toBe(200);
    expect(getData().success).toBe(true);
    expect(Object.keys(getData().payload!).length).toBe(scaffold.length);
    expect(getData().message).not.toContain('não puderam ser ajustadas'); // nenhuma fatia falhou
  });

  it('BUG C — guard de saída: se a Chamada A (chat) desobedecer o prompt e vazar [THEME_UPDATE]/JSON cru, a "message" final NUNCA pode conter isso (defesa em profundidade do Critério 2 da Spec 03)', async () => {
    const req = {
      body: { prompt: 'crie um tema para mim', session_id: 'test-session-e2e-6' }
    } as unknown as Request;
    const { res, getStatus, getData } = createMockRes();

    // Simula um modelo fraco desobedecendo a Chamada A e emitindo o formato
    // morto pela Spec 03 — exatamente o sintoma relatado em produção (Bug A/C).
    const { provider } = buildRoutedProviderMock({
      chatText: 'Criei um tema para você [THEME_UPDATE: {"primaryColor": "#000000", "cardBorderRadius": 4}]',
      sliceResponses: { foundations: '{"primaryColor": "#00f2ff"}' },
    });
    vi.spyOn(providerFactory.ProviderFactory, 'getProvider').mockReturnValue(provider);

    const postRoute = findPromptRoute();
    await postRoute!.route.stack[0].handle(req, res as unknown as Response, () => {});

    expect(getStatus()).toBe(200);
    expect(getData().message).not.toContain('[THEME_UPDATE');
    expect(getData().message).not.toContain('{');
    expect(getData().message).not.toContain('}');
    expect(getData().message).not.toContain('primaryColor');
    // O guard só limpa o CHAT — o payload real (vindo das fatias, já validado)
    // continua chegando normalmente ao usuário pelo campo `payload`.
    expect(getData().payload).toEqual({ primaryColor: '#00f2ff' });
  });

  it('BUG B — falha ao gerar o Design Brief nunca pode virar 500: produz 200 com mensagem graciosa (Regra 4 da Spec 03)', async () => {
    const req = {
      body: { prompt: 'analise meu site e replique o estilo', session_id: 'test-session-e2e-7' }
    } as unknown as Request;
    const { res, getStatus, getData } = createMockRes();

    // Provider devolve string vazia pro Brief — `generateDesignBrief` lança
    // ('Design Brief vazio...'). Simula tanto um hiccup real do provider
    // quanto (indiretamente) um pedido que dependeria de ler referência
    // externa, que `rules.md` agora instrui o modelo a recusar em prosa —
    // mas se o modelo ainda assim devolver algo inutilizável, a rota não
    // pode quebrar.
    const generateResponseMock = vi.fn().mockImplementation(async (systemPrompt: string) => {
      if (systemPrompt.includes('intérprete de intenção visual')) return '   ';
      throw new Error('[test] Não deveria chamar Chat/fatias quando o Brief falha.');
    });
    const provider: ProviderInterface = { generateResponse: generateResponseMock };
    vi.spyOn(providerFactory.ProviderFactory, 'getProvider').mockReturnValue(provider);

    const postRoute = findPromptRoute();
    await postRoute!.route.stack[0].handle(req, res as unknown as Response, () => {});

    expect(getStatus()).toBe(200);
    expect(getData().success).toBe(true);
    expect(getData().payload).toBeUndefined();
    expect(getData().message).not.toContain('{');
    expect(getData().message).not.toContain('500');
    expect(getData().message).not.toContain('Error');
    expect(getData().message.length).toBeGreaterThan(0);
    // Curto-circuita antes de Chat/fatias — só a chamada do Brief acontece.
    expect(generateResponseMock).toHaveBeenCalledTimes(1);
  });
});
