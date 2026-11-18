import React from 'react';
import { BarSample } from './BarSample';
import { CollapsibleSection } from './CollapsibleSection';
import { DecisionTokenList, type ColumnTokenProps } from './DecisionTokenList';
import { NavigationSwitchControl } from './NavigationSwitchControl';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { DecisionQuestion } from '../../utils/decisions';

interface DecisionQuestionListProps extends ColumnTokenProps {
    questions: readonly DecisionQuestion[];
    mode: 'light' | 'dark';
}

/**
 * O nível 2 da decisão Barras, por pergunta — onde fica, como é, o que aparece, marca, comportamento. Cada
 * pergunta, recolhida até o usuário abri-la, traz a amostra real da barra e os controles que a respondem, então quem nunca abriu o painel acha cada
 * ajuste sem usar a busca.
 */
export const DecisionQuestionList: React.FC<DecisionQuestionListProps> = ({ questions, mode, ...tokenProps }) => {
    const text = useLibraryText();
    return (
        <>
            {questions.map((question) => (
                <CollapsibleSection key={question.id} title={text(question.textKey)} toggleId={`question-${question.id}`} sectionProps={{ 'data-decision-question': question.id }}>
                    <BarSample draft={tokenProps.draft} mode={mode} />
                    {question.control === 'navigationSwitch' && <NavigationSwitchControl draft={tokenProps.draft} updateDraft={tokenProps.updateDraft} />}
                    <DecisionTokenList tokens={question.tokens} {...tokenProps} />
                </CollapsibleSection>
            ))}
        </>
    );
};

export default DecisionQuestionList;
