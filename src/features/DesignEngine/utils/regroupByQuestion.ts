import type { SarakDesignToken } from '../../../core/Design/types';
import type { DecisionDef, DecisionSection } from './decisions';

/** Os ajustes finos que uma pergunta reclama (`fineMatch`) saem sob o título dela, na ordem das perguntas; o resto fica na categoria de origem. */
export const regroupByQuestion = (sections: DecisionSection[], def: DecisionDef): DecisionSection[] => {
    const matchers = (def.questions ?? []).filter((question) => question.fineMatch).map((question) => ({ question, pattern: new RegExp(question.fineMatch as string) }));
    if (matchers.length === 0) return sections;
    const claimed = new Map<string, SarakDesignToken[]>();
    const rest = sections.flatMap((section) => {
        const kept = section.tokens.filter((token) => {
            const owner = matchers.find(({ pattern }) => pattern.test(token.id));
            if (!owner) return true;
            claimed.set(owner.question.id, [...(claimed.get(owner.question.id) ?? []), token]);
            return false;
        });
        return kept.length > 0 ? [{ ...section, tokens: kept }] : [];
    });
    const byQuestion = matchers.flatMap(({ question }) => (claimed.has(question.id)
        ? [{ title: question.id, titleKey: question.textKey, tokens: claimed.get(question.id) as SarakDesignToken[] }]
        : []));
    return [...byQuestion, ...rest];
};

