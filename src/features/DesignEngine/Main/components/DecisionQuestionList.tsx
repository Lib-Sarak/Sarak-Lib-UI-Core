import React from 'react';
import { BarSample } from './BarSample';
import { DecisionTokenList, type ColumnTokenProps } from './DecisionTokenList';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { DecisionQuestion } from '../../utils/decisions';

interface DecisionQuestionListProps extends ColumnTokenProps {
    questions: readonly DecisionQuestion[];
    mode: 'light' | 'dark';
}

/**
 * O nível 2 da decisão Layout, por pergunta — onde fica, como é, o que aparece, marca, comportamento. Cada
 * pergunta traz a amostra real da barra e os controles que a respondem, então quem nunca abriu o painel acha cada
 * ajuste sem usar a busca.
 */
export const DecisionQuestionList: React.FC<DecisionQuestionListProps> = ({ questions, mode, ...tokenProps }) => {
    const text = useLibraryText();
    return (
        <>
            {questions.map((question) => (
                <section
                    key={question.id}
                    aria-label={text(question.textKey)}
                    data-decision-question={question.id}
                    className="flex flex-col gap-3"
                >
                    <h3 className="text-xs font-semibold text-[var(--theme-muted)]">{text(question.textKey)}</h3>
                    <BarSample draft={tokenProps.draft} mode={mode} />
                    <DecisionTokenList tokens={question.tokens} {...tokenProps} />
                </section>
            ))}
        </>
    );
};

export default DecisionQuestionList;
