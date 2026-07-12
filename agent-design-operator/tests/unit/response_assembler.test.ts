import { describe, it, expect, vi } from 'vitest';
import { assembleAgentResponse } from '../../src/toolbox/response_assembler.js';
import * as themeWriter from '../../src/toolbox/theme_writer.js';

describe('assembleAgentResponse', () => {
  const sessionId = 'test-session';
  const chatMessage = 'Entendi, aplicando cor azul.';

  it('deve combinar message (A) e payload (B) no caminho feliz', async () => {
    const actionResult = '{"primaryColor": "#0000ff"}';
    const mockProcessThemeUpdate = vi.spyOn(themeWriter, 'processThemeUpdate').mockResolvedValue({
      primaryColor: '#0000ff'
    });

    const result = await assembleAgentResponse(chatMessage, actionResult, sessionId);

    expect(result).toEqual({
      success: true,
      message: chatMessage,
      payload: { primaryColor: '#0000ff' }
    });

    mockProcessThemeUpdate.mockRestore();
  });

  it('deve retornar só message quando B devolve NENHUMA_ALTERACAO', async () => {
    const actionResult = 'NENHUMA_ALTERACAO';

    const result = await assembleAgentResponse(chatMessage, actionResult, sessionId);

    expect(result).toEqual({
      success: true,
      message: chatMessage
    });
    expect(result.payload).toBeUndefined();
  });

  it('deve retornar mensagem de fallback quando B devolve JSON inválido', async () => {
    const actionResult = 'isso não é json';

    const result = await assembleAgentResponse(chatMessage, actionResult, sessionId);

    expect(result.success).toBe(true);
    expect(result.message).toContain(chatMessage);
    expect(result.message).toContain('não consegui aplicar as alterações');
    expect(result.payload).toBeUndefined();
  });

  it('deve retornar mensagem de fallback quando B reprova na validação', async () => {
    const actionResult = '{"primaryColor": "invalid"}';
    const mockProcessThemeUpdate = vi.spyOn(themeWriter, 'processThemeUpdate').mockRejectedValue(new Error('Validation failed'));

    const result = await assembleAgentResponse(chatMessage, actionResult, sessionId);

    expect(result.success).toBe(true);
    expect(result.message).toContain(chatMessage);
    expect(result.message).toContain('não consegui aplicar as alterações');
    expect(result.payload).toBeUndefined();

    mockProcessThemeUpdate.mockRestore();
  });

  it('deve retornar mensagem de fallback quando actionResult não é string (falha do LLM)', async () => {
    const actionResult = null; // simulando erro onde provedor não retorna string

    const result = await assembleAgentResponse(chatMessage, actionResult, sessionId);

    expect(result.success).toBe(true);
    expect(result.message).toContain(chatMessage);
    expect(result.message).toContain('não consegui aplicar as alterações');
    expect(result.payload).toBeUndefined();
  });
});
