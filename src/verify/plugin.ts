import { elementRules } from './rules/elements';
import { importRules } from './rules/imports';
import { nameRules } from './rules/names';
import { styleRules } from './rules/styles';
import type { RuleModule } from './rules/kit';

/**
 * O plugin de ESLint do kit de verificação. Cada regra nasce DESLIGADA: o importador a liga pelo
 * nome, com a severidade que quiser. O `recommended` só recebe a regra que a medição nos importadores
 * reais aprovar — até lá ele existe e está vazio, de propósito.
 */
export const rules: Record<string, RuleModule> = {
    ...importRules,
    ...styleRules,
    ...elementRules,
    ...nameRules,
};

const plugin = { rules, configs: {} as Record<string, unknown> };

plugin.configs.recommended = { name: 'sarak/recommended', plugins: { sarak: plugin }, rules: {} };

export default plugin;
