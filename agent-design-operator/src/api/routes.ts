import { Router, Request, Response } from 'express';
import { processThemeUpdate } from '../toolbox/theme_writer.js';
import { buildCatalogPromptBlock } from '../toolbox/catalog_prompt.js';
import { agentRepository } from '../database/repository.js';
import { loadAgentAssets } from '../utils/file_loader.js';
import { GLOBAL_SYSTEM_CONSTRAINTS } from '../config/shared/global_prompts.js';
import { settings } from '../config/shared/settings.js';
import { ProviderFactory } from '../core/providers/provider_factory.js';
import { TriggerExtractor } from '../core/parser/trigger_extractor.js';
import { InputValidator, SecurityViolationError } from '../core/security/input_validator.js';

export const routes = Router();

const DESIGN_AGENT_ID = 'design-operator';

routes.post('/prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, session_id } = req.body;

    if (!prompt || !session_id) {
      return res.status(400).json({ error: 'Faltam campos (prompt ou session_id) no corpo da requisição.' });
    }

    InputValidator.sanitizeInput(prompt);

    if (!settings.DESIGN_AGENT_LLM_PROVIDER || !settings.DESIGN_AGENT_LLM_MODEL) {
      return res.status(500).json({
        error: 'Design Agent sem provider/model configurados. O sistema importador precisa definir DESIGN_AGENT_LLM_PROVIDER e DESIGN_AGENT_LLM_MODEL no ambiente — o módulo não escolhe isso sozinho.',
      });
    }

    const [config, identity, , , rules] = loadAgentAssets(DESIGN_AGENT_ID);

    const systemPrompt =
      `${GLOBAL_SYSTEM_CONSTRAINTS}\n\n` +
      `[AGENT IDENTITY]\n${identity}\n\n` +
      `${buildCatalogPromptBlock()}\n\n` +
      `[STRICT GUARDRAILS]\n${rules}`;

    const history = await agentRepository.getConversationHistory(session_id);
    const formattedHistory = history.map((msg: { role: string; content: string }) => ({ role: msg.role, content: msg.content }));

    await agentRepository.saveMessage(session_id, 'user', prompt);

    const provider = ProviderFactory.getProvider(settings.DESIGN_AGENT_LLM_PROVIDER);
    const rawResponse = await provider.generateResponse(
      systemPrompt,
      [...formattedHistory, { role: 'user', content: prompt }],
      settings.DESIGN_AGENT_LLM_TEMPERATURE,
      settings.DESIGN_AGENT_LLM_MAX_TOKENS,
      settings.DESIGN_AGENT_LLM_MODEL
    );

    const [cleanMessage, actions] = TriggerExtractor.extractTriggers(rawResponse, config.triggers);
    await agentRepository.saveMessage(session_id, 'assistant', cleanMessage);

    const themeUpdateAction = actions.find(action => action.type === 'THEME_UPDATE');
    if (!themeUpdateAction) {
      return res.status(200).json({ success: true, message: cleanMessage });
    }

    let rawPayload: Record<string, unknown>;
    try {
      rawPayload = JSON.parse(themeUpdateAction.data.payload);
    } catch {
      return res.status(422).json({ error: 'O agente emitiu um [THEME_UPDATE] com JSON inválido.', message: cleanMessage });
    }

    const validatedPayload = await processThemeUpdate(rawPayload, session_id);

    return res.status(200).json({
      success: true,
      message: cleanMessage,
      payload: validatedPayload,
    });

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
