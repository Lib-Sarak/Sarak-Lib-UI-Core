import { describe, it, expect, vi } from 'vitest';
import { assembleAgentResponse } from '../../src/toolbox/response_assembler.js';
import * as themeWriter from '../../src/toolbox/theme_writer.js';
import type { ThemeOrchestrationResult } from '../../src/toolbox/theme_orchestrator.js';

describe('assembleAgentResponse', () => {
  const sessionId = 'test-session';
  const chatMessage = 'Entendi, aplicando cor azul.';

  it('deve combinar message (A) e payload (fatias mescladas e validadas) no caminho feliz', async () => {
    const sliceOutcome: ThemeOrchestrationResult = {
      payload: { primaryColor: '#0000ff' },
      failedSliceLabels: [],
    };
    const mockProcessThemeUpdate = vi.spyOn(themeWriter, 'processThemeUpdate').mockResolvedValue({
      primaryColor: '#0000ff'
    });

    const result = await assembleAgentResponse(chatMessage, sliceOutcome, sessionId);

    expect(result).toEqual({
      success: true,
      message: chatMessage,
      payload: { primaryColor: '#0000ff' }
    });

    mockProcessThemeUpdate.mockRestore();
  });

  it('deve retornar só message quando nenhuma fatia gerou payload (todas NENHUMA_ALTERACAO)', async () => {
    const sliceOutcome: ThemeOrchestrationResult = {
      payload: undefined,
      failedSliceLabels: [],
    };

    const result = await assembleAgentResponse(chatMessage, sliceOutcome, sessionId);

    expect(result).toEqual({
      success: true,
      message: chatMessage
    });
    expect(result.payload).toBeUndefined();
  });

  it('deve retornar mensagem de fallback quando a validação final (defesa em profundidade) reprova o merge', async () => {
    const sliceOutcome: ThemeOrchestrationResult = {
      payload: { primaryColor: 'invalid' },
      failedSliceLabels: [],
    };
    const mockProcessThemeUpdate = vi.spyOn(themeWriter, 'processThemeUpdate').mockRejectedValue(new Error('Validation failed'));

    const result = await assembleAgentResponse(chatMessage, sliceOutcome, sessionId);

    expect(result.success).toBe(true);
    expect(result.message).toContain(chatMessage);
    expect(result.message).toContain('não consegui aplicar as alterações');
    expect(result.payload).toBeUndefined();

    mockProcessThemeUpdate.mockRestore();
  });

  it('deve aplicar as fatias que passaram e avisar (por nome humano, nunca JSON/erro cru) quais fatias falharam', async () => {
    const sliceOutcome: ThemeOrchestrationResult = {
      payload: { primaryColor: '#0000ff' },
      failedSliceLabels: ['Atmosfera e Movimento'],
    };
    const mockProcessThemeUpdate = vi.spyOn(themeWriter, 'processThemeUpdate').mockResolvedValue({
      primaryColor: '#0000ff'
    });

    const result = await assembleAgentResponse(chatMessage, sliceOutcome, sessionId);

    expect(result.success).toBe(true);
    expect(result.payload).toEqual({ primaryColor: '#0000ff' });
    expect(result.message).toContain(chatMessage);
    expect(result.message).toContain('Atmosfera e Movimento');
    expect(result.message).not.toContain('{');
    expect(result.message).not.toContain('Error');

    mockProcessThemeUpdate.mockRestore();
  });

  it('deve retornar só message + aviso quando TODAS as fatias falharam (payload undefined)', async () => {
    const allSliceLabels = ['Fundações', 'Superfícies', 'Controles', 'Dados e Navegação', 'Atmosfera e Movimento', 'Especializados'];
    const sliceOutcome: ThemeOrchestrationResult = {
      payload: undefined,
      failedSliceLabels: allSliceLabels,
    };

    const result = await assembleAgentResponse(chatMessage, sliceOutcome, sessionId);

    expect(result.success).toBe(true);
    expect(result.payload).toBeUndefined();
    expect(result.message).toContain(chatMessage);
    allSliceLabels.forEach((label) => expect(result.message).toContain(label));
  });
});
