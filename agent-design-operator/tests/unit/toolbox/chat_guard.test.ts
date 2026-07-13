import { describe, it, expect } from 'vitest';
import { sanitizeChatMessage } from '../../../src/toolbox/chat_guard.js';

describe('sanitizeChatMessage', () => {
  it('deve deixar passar uma mensagem limpa, sem alterar nada', () => {
    const clean = 'Entendido, deixando o tema mais escuro com acentos neon.';
    expect(sanitizeChatMessage(clean)).toBe(clean);
  });

  it('deve neutralizar uma mensagem que vaza o marcador [THEME_UPDATE morto pela Spec 03', () => {
    const leaking = 'Criei um tema para você [THEME_UPDATE: {"primaryColor": "#000"}]';
    const result = sanitizeChatMessage(leaking);
    expect(result).not.toContain('[THEME_UPDATE');
    expect(result).not.toContain('{');
    expect(result).not.toContain('primaryColor');
  });

  it('deve neutralizar uma mensagem com bloco JSON cru, mesmo sem o marcador [THEME_UPDATE', () => {
    const leaking = 'Apliquei estes valores: {"cardBorderRadius": 4, "primaryColor": "#00f2ff"}';
    const result = sanitizeChatMessage(leaking);
    expect(result).not.toContain('{');
    expect(result).not.toContain('}');
  });

  it('deve neutralizar uma mensagem que só cita um nome de token camelCase composto, sem chaves nem colchetes', () => {
    const leaking = 'Ajustei o cardBorderRadius para deixar mais arredondado.';
    const result = sanitizeChatMessage(leaking);
    expect(result).not.toContain('cardBorderRadius');
  });

  it('NÃO deve neutralizar uma mensagem legítima que usa palavras comuns/empréstimos que também são ids de token de uma palavra só (ex: "layout", "mode")', () => {
    const legitimate = 'Vou aplicar um layout mais compacto e mudar o mode do sistema.';
    expect(sanitizeChatMessage(legitimate)).toBe(legitimate);
  });

  it('deve retornar sempre a mesma mensagem neutra, nunca ecoar nenhum fragmento do texto vazado', () => {
    const leaking1 = '[THEME_UPDATE: {"mode": "dark"}]';
    const leaking2 = '{"badgeRadius": 99}';
    const result1 = sanitizeChatMessage(leaking1);
    const result2 = sanitizeChatMessage(leaking2);
    expect(result1).toBe(result2);
    expect(result1.length).toBeGreaterThan(0);
  });
});
