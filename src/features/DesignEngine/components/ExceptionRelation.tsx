import React from 'react';
import { sarakGetAllDesignTokens } from '../../../core/Design/master-map';
import { isUndeclaredException } from '../../../core/Design/hooks/designVariableHelpers';
import { useLibraryLanguage, useLibraryText } from '../../../core/i18n/useLibraryText';
import { LIBRARY_TEXT_CATALOG, type LibraryTextKey, type SarakLibraryLanguage } from '../../../core/i18n/catalog';
import { decisionTokenTextKey } from '../../../core/i18n/catalogEntries.decisionTokens';
import type { SarakDesignToken, SarakTokenValue } from '../../../core/Design/types';

type DraftRecord = Record<string, SarakTokenValue | undefined>;

export interface ExceptionRelationInfo {
    role: 'master' | 'exception';
    /** Para `exception`: o mestre. Para `master`: ele mesmo. */
    master: SarakDesignToken;
    /** Exceções (cantos) que o rascunho declara, isto é, que NÃO seguem o mestre. */
    declared: SarakDesignToken[];
    /** Todas as exceções do mestre. */
    all: SarakDesignToken[];
}

let exceptionsByMaster: Map<string, SarakDesignToken[]> | null = null;
const getExceptionsByMaster = (): Map<string, SarakDesignToken[]> => {
    if (exceptionsByMaster) return exceptionsByMaster;
    exceptionsByMaster = new Map();
    for (const token of sarakGetAllDesignTokens()) {
        if (!token.exceptionOf) continue;
        exceptionsByMaster.set(token.exceptionOf, [...(exceptionsByMaster.get(token.exceptionOf) ?? []), token]);
    }
    return exceptionsByMaster;
};

const isDeclared = (token: SarakDesignToken, draft: DraftRecord): boolean =>
    !isUndeclaredException(draft[token.id], token.defaultValue);

/** A relação mestre × canto do token no rascunho, ou `null` se o token não participa de nenhuma. */
export function exceptionRelationOf(token: SarakDesignToken, draft: DraftRecord): ExceptionRelationInfo | null {
    if (token.exceptionOf) {
        const master = sarakGetAllDesignTokens().find((candidate) => candidate.id === token.exceptionOf);
        if (!master) return null;
        const all = getExceptionsByMaster().get(master.id) ?? [];
        return { role: 'exception', master, all, declared: all.filter((corner) => isDeclared(corner, draft)) };
    }
    const all = getExceptionsByMaster().get(token.id);
    if (!all || all.length === 0) return null;
    return { role: 'master', master: token, all, declared: all.filter((corner) => isDeclared(corner, draft)) };
}

interface ExceptionRelationProps {
    token: SarakDesignToken;
    draft: DraftRecord;
    updateDraft: (id: string, value: SarakTokenValue) => void;
}

const NOTE_CLASS = 'mb-3 -mt-1 flex items-center justify-between gap-2 text-[var(--sarak-type-scale-caption,12px)] normal-case tracking-normal text-[var(--theme-muted)]';
const ACTION_CLASS = 'shrink-0 rounded-md border border-[var(--theme-border)] px-2 py-0.5 font-semibold text-[var(--theme-primary)] hover:bg-theme-tint';

/** O nome do mestre no idioma do painel (o schema só o guarda em português); sem texto no idioma, vale o do schema. */
const masterLabelIn = (master: SarakDesignToken, language: SarakLibraryLanguage): string =>
    LIBRARY_TEXT_CATALOG[decisionTokenTextKey(master.id, 'name') as LibraryTextKey]?.[language] || master.label;

/**
 * Mostra, ao lado do controle de raio, a relação entre o mestre e o canto: o canto só vale quando declarado
 * (diferente do padrão do schema), e declarado ele ignora o mestre — mover o mestre não o move. A ação devolve o
 * canto ao padrão, que é o mestre voltar a mandar nele.
 */
export const ExceptionRelation: React.FC<ExceptionRelationProps> = ({ token, draft, updateDraft }) => {
    const text = useLibraryText();
    const language = useLibraryLanguage();
    const info = exceptionRelationOf(token, draft);
    if (!info) return null;
    const master = masterLabelIn(info.master, language);

    const giveBackToMaster = (corners: SarakDesignToken[]) => corners.forEach((corner) => updateDraft(corner.id, corner.defaultValue));

    if (info.role === 'exception') {
        const declared = info.declared.some((corner) => corner.id === token.id);
        if (!declared) {
            return <div data-testid="exception-relation" className={NOTE_CLASS}><span>{text('exceptionFollowsMaster', { master })}</span></div>;
        }
        return (
            <div data-testid="exception-relation" className={NOTE_CLASS}>
                <span>{text('exceptionOwnValue', { master })}</span>
                <button type="button" className={ACTION_CLASS} onClick={() => giveBackToMaster([token])}>{text('exceptionBackToMaster')}</button>
            </div>
        );
    }

    if (info.declared.length === 0) {
        return <div data-testid="exception-relation" className={NOTE_CLASS}><span>{text('exceptionGoverns', { total: info.all.length })}</span></div>;
    }
    return (
        <div data-testid="exception-relation" className={NOTE_CLASS}>
            <span>{text('exceptionDeclaredCount', { declared: info.declared.length, total: info.all.length })}</span>
            <button type="button" className={ACTION_CLASS} onClick={() => giveBackToMaster(info.declared)}>{text('exceptionAllBackToMaster')}</button>
        </div>
    );
};
