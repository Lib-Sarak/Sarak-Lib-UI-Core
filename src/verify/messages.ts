import type { LiteralKind } from './detect/literals';
import { closestCssVars, formatSuggestions } from './suggest';
import type { VerificationData } from './types';

/**
 * Texto dos achados que as DUAS portas dizem igual (plugin e comando). Mensagens em português,
 * porque são ferramenta do desenvolvedor do importador e ficam fora do catálogo de idiomas da UI.
 * O nome público da lib aparece só como substituto do que está errado.
 */

export const unknownCssVarMessage = (name: string, data: VerificationData): string => {
    const near = closestCssVars(name, data.cssVars);
    const hint = near.length > 0 ? formatSuggestions(near) : ' A lista completa está em `sarak-ui/catalog.json › tokens.cssVars`.';
    return `\`${name}\` não é variável pública da lib: o \`var()\` cai no valor de reserva sem aviso e a tela sai do tema.${hint}`;
};

export const literalMessage = (kind: LiteralKind, property: string): string =>
    kind === 'cor'
        ? `Cor literal em \`${property}\`: use uma variável do tema, \`var(--sarak-…, reserva)\` (a reserva dentro do \`var()\` é aceita).`
        : `Família de fonte literal em \`${property}\`: use a fonte do tema (\`var(--sarak-…)\`) em vez de nomeá-la aqui.`;

export const internalSelectorMessage = (selector: string): string =>
    `\`${selector}\` mira uma classe interna da lib, que muda sem aviso. Use um alvo estável do contrato (\`data-testid\`, \`data-theme-id\`, papel ARIA) ou uma variável \`--sarak-*\` pública.`;
