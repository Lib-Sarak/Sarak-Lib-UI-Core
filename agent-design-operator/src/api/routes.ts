import { Router, Request, Response } from 'express';
import { processThemeUpdate } from '../toolbox/theme_writer.js';
import { buildCatalogPromptBlock } from '../toolbox/catalog_prompt.js';
import { agentRepository } from '../database/repository.js';
import { loadAgentAssets } from '../utils/file_loader.js';
import { GLOBAL_SYSTEM_CONSTRAINTS } from '../config/shared/global_prompts.js';
import { settings } from '../config/shared/settings.js';
import { ProviderFactory } from '../core/providers/provider_factory.js';

import { InputValidator, SecurityViolationError } from '../core/security/input_validator.js';
import { assembleAgentResponse } from '../toolbox/response_assembler.js';

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

    const [, identity, , , rules] = loadAgentAssets(DESIGN_AGENT_ID);

    const chatPrompt =
      `${GLOBAL_SYSTEM_CONSTRAINTS}\n\n` +
      `[AGENT IDENTITY]\n${identity}\n\n` +
      `[REGRA ABSOLUTA DESTA CHAMADA]\n` +
      `Você está respondendo SOMENTE o texto que o usuário vai ler no chat. É TERMINANTEMENTE PROIBIDO:\n` +
      `- Incluir qualquer JSON, chave de configuração, ou valor de token na sua resposta.\n` +
      `- Usar colchetes \`[\` \`]\` ou chaves \`{\` \`}\` na resposta.\n` +
      `- Listar nomes de propriedades técnicas (ex: "primaryColor", "cardBorderRadius").\n\n` +
      `Responda em 1-3 frases, tom natural, confirmando o que você entendeu do pedido e o que você\n` +
      `está aplicando (sem detalhar valores técnicos). Se o pedido não fizer sentido ou não puder ser\n` +
      `atendido, explique brevemente por quê — ainda sem JSON.\n\n` +
      `[STRICT GUARDRAILS]\n${rules}`;

    const actionPrompt =
      `${GLOBAL_SYSTEM_CONSTRAINTS}\n\n` +
      `[AGENT IDENTITY]\n${identity}\n\n` +
      `[REGRA ABSOLUTA DESTA CHAMADA]\n` +
      `Sua resposta é consumida por um parser JSON, NUNCA por um humano. É TERMINANTEMENTE PROIBIDO:\n` +
      `- Escrever qualquer texto fora do JSON (sem saudação, sem explicação, sem markdown \`\`\`).\n` +
      `- Inventar uma chave que não está na lista de "TOKENS DISPONÍVEIS" abaixo.\n` +
      `- Devolver um objeto vazio {} se não houver nenhuma alteração a fazer — nesse caso devolva\n` +
      `  literalmente a string "NENHUMA_ALTERACAO" (sem JSON).\n\n` +
      `Sua resposta deve ser SOMENTE um objeto JSON válido, no formato:\n` +
      `{"nomeDoToken1": valor1, "nomeDoToken2": valor2}\n\n` +
      `Use SÓ chaves da lista abaixo. Cada uma mostra o tipo esperado do valor.\n\n` +
      `${buildCatalogPromptBlock()}\n\n` +
      `[STRICT GUARDRAILS]\n${rules}`;

    const history = await agentRepository.getConversationHistory(session_id);
    const formattedHistory = history.map((msg: { role: string; content: string }) => ({ role: msg.role, content: msg.content }));

    const provider = ProviderFactory.getProvider(settings.DESIGN_AGENT_LLM_PROVIDER);
    
    const startMs = performance.now();
    const [chatResult, actionResult] = await Promise.all([
      provider.generateResponse(
        chatPrompt,
        [...formattedHistory, { role: 'user', content: prompt }],
        settings.DESIGN_AGENT_LLM_TEMPERATURE,
        settings.DESIGN_AGENT_LLM_MAX_TOKENS,
        settings.DESIGN_AGENT_LLM_MODEL
      ),
      provider.generateResponse(
        actionPrompt,
        [{ role: 'user', content: prompt }],
        0.1,
        settings.DESIGN_AGENT_LLM_MAX_TOKENS,
        settings.DESIGN_AGENT_LLM_MODEL
      )
    ]);
    const endMs = performance.now();
    const latencyMs = Math.round(endMs - startMs);
    console.log(`[Design Agent] Dupla chamada concluída em ${latencyMs}ms`);

    await agentRepository.saveMessage(session_id, 'user', prompt);
    await agentRepository.saveMessage(session_id, 'assistant', chatResult);

    const responsePayload = await assembleAgentResponse(chatResult, actionResult, session_id);
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
