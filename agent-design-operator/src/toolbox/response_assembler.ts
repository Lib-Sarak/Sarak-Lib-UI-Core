import { processThemeUpdate } from './theme_writer.js';
import type { ThemeOrchestrationResult } from './theme_orchestrator.js';

export interface AgentResponse {
  success: boolean;
  message: string;
  payload?: Record<string, unknown>;
}

/**
 * Monta a resposta final do Design Agent combinando o resultado do chat
 * (Chamada A) com o resultado já mesclado e validado por fatia do
 * preenchimento fatiado (Etapa 2 — `theme_orchestrator.ts`).
 *
 * Respeita a Regra 4 da Spec 03: nunca vaza JSON cru pro usuário, nem quando
 * a validação final falha, nem quando alguma fatia falhou — nesses casos o
 * usuário recebe só uma nota em linguagem natural (nome humano da(s)
 * fatia(s), nunca chave técnica ou erro cru).
 */
export async function assembleAgentResponse(
  chatResult: string,
  sliceOutcome: ThemeOrchestrationResult,
  sessionId: string
): Promise<AgentResponse> {
  let message = chatResult;
  let payload: Record<string, unknown> | undefined;

  if (sliceOutcome.payload) {
    try {
      // (a) Monta resposta combinando message + payload no caminho feliz.
      payload = await processThemeUpdate(sliceOutcome.payload, sessionId);
    } catch {
      // (b) Reprovado na validação final (defesa em profundidade — cada fatia
      // já foi validada isoladamente antes do merge) — fallback amigável.
      message = `${message}\n\n(não consegui aplicar as alterações — pode tentar reformular?)`;
    }
  }

  if (sliceOutcome.failedSliceLabels.length > 0) {
    // (c) Falha parcial de uma ou mais fatias (Regra 4 da Spec 03): aplica o
    // que passou, avisa por nome humano o que não foi aplicado.
    message = `${message}\n\n(algumas áreas do tema não puderam ser ajustadas desta vez: ${sliceOutcome.failedSliceLabels.join(', ')}. Pode tentar pedir essa parte separadamente.)`;
  }

  return { success: true, message, payload };
}
