import React, { useContext } from 'react';
import { TokenControl } from './TokenControl';
import { UIContext } from '../../../../core/Provider/context';
import { useLibraryText, type LibraryTextFn } from '../../../../core/i18n/useLibraryText';
import { personalOverrideOf, requiredOrientationIfInactive, withEffectiveBounds, type PersonalOverride } from '../../utils/tokenNotes';
import type { SarakDesignToken, SarakTokenValue } from '../../../../core/Design/types';

const NOTE_CLASS = 'mt-1 flex flex-col items-start gap-1.5 text-[var(--sarak-type-scale-caption,12px)] normal-case tracking-normal text-[var(--theme-muted)]';
const ACTION_CLASS = 'shrink-0 rounded-md border border-[var(--theme-border)] px-2 py-0.5 font-semibold text-[var(--theme-primary)] hover:bg-theme-tint';

const SIZE_LETTER = { sm: 'P', md: 'M', lg: 'G' } as const;

/** O valor da preferência como o administrador o reconhece, e não o dado cru que o navegador gravou. */
const overrideLabel = ({ preference, value }: PersonalOverride, text: LibraryTextFn): string => {
    if (preference === 'navigationStyle') return text(value === 'topbar' ? 'tokenNoteValueTopbar' : 'tokenNoteValueSidebar');
    if (preference === 'fontSize') return SIZE_LETTER[value as keyof typeof SIZE_LETTER] ?? String(value);
    if (preference === 'colorMode') return text(value === 'system' ? 'tokenNoteValueSystem' : value === 'dark' ? 'previewModeDark' : 'previewModeLight');
    if (preference === 'navCollapsed') return text(value === true ? 'tokenNoteValueCollapsed' : 'tokenNoteValueExpanded');
    return `${value} px`;
};

interface DecisionTokenRowProps {
    token: SarakDesignToken;
    draft: Record<string, SarakTokenValue>;
    updateDraft: (id: string, value: SarakTokenValue) => void;
    previewDevice: string;
}

/**
 * Uma linha de controle de token, com o que o painel precisa dizer sobre ela: a preferência pessoal do administrador que está por
 * cima do tema (com a ação que a apaga), o controle que não vale com a navegação de hoje (desabilitado, com o motivo) e o intervalo
 * da largura da lateral. Sem a nota o painel parece não fazer nada, e o administrador conclui que o controle está quebrado.
 */
export const DecisionTokenRow: React.FC<DecisionTokenRowProps> = ({ token, draft, updateDraft, previewDevice }) => {
    const text = useLibraryText();
    const sarak = useContext(UIContext);
    const { token: shown, range } = withEffectiveBounds(token, draft, previewDevice);
    const override = personalOverrideOf(token.id, sarak?.storedPreferences ?? sarak?.preferences, draft);
    const inactiveFor = requiredOrientationIfInactive(token, draft);
    const noteId = `token-note-${token.id}`;

    return (
        <div data-token-row={token.id} tabIndex={-1} className="rounded-[var(--sarak-card-radius,10px)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]">
            <fieldset disabled={Boolean(inactiveFor)} aria-describedby={inactiveFor ? noteId : undefined} data-token-inactive={inactiveFor} className={`m-0 min-w-0 border-0 p-0 ${inactiveFor ? 'opacity-60' : ''}`}>
                <TokenControl
                    token={shown}
                    value={draft[token.id]}
                    onChange={(value) => updateDraft(token.id, value)}
                    previewDevice={previewDevice}
                    draft={draft}
                    updateDraft={updateDraft}
                />
            </fieldset>
            {range && <p data-testid="token-range-note" className={NOTE_CLASS}>{text('tokenNoteWidthRange', { min: range.min, max: range.max })}</p>}
            {inactiveFor && <p id={noteId} data-testid="token-inactive-note" className={NOTE_CLASS}>{text(inactiveFor === 'topbar' ? 'tokenNoteOnlyTopbar' : 'tokenNoteOnlySidebar')}</p>}
            {override && (
                <div role="status" data-testid="token-personal-note" className={NOTE_CLASS}>
                    <span>{text('tokenNotePersonal', { value: overrideLabel(override, text) })}</span>
                    <button type="button" className={ACTION_CLASS} onClick={() => sarak?.updatePreferences({ [override.preference]: undefined })}>
                        {text('tokenNotePersonalClear')}
                    </button>
                </div>
            )}
        </div>
    );
};
