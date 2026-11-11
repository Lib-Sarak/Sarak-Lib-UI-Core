import type { Severity } from './types';

/**
 * O catálogo das regras do kit: qual porta roda cada uma e a severidade proposta. Fonte única do
 * `sarak-ui verify --list`, do plugin e dos testes de paridade. Todas nascem DESLIGADAS: o importador
 * liga uma a uma, e o conjunto `recommended` só recebe a regra que a medição nos importadores aprovar.
 */
export type RulePort = 'plugin' | 'comando' | 'ambas';

export interface RuleInfo {
    port: RulePort;
    severity: Severity;
    summary: string;
}

export const RULE_CATALOG: Readonly<Record<string, RuleInfo>> = {
    'single-entrypoint': { port: 'ambas', severity: 'error', summary: 'a lib só se importa/declara na porta única do projeto (opção `allow`)' },
    'no-deep-import': { port: 'plugin', severity: 'error', summary: 'import de caminho fora do `exports` da lib' },
    'known-css-var': { port: 'ambas', severity: 'error', summary: '`var(--sarak-*)` fora das variáveis públicas do catálogo' },
    'prefer-sarak-component': { port: 'plugin', severity: 'error', summary: 'elemento nativo que tem componente equivalente na lib' },
    'no-reimplemented-piece': { port: 'plugin', severity: 'warn', summary: 'peça local com o nome de uma peça pública da lib' },
    'no-literal-color-font': { port: 'ambas', severity: 'warn', summary: 'cor ou fonte literal, fora de `var()` com reserva' },
    'no-direct-wrapped-lib': { port: 'plugin', severity: 'warn', summary: 'import direto de biblioteca que a lib já encapsula' },
    'no-internal-class-selector': { port: 'ambas', severity: 'error', summary: 'seletor por classe interna da lib' },
    'valid-spacing-value': { port: 'plugin', severity: 'error', summary: 'espaçamento que não é token nem comprimento CSS' },
    'kit-in-sync': { port: 'comando', severity: 'warn', summary: 'a cópia do kit no importador difere do pacote instalado' },
    'pinned-install': { port: 'comando', severity: 'error', summary: 'a lib não está fixada numa tag exata (`#vX.Y.Z`)' },
    'known-icon-name': { port: 'plugin', severity: 'error', summary: 'nome de ícone literal que a lib não conhece' },
    'known-theme-id': { port: 'plugin', severity: 'warn', summary: 'id de tema ou de paleta literal que a lib não conhece' },
};
