import React, { useRef, useState } from 'react';
import { useLibraryText, type LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { sarakNextGridPosition, type SarakGridPosition } from './permissionGrid';
import { SYSTEM_TONE_COLOR } from './systemTone';

export interface SarakPermissionRole {
    id: string;
    label: string;
}

export interface SarakPermissionItem {
    id: string;
    label: string;
}

export interface SarakPermissionGroup {
    id: string;
    label: string;
    permissions: SarakPermissionItem[];
}

export interface SarakPermissionMatrixProps {
    roles: SarakPermissionRole[];
    groups: SarakPermissionGroup[];
    /** Permissões concedidas direto, por id do papel. */
    granted: Record<string, string[]>;
    /** Permissões que o papel recebe de outro papel, por id do papel. Não se desligam aqui. */
    inherited?: Record<string, string[]>;
    /** Chamado ao alternar uma célula direta; a regra de permissão é do host. */
    onToggle?: (roleId: string, permissionId: string, granted: boolean) => void;
    /** Só leitura: a grade navega pelo teclado, mas nada alterna. */
    readOnly?: boolean;
    /** Nome da grade para leitor de tela. */
    label?: string;
    className?: string;
}

type CellState = 'direct' | 'inherited' | 'none';

const STATE_PRESENTATION: Record<CellState, { glyph: string; label: Parameters<LibraryTextFn>[0]; color: string }> = {
    direct: { glyph: '✓', label: 'permDirect', color: SYSTEM_TONE_COLOR.success },
    inherited: { glyph: '◆', label: 'permInherited', color: SYSTEM_TONE_COLOR.info },
    none: { glyph: '–', label: 'permNone', color: SYSTEM_TONE_COLOR.muted },
};

const CELL_STYLE: React.CSSProperties = { textAlign: 'center', padding: 'var(--sarak-layout-gap-sm, 8px)', borderBottom: 'var(--sarak-border-width, 1px) solid var(--theme-border)', cursor: 'pointer' };
const STICKY_HEAD_STYLE: React.CSSProperties = { position: 'sticky', left: 0, background: 'var(--theme-surface)', textAlign: 'start', padding: 'var(--sarak-layout-gap-sm, 8px)' };

/**
 * Matriz papéis × permissões, agrupada, em grade acessível: uma célula na ordem de Tab, setas/Home/End/PageUp/PageDown
 * para mover e Espaço ou Enter para alternar. Concedida direto (✓), herdada (◆) e sem acesso (–) têm forma e palavra
 * próprias, além da cor. Apresentacional: o estado vem por prop e a alteração sai por `onToggle`.
 */
export const SarakPermissionMatrix = ({ roles, groups, granted, inherited = {}, onToggle, readOnly = false, label, className }: SarakPermissionMatrixProps): React.ReactElement => {
    const text = useLibraryText();
    const tableRef = useRef<HTMLTableElement>(null);
    const [active, setActive] = useState<SarakGridPosition>({ row: 0, column: 0 });
    const [announcement, setAnnouncement] = useState('');
    const flat = groups.flatMap((group) => group.permissions);
    const stateOf = (roleId: string, permissionId: string): CellState => {
        if (granted[roleId]?.includes(permissionId)) return 'direct';
        return inherited[roleId]?.includes(permissionId) ? 'inherited' : 'none';
    };
    const textOf = (position: SarakGridPosition, state: CellState): string =>
        `${roles[position.column].label} · ${flat[position.row].label}: ${text(STATE_PRESENTATION[state].label)}`;

    const focusCell = (position: SarakGridPosition): void => {
        setActive(position);
        tableRef.current?.querySelector<HTMLElement>(`[data-cell="${position.row}:${position.column}"]`)?.focus();
    };
    const toggle = (position: SarakGridPosition): void => {
        const role = roles[position.column];
        const permission = flat[position.row];
        const state = stateOf(role.id, permission.id);
        if (readOnly || state === 'inherited' || !onToggle) return;
        onToggle(role.id, permission.id, state === 'none');
        setAnnouncement(textOf(position, state === 'none' ? 'direct' : 'none'));
    };
    const onKeyDown = (event: React.KeyboardEvent, position: SarakGridPosition): void => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            toggle(position);
            return;
        }
        const next = sarakNextGridPosition(event.key, position, { rows: flat.length, columns: roles.length }, event.ctrlKey);
        if (!next) return;
        event.preventDefault();
        focusCell(next);
    };

    let rowIndex = -1;
    return (
        <div className={mergeSarakClasses('sarak-permission-matrix @container w-full', className)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
            <div style={{ overflowX: 'auto' }}>
                <table ref={tableRef} role="grid" aria-label={label ?? text('permMatrix')} aria-readonly={readOnly || undefined} style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th scope="col" style={STICKY_HEAD_STYLE}>{text('permPermission')}</th>
                            {roles.map((role) => <th key={role.id} scope="col" style={{ ...CELL_STYLE, cursor: 'default' }}>{role.label}</th>)}
                        </tr>
                    </thead>
                    {groups.map((group) => (
                        <tbody key={group.id}>
                            <tr><th scope="rowgroup" colSpan={roles.length + 1} style={{ ...STICKY_HEAD_STYLE, fontWeight: 'bold' }}>{group.label}</th></tr>
                            {group.permissions.map((permission) => {
                                rowIndex += 1;
                                const row = rowIndex;
                                return (
                                    <tr key={permission.id}>
                                        <th scope="row" style={{ ...STICKY_HEAD_STYLE, fontWeight: 'normal' }}>{permission.label}</th>
                                        {roles.map((role, column) => {
                                            const position = { row, column };
                                            const state = stateOf(role.id, permission.id);
                                            const presentation = STATE_PRESENTATION[state];
                                            return (
                                                <td
                                                    key={role.id}
                                                    role="gridcell"
                                                    data-cell={`${row}:${column}`}
                                                    data-state={state}
                                                    tabIndex={active.row === row && active.column === column ? 0 : -1}
                                                    aria-label={textOf(position, state)}
                                                    aria-readonly={readOnly || state === 'inherited' || undefined}
                                                    onFocus={() => setActive(position)}
                                                    onClick={() => { focusCell(position); toggle(position); }}
                                                    onKeyDown={(event) => onKeyDown(event, position)}
                                                    style={{ ...CELL_STYLE, color: presentation.color }}
                                                >
                                                    <span aria-hidden="true">{presentation.glyph}</span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    ))}
                </table>
            </div>
            <SarakFlex gap="spacing-md" aria-hidden="true" className="text-theme-muted">
                {(Object.keys(STATE_PRESENTATION) as CellState[]).map((state) => (
                    <span key={state}><span style={{ color: STATE_PRESENTATION[state].color }}>{STATE_PRESENTATION[state].glyph}</span> {text(STATE_PRESENTATION[state].label)}</span>
                ))}
            </SarakFlex>
            <div role="status" className="sr-only">{announcement}</div>
        </div>
    );
};
