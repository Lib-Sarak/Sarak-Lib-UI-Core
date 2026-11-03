import React, { useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakBadge } from '../Feedback/SarakBadge';
import { SarakAlert } from '../Feedback/SarakAlert';
import { SarakFlex } from '../Layouts/SarakFlex';
import { SarakLink } from '../Navigation/SarakLink';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { SarakSection } from './SarakSection';
import { useSarakUnsavedChanges, type SarakUnsavedChangesControl } from './hooks/useSarakUnsavedChanges';

export interface SarakSettingsSection {
    id: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    content: React.ReactNode;
    /** Marca a seção como alterada no índice e no cabeçalho, com texto além da cor. */
    dirty?: boolean;
}

export interface SarakSettingsPageProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
    title: React.ReactNode;
    description?: React.ReactNode;
    sections: SarakSettingsSection[];
    /** Há rascunho diferente do que está salvo. */
    isDirty: boolean;
    saving?: boolean;
    /** Falha do último salvamento; aparece acima da barra. */
    saveError?: React.ReactNode;
    onSave: () => void;
    onDiscard: () => void;
    /** Recebe o `confirmLeave` do aviso de alterações; ligue-o ao bloqueio de rota do host. */
    onUnsavedChangesControl?: (control: SarakUnsavedChangesControl) => void;
}

const SECTION_SCROLL_OFFSET_STYLE: React.CSSProperties = { scrollMarginTop: 'var(--sarak-layout-gap-lg, 24px)' };

const SectionIndex = ({ sections, activeId, onGo, label, dirtyLabel }: {
    sections: SarakSettingsSection[];
    activeId: string | undefined;
    onGo: (id: string) => void;
    label: string;
    dirtyLabel: string;
}): React.ReactElement => (
    <nav aria-label={label} style={{ position: 'sticky', top: 'var(--sarak-layout-gap-md, 16px)', alignSelf: 'start' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)' }}>
            {sections.map((section) => (
                <li key={section.id}>
                    <SarakLink
                        href={`#${section.id}`}
                        aria-current={activeId === section.id ? 'location' : undefined}
                        onNavigate={() => onGo(section.id)}
                        style={activeId === section.id ? { fontWeight: 'bold' } : undefined}
                    >
                        <span>{section.title}{section.dirty && ` (${dirtyLabel})`}</span>
                    </SarakLink>
                </li>
            ))}
        </ul>
    </nav>
);

/**
 * Página de configurações com rascunho: índice de seções, seções em cartão e barra salvar/descartar sempre à vista.
 * A lib não guarda o rascunho nem grava: `isDirty`, `onSave` e `onDiscard` são do host. O aviso de saída com
 * alterações vem de `useSarakUnsavedChanges`.
 */
export const SarakSettingsPage = ({
    title, description, sections, isDirty, saving = false, saveError, onSave, onDiscard, onUnsavedChangesControl, className, ...props
}: SarakSettingsPageProps): React.ReactElement => {
    const text = useLibraryText();
    const [activeId, setActiveId] = useState<string | undefined>(sections[0]?.id);
    const unsaved = useSarakUnsavedChanges({ isDirty });
    // O callback fica atrás de um ref: um closure inline do host não deve reentregar o controle a cada render.
    const controlRef = useRef(onUnsavedChangesControl);
    controlRef.current = onUnsavedChangesControl;
    useEffect(() => { controlRef.current?.({ confirmLeave: unsaved.confirmLeave }); }, [unsaved.confirmLeave]);

    const goTo = (id: string): void => {
        setActiveId(id);
        const target = document.getElementById(id);
        target?.scrollIntoView?.({ block: 'start' });
        target?.focus({ preventScroll: true });
    };

    return (
        <section {...props} className={mergeSarakClasses('sarak-settings-page @container w-full', className)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--sarak-layout-gap-lg, 24px)', ...props.style }}>
            <header>
                <h1 style={{ margin: 0 }}>{title}</h1>
                {description !== undefined && <p className="text-theme-muted" style={{ margin: 0 }}>{description}</p>}
            </header>
            <SarakFlex gap="spacing-lg" align="flex-start">
                <div style={{ flex: '0 1 24ch', minWidth: 0 }}>
                    <SectionIndex sections={sections} activeId={activeId} onGo={goTo} label={text('settingsSections')} dirtyLabel={text('settingsSectionDirty')} />
                </div>
                <SarakFlex direction="column" gap="spacing-lg" wrap={false} style={{ flex: '1 1 48ch', minWidth: 0 }}>
                    {sections.map((section) => (
                        <SarakSection
                            key={section.id}
                            id={section.id}
                            tabIndex={-1}
                            variant="card"
                            headingLevel={2}
                            style={SECTION_SCROLL_OFFSET_STYLE}
                            title={<>{section.title}{section.dirty && <> <SarakBadge variant="warning" showStatusShape>{text('settingsSectionDirty')}</SarakBadge></>}</>}
                            description={section.description}
                        >
                            {section.content}
                        </SarakSection>
                    ))}
                </SarakFlex>
            </SarakFlex>
            {saveError && <SarakAlert variant="error" title={text('settingsSaveFailed')} message={saveError} />}
            <div
                role="region"
                aria-label={text('settingsActions')}
                style={{
                    position: 'sticky', bottom: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                    gap: 'var(--sarak-layout-gap-md, 16px)', padding: 'var(--sarak-layout-gap-md, 16px)',
                    background: 'var(--theme-surface)', borderTop: 'var(--sarak-border-width, 1px) solid var(--theme-border)',
                }}
            >
                <span role="status" className="text-theme-text">
                    <span aria-hidden="true">{isDirty ? '▲ ' : '● '}</span>{text(isDirty ? 'settingsUnsaved' : 'settingsUpToDate')}
                </span>
                <SarakFlex align="center" gap="spacing-sm">
                    <SarakButton type="button" variant="ghost" disabled={!isDirty || saving} onClick={onDiscard}>{text('settingsDiscard')}</SarakButton>
                    <SarakButton type="button" variant="primary" disabled={!isDirty} isLoading={saving} onClick={onSave}>{text(saving ? 'settingsSaving' : 'settingsSave')}</SarakButton>
                </SarakFlex>
            </div>
        </section>
    );
};
