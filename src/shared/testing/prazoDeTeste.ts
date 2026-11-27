// Porta única do prazo próprio de um teste (caso, gancho ou `vi.setConfig`).
//
// Prazo declarado no próprio teste vence a flag `--testTimeout` da linha de comando, então o
// caminho da release (que roda a suíte com prazo maior para não reprovar por máquina carregada)
// não o alcançaria. Aqui o prazo declarado vira "o maior entre ele e o da release": fora da
// release a variável não existe e vale o que o teste declarou.

export const RELEASE_TIMEOUT_ENV = 'RELEASE_TEST_TIMEOUT_MS';

export function prazoDeTeste(declaredMs: number, env: Record<string, string | undefined> = process.env): number {
    const releaseMs = Number(env[RELEASE_TIMEOUT_ENV]);
    return Number.isFinite(releaseMs) && releaseMs > declaredMs ? releaseMs : declaredMs;
}
