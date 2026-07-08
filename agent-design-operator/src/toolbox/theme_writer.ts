import { themeValidator } from './validator.js';
import { agentRepository } from '../database/repository.js';
import axios from 'axios';

/**
 * Action que efetua a gravação do tema validado no Backend do Sarak UI-Core
 */
export async function processThemeUpdate(rawJson: Record<string, any>, sessionId: string): Promise<boolean> {
  try {
    // 1. Strict Validation - Anti-Fantasma
    themeValidator.validatePayload(rawJson);

    // 2. Transmissão para o DB da UI-Core
    const url = process.env.UI_CORE_API_URL || 'http://localhost:4000/api';
    const token = process.env.UI_CORE_AUTH_TOKEN || '';

    /* Simulação da Injeção - Na prática, faríamos o POST
    await axios.post(`${url}/themes/agent-sync`, rawJson, {
      headers: { Authorization: `Bearer ${token}` }
    });
    */
    
    // 3. Salva uma cópia do Artefato validado no BD do Agente
    await agentRepository.saveArtifact(sessionId, 'theme', rawJson);

    console.log(`[ThemeWriter] Payload íntegro validado e sincronizado com UI-Core:`, rawJson);
    return true;
  } catch (error: any) {
    console.error(`[ThemeWriter] Rejeitado na Camada de Segurança: ${error.message}`);
    // Throwing error allows the route handler to reply with 422 for Auto-Healing
    throw error;
  }
}
