import { Router, Request, Response } from 'express';
import { processThemeUpdate } from '../toolbox/theme_writer.js';
import { agentRepository } from '../database/repository.js';

export const routes = Router();

routes.post('/themes/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, session_id } = req.body;
    
    if (!prompt || !session_id) {
      return res.status(400).json({ error: 'Faltam campos (prompt ou session_id) no corpo da requisição.' });
    }

    // Salva a intenção do usuário no BD do agente
    await agentRepository.saveMessage(session_id, 'user', prompt);

    /* 
      Aqui invocaríamos o motor LLM do Template-Ts:
      const llmOutput = await llmEngine.invoke(prompt, config);
    */
    
    // Simulação do parse do LLM extraído da tag [THEME_UPDATE]:
    const mockLlmOutput = {
      "cardLayoutDirection": "row",
      "--sx-color-primary": "#123456"
    };

    // A Toolbox Action intercepta, valida (Anti-Alucinação) e persiste no UI-Core
    await processThemeUpdate(mockLlmOutput, session_id);

    // Salva a resposta da LLM
    await agentRepository.saveMessage(session_id, 'assistant', JSON.stringify(mockLlmOutput));

    return res.status(200).json({ 
      success: true, 
      message: 'Tema gerado pelo Agente e sincronizado com a UI-Core',
      applied_payload: mockLlmOutput 
    });
    
  } catch (error: any) {
    if (error.message.includes('SECURITY_VIOLATION')) {
      // Retorna 422 para sinalizar a quebra de contrato. No futuro, isso aciona Auto-Healing.
      return res.status(422).json({ error: 'LLM alucinou chaves inválidas', details: error.message });
    }
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
});
