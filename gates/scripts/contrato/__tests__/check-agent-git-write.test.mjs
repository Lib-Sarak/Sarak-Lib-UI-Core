// @vitest-environment node
// Self-test da trava de escrita no Git por sessão de agente. A decisão recebe o
// ambiente por parâmetro, então cada caso é uma fixture — nada depende do
// ambiente de quem roda a suíte (que, num agente, carrega os três marcadores).
import { describe, expect, it } from 'vitest';
import { AGENT_SESSION_MARKERS, AUTHORIZATION_VAR, decideAgentGitWrite } from '../check-agent-git-write.mjs';

describe('decideAgentGitWrite', () => {
    it('ambiente limpo libera', () => {
        expect(decideAgentGitWrite({})).toEqual({ blocked: false, markers: [] });
    });

    it.each(AGENT_SESSION_MARKERS)('o marcador %s sozinho bloqueia', (marcador) => {
        expect(decideAgentGitWrite({ [marcador]: '1' })).toEqual({ blocked: true, markers: [marcador] });
    });

    it('marcador com autorização libera', () => {
        const env = { CLAUDECODE: '1', AI_AGENT: 'claude-code', [AUTHORIZATION_VAR]: '1' };
        expect(decideAgentGitWrite(env).blocked).toBe(false);
    });

    it('autorização sem marcador libera', () => {
        expect(decideAgentGitWrite({ [AUTHORIZATION_VAR]: '1' }).blocked).toBe(false);
    });

    it('marcador vazio não identifica sessão de agente', () => {
        expect(decideAgentGitWrite({ CLAUDECODE: '' }).blocked).toBe(false);
    });

    it('autorização vazia não autoriza', () => {
        expect(decideAgentGitWrite({ CLAUDECODE: '1', [AUTHORIZATION_VAR]: '' }).blocked).toBe(true);
    });

    it('lista de marcadores é exatamente os três medidos', () => {
        expect([...AGENT_SESSION_MARKERS].sort()).toEqual(['AI_AGENT', 'CLAUDECODE', 'CLAUDE_CODE_SESSION_ID']);
    });
});
