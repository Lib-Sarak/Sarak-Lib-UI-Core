/**
 * SarakCommentThread — fio de comentários com campo de envio. O horário é relativo
 * ("há 3 horas") no idioma da lib. Sem menção, sem anexo: o consumidor compõe o que
 * precisar em volta. Estilo por token; texto pelo catálogo; ícone pela porta de ícones.
 */

import React, { useState } from 'react';
import { SarakAvatar } from '../Atoms/SarakAvatar';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakTextarea } from '../Inputs/SarakTextarea';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { parseTimestamp, useRelativeTime } from './relativeTime';
import type { SarakTimestamp } from './relativeTime';

export interface SarakCommentAuthor {
    name: string;
    avatarUrl?: string;
}

export interface SarakComment {
    id: string;
    author: SarakCommentAuthor;
    body: string;
    /** Data ISO, número (ms) ou `Date`. Data inválida mostra o comentário sem horário. */
    createdAt: SarakTimestamp;
}

export interface SarakCommentThreadProps {
    /** Comentários na ordem em que aparecem. Vazio mostra o estado vazio traduzido. */
    comments: SarakComment[];
    /** Disparado ao enviar (botão ou Ctrl/Cmd+Enter) com o texto sem espaços nas pontas. Texto vazio não dispara. */
    onSubmit: (text: string) => void;
    /** Excluir um comentário. Omitido, o botão de excluir não aparece. */
    onDelete?: (id: string) => void;
    /** Nome acessível da seção. Omitido, usa o texto traduzido "Comentários". */
    label?: string;
    className?: string;
}

const column: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)' };
const mutedText: React.CSSProperties = {
    color: 'var(--sarak-text-muted, inherit)',
    fontSize: 'var(--sarak-type-scale-caption, 12px)',
};

function CommentItem({ comment, onDelete }: { comment: SarakComment; onDelete?: (id: string) => void }) {
    const text = useLibraryText();
    const relative = useRelativeTime();
    const date = parseTimestamp(comment.createdAt);

    return (
        <li
            data-comment-id={comment.id}
            style={{ display: 'flex', gap: 'var(--sarak-layout-gap-sm, 8px)', alignItems: 'flex-start' }}
        >
            <SarakAvatar size="sm" name={comment.author.name} src={comment.author.avatarUrl} />
            <article style={{ ...column, flex: '1 1 auto', minWidth: 0 }}>
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    <span>
                        <strong style={{ color: 'var(--sarak-text-main, inherit)' }}>{comment.author.name}</strong>{' '}
                        {date && <time dateTime={date.toISOString()} style={mutedText}>{relative(comment.createdAt)}</time>}
                    </span>
                    {onDelete && (
                        <SarakIconButton
                            variant="ghost"
                            size="xs"
                            icon={<SarakIcon name="Trash2" />}
                            aria-label={text('commentDelete', { author: comment.author.name })}
                            onClick={() => onDelete(comment.id)}
                        />
                    )}
                </header>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: 'var(--sarak-text-main, inherit)' }}>
                    {comment.body}
                </p>
            </article>
        </li>
    );
}

function CommentComposer({ onSubmit }: { onSubmit: (text: string) => void }) {
    const text = useLibraryText();
    const [draft, setDraft] = useState('');

    const send = () => {
        const trimmed = draft.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setDraft('');
    };

    return (
        <form
            data-comment-composer="true"
            onSubmit={(event) => { event.preventDefault(); send(); }}
            style={column}
        >
            <SarakTextarea
                fullWidth
                aria-label={text('commentPlaceholder')}
                placeholder={text('commentPlaceholder')}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); send(); }
                }}
            />
            <SarakButton type="submit" size="sm" disabled={!draft.trim()}>
                {text('commentSubmit')}
            </SarakButton>
        </form>
    );
}

export function SarakCommentThread({ comments, onSubmit, onDelete, label, className }: SarakCommentThreadProps) {
    const text = useLibraryText();

    return (
        <section aria-label={label ?? text('commentThreadLabel')} className={className} style={column}>
            {comments.length === 0 ? (
                <span style={mutedText}>{text('commentEmpty')}</span>
            ) : (
                <ul style={{ ...column, listStyle: 'none', margin: 0, padding: 0 }}>
                    {comments.map((comment) => <CommentItem key={comment.id} comment={comment} onDelete={onDelete} />)}
                </ul>
            )}
            <CommentComposer onSubmit={onSubmit} />
        </section>
    );
}

export default SarakCommentThread;
