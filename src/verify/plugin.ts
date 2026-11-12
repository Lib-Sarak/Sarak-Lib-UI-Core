import { elementRules } from './rules/elements';
import { importRules } from './rules/imports';
import { nameRules } from './rules/names';
import { styleRules } from './rules/styles';
import type { RuleModule } from './rules/kit';

/**
 * O plugin de ESLint do kit de verificação. Cada regra nasce DESLIGADA: o importador a liga pelo
 * nome, com a severidade que quiser. O `recommended` só recebe a regra que a medição nos importadores
 * reais aprovou (lista abaixo, com o motivo de cada ausência).
 */
export const rules: Record<string, RuleModule> = {
    ...importRules,
    ...styleRules,
    ...elementRules,
    ...nameRules,
};

const plugin = { rules, configs: {} as Record<string, unknown> };

/**
 * As regras sem falso positivo medido no ERP e nos dois logins, e que não pedem opção do importador. Ficam
 * de fora, cada uma pelo motivo medido: `prefer-sarak-component` e `no-literal-color-font` acusam cópia do
 * kit, dublê de teste e documento (pedem `allow`); `no-reimplemented-piece` é heurística de nome;
 * `no-direct-wrapped-lib` não teve ocorrência para medir; `single-entrypoint` e `known-theme-id` exigem opção.
 */
const RECOMMENDED = ['no-deep-import', 'known-css-var', 'no-internal-class-selector', 'valid-spacing-value', 'known-icon-name'] as const;

plugin.configs.recommended = {
    name: 'sarak/recommended',
    plugins: { sarak: plugin },
    rules: Object.fromEntries(RECOMMENDED.map((id) => [`sarak/${id}`, 'error'])),
};

export default plugin;
