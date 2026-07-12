import { processThemeUpdate } from './theme_writer.js';

export interface AgentResponse {
  success: boolean;
  message: string;
  payload?: Record<string, unknown>;
}

/**
 * Monta a resposta final do Design Agent combinando o resultado do chat (Chamada A)
 * com o resultado de ação/JSON (Chamada B).
 *
 * Respeita a Regra 4 da Spec 03: nunca vaza o JSON cru pro usuário, nem quando
 * o JSON está malformado, retornando um fallback amigável.
 * Trata o caso onde actionResult pode não ser uma string (ex: provedor falhou e retornou undefined).
 */
export async function assembleAgentResponse(
  chatResult: string,
  actionResult: unknown,
  sessionId: string
): Promise<AgentResponse> {
  // A3: Fallback se a borda da Chamada B não for string
  if (typeof actionResult !== 'string') {
    return {
      success: true,
      message: `${chatResult}\n\n(não consegui aplicar as alterações — pode tentar reformular?)`,
    };
  }

  const trimmedAction = actionResult.trim();

  // (b) Retorna só message quando B devolve NENHUMA_ALTERACAO
  if (trimmedAction === 'NENHUMA_ALTERACAO') {
    return { success: true, message: chatResult };
  }

  let rawPayload: Record<string, unknown>;
  try {
    rawPayload = JSON.parse(trimmedAction);
  } catch {
    // (c) Retorna mensagem de fallback quando B devolve JSON inválido
    return {
      success: true,
      message: `${chatResult}\n\n(não consegui aplicar as alterações — pode tentar reformular?)`,
    };
  }

  try {
    // (a) Monta resposta combinando message + payload no caminho feliz
    const validatedPayload = await processThemeUpdate(rawPayload, sessionId);
    return { success: true, message: chatResult, payload: validatedPayload };
  } catch (validationError) {
    // (c) Retorna fallback amigável se reprovado no ThemeValidator
    return {
      success: true,
      message: `${chatResult}\n\n(não consegui aplicar as alterações — pode tentar reformular?)`,
    };
  }
}
