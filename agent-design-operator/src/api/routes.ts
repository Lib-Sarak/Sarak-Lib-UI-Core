import { Router, Request, Response } from 'express';
import { getDesignScaffold } from '@sarak/lib-ui-core/backend/node';
import { agentRepository } from '../database/repository.js';
import { loadAgentAssets } from '../utils/file_loader.js';
import { GLOBAL_SYSTEM_CONSTRAINTS } from '../config/shared/global_prompts.js';
import { settings } from '../config/shared/settings.js';
import { ProviderFactory } from '../core/providers/provider_factory.js';
import { generateDesignBrief } from '../toolbox/design_brief.js';
import { generateThemeSlices } from '../toolbox/theme_orchestrator.js';
import { deduplicateScaffoldById } from '../config/shared/theme_slices.js';
import { sanitizeChatMessage } from '../toolbox/chat_guard.js';
import { logger } from '../utils/logger.js';

import { InputValidator, SecurityViolationError } from '../core/security/input_validator.js';
import { assembleAgentResponse } from '../toolbox/response_assembler.js';

const BRIEF_FAILURE_FALLBACK_MESSAGE = 'Não consegui entender esse pedido agora — pode tentar reformular, ou descrever em texto o estilo que você quer?';

export const routes = Router();

const DESIGN_AGENT_ID = 'design-operator';

