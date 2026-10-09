/**
 * SarakActivityFeed — linha do tempo vertical de eventos (o "histórico de movimentação" de
 * um cartão é um uso). Só leitura: nada a disparar. O horário é relativo, no idioma da lib.
 */

import React from 'react';
import { SarakAvatar } from '../Atoms/SarakAvatar';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { parseTimestamp, useRelativeTime } from './relativeTime';
import type { SarakTimestamp } from './relativeTime';

export interface SarakActivityActor {
    name: string;
    avatarUrl?: string;
}

export interface SarakActivityEntry {
    id: string;
    /** Quem fez. Omitido, a entrada é um evento do sistema, sem avatar nem nome. */
    actor?: SarakActivityActor;
    /** O que aconteceu, já na frase final ("moveu para Em andamento"). */
    text: string;
    /** Data ISO, número (ms) ou `Date`. Data inválida mostra a entrada sem horário. */
    at: SarakTimestamp;
}

export interface SarakActivityFeedProps {
    /** Entradas na ordem em que aparecem. Vazio mostra o estado vazio traduzido. */
    entries: SarakActivityEntry[];
    /** Nome acessível da lista. Omitido, usa o texto traduzido "Histórico". */
    label?: string;
    className?: string;
}

const mutedText: React.CSSProperties = {
    color: 'var(--sarak-text-muted, inherit)',
    fontSize: 'var(--sarak-type-scale-caption, 12px)',
};

function ActivityItem({ entry }: { entry: SarakActivityEntry }) {
    const relative = useRelativeTime();
    const date = parseTimestamp(entry.at);

    return (
        <li
            data-activity-id={entry.id}
            style={{
                display: 'flex',
                gap: 'var(--sarak-layout-gap-sm, 8px)',
                alignItems: 'flex-start',
                paddingBottom: 'var(--sarak-layout-gap-md, 16px)',
                marginLeft: 'var(--sarak-layout-gap-sm, 8px)',
                paddingLeft: 'var(--sarak-layout-gap-md, 16px)',
                borderLeft: 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)',
            }}
        >
            {entry.actor && <SarakAvatar size="xs" name={entry.actor.name} src={entry.actor.avatarUrl} />}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ color: 'var(--sarak-text-main, inherit)' }}>
                    {entry.actor && <strong>{entry.actor.name} </strong>}
                    {entry.text}
                </span>
                {date && <time dateTime={date.toISOString()} style={mutedText}>{relative(entry.at)}</time>}
            </div>
        </li>
    );
}

export function SarakActivityFeed({ entries, label, className }: SarakActivityFeedProps) {
    const text = useLibraryText();

    if (entries.length === 0) {
        return (
            <section aria-label={label ?? text('activityFeedLabel')} className={className} style={mutedText}>
                {text('activityEmpty')}
            </section>
        );
    }
    return (
        <ol
            aria-label={label ?? text('activityFeedLabel')}
            className={className}
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
            {entries.map((entry) => <ActivityItem key={entry.id} entry={entry} />)}
        </ol>
    );
}

export default SarakActivityFeed;
