import { useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactElement } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakInput } from '../../Inputs/SarakInput';
import { SarakSelect } from '../../Inputs/SarakSelect';
import { SarakTableColumnPanel } from './SarakTableColumnPanel';
import type { SarakDataTableViewModel } from './useSarakDataTableViewModel';
import type { TableViews } from './useTableViews';

const BAR_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'var(--sarak-layout-gap-sm, 8px) 0' };

const SaveViewForm = ({ views, onDone }: { views: TableViews; onDone: () => void }): ReactElement => {
    const text = useLibraryText();
    const [name, setName] = useState('');
    const save = (): void => {
        if (!name.trim()) return;
        views.saveAs(name.trim());
        onDone();
    };
    const onKey = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter') save();
        if (event.key === 'Escape') onDone();
    };
    return (
        <>
            <SarakInput autoFocus aria-label={text('tableViewName')} value={name} onChange={(event) => setName(event.currentTarget.value)} onKeyDown={onKey} />
            <SarakButton type="button" size="xs" variant="secondary" onClick={save}>{text('tableViewSave')}</SarakButton>
            <SarakButton type="button" size="xs" variant="ghost" onClick={onDone}>{text('dialogCancel')}</SarakButton>
        </>
    );
};

const ViewControls = ({ views }: { views: TableViews }): ReactElement => {
    const text = useLibraryText();
    const [saving, setSaving] = useState(false);
    const options = [{ label: text('tableViewDefault'), value: '' }, ...views.views.map((view) => ({ label: view.label, value: view.id }))];
    return (
        <>
            <SarakSelect label={text('tableViewLabel')} hideLabel options={options} value={views.activeId ?? ''} onChange={(event) => views.select(event.currentTarget.value || null)} />
            {saving
                ? <SaveViewForm views={views} onDone={() => setSaving(false)} />
                : <SarakButton type="button" size="xs" variant="secondary" onClick={() => setSaving(true)}>{text('tableViewSaveAs')}</SarakButton>}
            {views.activeId !== null && <SarakButton type="button" size="xs" variant="ghost" onClick={() => views.select(null)}>{text('tableViewReset')}</SarakButton>}
        </>
    );
};

/** Barra de visões e colunas; só existe quando o consumidor pede uma das duas. */
export const SarakDataTableToolbar = <T,>({ model }: { model: SarakDataTableViewModel<T> }): ReactElement | null => {
    const text = useLibraryText();
    const [panelOpen, setPanelOpen] = useState(false);
    if (!model.columns.managed && !model.views.enabled) return null;
    return (
        <div role="group" aria-label={text('tableViewsGroup')} data-sarak-table-toolbar="true" data-sarak-no-print="true" style={BAR_STYLE}>
            {model.views.enabled && <ViewControls views={model.views} />}
            {model.columns.managed && <SarakButton type="button" size="xs" variant="secondary" aria-haspopup="dialog" onClick={() => setPanelOpen(true)}>{text('tableColumns')}</SarakButton>}
            {panelOpen && <SarakTableColumnPanel columns={model.columns} onClose={() => setPanelOpen(false)} />}
        </div>
    );
};
