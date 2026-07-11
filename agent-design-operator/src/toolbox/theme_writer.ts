import { themeValidator } from './validator.js';
import { agentRepository } from '../database/repository.js';

/**
 * Valida o payload gerado pelo LLM contra o catálogo real e grava só um log de
 * auditoria do artefato (sessão do agente). NUNCA escreve na tabela de temas do
 * consumidor: a Sarak-Lib-UI-Core não hospeda servidor/DB próprio (Regra de Ouro do
 * módulo) — quem persiste de fato é o fluxo humano (`SaveThemeModal`) no app
 * consumidor, quando o usuário decidir salvar.
 */
export async function processThemeUpdate(rawJson: Record<string, unknown>, sessionId: string): Promise<Record<string, unknown>> {
  themeValidator.validatePayload(rawJson);

  await agentRepository.saveArtifact(sessionId, 'theme', rawJson);
  console.log(`[ThemeWriter] Payload íntegro validado para a sessão ${sessionId}:`, rawJson);

  return rawJson;
}