routes.post('/prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, session_id, mode, base_theme } = req.body;

    if (!prompt || !session_id) {
      return res.status(400).json({ error: 'Faltam campos (prompt ou session_id) no corpo da requisição.' });
    }

    InputValidator.sanitizeInput(prompt);

    // Regra do arquiteto: seleção de modo é EXPLÍCITA (parâmetro na request),
    // nunca adivinhada por heurística de texto (Spec 02, revisão pós-incidente).
    const themeMode: 'create' | 'patch' = mode === 'patch' ? 'patch' : 'create';
    if (themeMode === 'patch' && (!base_theme || typeof base_theme !== 'object' || Array.isArray(base_theme))) {
      return res.status(400).json({
        error: 'Modo "patch" exige "base_theme" (objeto com o tema atual completo) no corpo da requisição.',
      });
    }

    if (!settings.DESIGN_AGENT_LLM_PROVIDER || !settings.DESIGN_AGENT_LLM_MODEL) {
      return res.status(500).json({
        error: 'Design Agent sem provider/model configurados. O sistema importador precisa definir DESIGN_AGENT_LLM_PROVIDER e DESIGN_AGENT_LLM_MODEL no ambiente — o módulo não escolhe isso sozinho.',
      });
    }

    const [, identity, , , rules] = loadAgentAssets(DESIGN_AGENT_ID);
    // `getDesignScaffold()` tem 7 ids que existem em duas famílias ao mesmo
    // tempo (pendência de higiene de schema pré-existente, spec 01) —
    // deduplicado aqui pra nenhum id cair em duas fatias ao mesmo tempo (ver
    // docblock de `deduplicateScaffoldById`).
    const scaffold = deduplicateScaffoldById(getDesignScaffold());
    const provider = ProviderFactory.getProvider(settings.DESIGN_AGENT_LLM_PROVIDER);

    const startMs = performance.now();

    // Etapa 1 — Design Brief: traduz o pedido em prosa, sem token técnico
    // nenhum. Roda ANTES do resto porque é o contexto compartilhado por todas
    // as chamadas da Etapa 2 (mantém as 6 fatias coerentes entre si).
    //
    // Protegido isoladamente (Regra 4 da Spec 03, bug de produção real): antes
    // desta proteção, qualquer falha aqui (brief vazio, hiccup do provider,
    // pedido que depende de ler site/PDF — Specs 05/06 não implementadas)
    // caía no catch genérico da rota e virava 500 — nunca aceitável pra um
    // pedido válido. Agora vira sempre 200 com mensagem amigável, igual a
    // qualquer outra falha parcial do fluxo.
    let brief: string;
    try {
      brief = await generateDesignBrief(
        prompt,
        identity,
        rules,
        provider,
        settings.DESIGN_AGENT_LLM_TEMPERATURE,
        settings.DESIGN_AGENT_LLM_MAX_TOKENS,
        settings.DESIGN_AGENT_LLM_MODEL
      );
    } catch (briefError: unknown) {
      const briefErrorMessage = briefError instanceof Error ? briefError.message : String(briefError);
      logger.warning(`[Design Agent] Falha ao gerar o Design Brief — respondendo com fallback amigável, não 500: ${briefErrorMessage}`);
      await agentRepository.saveMessage(session_id, 'user', prompt);
      await agentRepository.saveMessage(session_id, 'assistant', BRIEF_FAILURE_FALLBACK_MESSAGE);
      return res.status(200).json({ success: true, message: BRIEF_FAILURE_FALLBACK_MESSAGE });
    }

    const history = await agentRepository.getConversationHistory(session_id);
    const formattedHistory = history.map((msg: { role: string; content: string }) => ({ role: msg.role, content: msg.content }));

    const chatPrompt =
      `${GLOBAL_SYSTEM_CONSTRAINTS}\n\n` +
      `[AGENT IDENTITY]\n${identity}\n\n` +
      `[REGRA ABSOLUTA DESTA CHAMADA]\n` +
      `Você está respondendo SOMENTE o texto que o usuário vai ler no chat. É TERMINANTEMENTE PROIBIDO:\n` +
      `- Incluir qualquer JSON, chave de configuração, ou valor de token na sua resposta.\n` +
      `- Usar colchetes \`[\` \`]\` ou chaves \`{\` \`}\` na resposta.\n` +
      `- Listar nomes de propriedades técnicas (ex: "primaryColor", "cardBorderRadius").\n\n` +
      `Responda em 1-3 frases, tom natural, confirmando o que você entendeu do pedido e o que você\n` +
      `está aplicando (sem detalhar valores técnicos) — o [DESIGN BRIEF] abaixo é o entendimento já\n` +
      `traduzido do pedido, use-o pra confirmar com mais naturalidade. Se o pedido não fizer sentido\n` +
      `ou não puder ser atendido, explique brevemente por quê — ainda sem JSON.\n\n` +
      `[DESIGN BRIEF]\n${brief}\n\n` +
      `[STRICT GUARDRAILS]\n${rules}`;

    // Etapa 1 (Chat, em paralelo com a Etapa 2) + Etapa 2 (6 fatias, cada uma
    // em paralelo entre si dentro de `generateThemeSlices`). Nenhuma fatia
    // falhando derruba as demais (Regra 4 da Spec 03) — ver theme_orchestrator.ts.
    const [rawChatResult, sliceOutcome] = await Promise.all([
      provider.generateResponse(
        chatPrompt,
        [...formattedHistory, { role: 'user', content: prompt }],
        settings.DESIGN_AGENT_LLM_TEMPERATURE,
        settings.DESIGN_AGENT_LLM_MAX_TOKENS,
        settings.DESIGN_AGENT_LLM_MODEL
      ),
      generateThemeSlices({
        scaffold,
        brief,
        mode: themeMode,
        baseTheme: themeMode === 'patch' ? base_theme : undefined,
        provider,
        identity,
        rules,
        temperature: 0.1,
        maxTokens: settings.DESIGN_AGENT_LLM_MAX_TOKENS,
        model: settings.DESIGN_AGENT_LLM_MODEL,
      }),
    ]);

    const endMs = performance.now();
    const latencyMs = Math.round(endMs - startMs);
    console.log(`[Design Agent] Brief + preenchimento fatiado (7 chamadas) concluído em ${latencyMs}ms`);

    // Defesa em profundidade do Critério 2 da Spec 03 (a correção primária é o
    // prompt — Chamada A + `rules.md` — este guard é o cinto de segurança pra
    // quando o modelo desobedece mesmo assim). Nunca salva/devolve o cru.
    const chatResult = sanitizeChatMessage(rawChatResult);

    await agentRepository.saveMessage(session_id, 'user', prompt);
    await agentRepository.saveMessage(session_id, 'assistant', chatResult);

    const responsePayload = await assembleAgentResponse(chatResult, sliceOutcome, session_id);
    return res.status(200).json(responsePayload);


  } catch (error: unknown) {
    if (error instanceof SecurityViolationError) {
      return res.status(400).json({ error: error.message });
    }
    const message = error instanceof Error ? error.message : 'Erro interno desconhecido.';
    if (message.includes('SECURITY_VIOLATION')) {
      return res.status(422).json({ error: 'LLM sugeriu um valor fora do catálogo (alucinação detectada).', details: message });
    }
    return res.status(500).json({ error: 'Erro interno', details: message });
  }
});
