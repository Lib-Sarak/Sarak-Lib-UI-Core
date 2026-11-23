import { describe, it, expect } from 'vitest';
import { regroupByQuestion } from '../regroupByQuestion';
import type { DecisionDef, DecisionSection } from '../decisions';
import type { SarakDesignToken } from '../../../../core/Design/types';

const token = (id: string): SarakDesignToken => ({ id, label: id, type: 'text', defaultValue: '' } as unknown as SarakDesignToken);
const def = (questions: DecisionDef['questions']): DecisionDef => ({ id: 'bars', textKey: 'decisionBars', pillars: [], groups: [], optionSections: [], screen: 'dashboard', screens: [], questions });
const sections: DecisionSection[] = [{ title: 'Geral', tokens: [token('sidebarBlur'), token('layoutPadding')] }];

describe('regroupByQuestion — o ajuste fino sai sob o título da pergunta que o reclama', () => {
    it('o token que casa com o fineMatch sai da categoria e vai para a pergunta; o resto fica', () => {
        const result = regroupByQuestion(sections, def([{ id: 'how', textKey: 'barQuestionHow', tokens: [], fineMatch: '^sidebar' }]));
        expect(result.map((section) => [section.title, section.tokens.map((item) => item.id)])).toEqual([['how', ['sidebarBlur']], ['Geral', ['layoutPadding']]]);
        expect(result[0].titleKey).toBe('barQuestionHow');
    });

    it('sem pergunta com fineMatch, devolve as seções como vieram', () => {
        expect(regroupByQuestion(sections, def([{ id: 'how', textKey: 'barQuestionHow', tokens: [] }]))).toBe(sections);
    });
});
