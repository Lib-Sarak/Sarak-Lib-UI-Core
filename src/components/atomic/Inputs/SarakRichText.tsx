import { SarakIcon } from "../Icon/SarakIcon";
/**
 * SarakRichText — editor WYSIWYG blindado (Spec 11, Regra 4 · Onda 10)
 *
 * Editor in-house sobre `contentEditable` — **zero dependência nova**. Toda saída (digitação
 * E colagem) passa pelo canal único de sanitização (`sanitizeHtml`, Spec 40), com allowlist
 * RESTRITA: marcações semânticas (negrito, itálico, listas, links, títulos), **nunca** tags
 * `<style>`/`<script>`, handlers `on*` ou `javascript:` (Critério de Aceite). Sem estilos
 * locais que rompam o escopo CSS. Integra ao formulário via `value` + `onChange(htmlLimpo)`,
 * consumido pelo `model`/`coerceEventValue` do LeafNode (Spec 32).
 */

import React, { useEffect, useId, useRef } from 'react';

import { sanitizeHtml } from '../../../core/Security/sanitizeHtml';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakFieldError } from '../Feedback/SarakFieldError';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

/** Allowlist semântica restrita (Regra 4): sem `style`/`script`, só marcação segura. */
const ALLOWED_TAGS = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'blockquote', 'code'];
const ALLOWED_ATTR = ['href'];

/** Sanitiza o HTML do editor pela allowlist restrita. Exportado para teste isolado. */
export const sarakSanitizeRichText = (html: string): string =>
    sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: ALLOWED_ATTR });

export interface SarakRichTextProps {
    /** Conteúdo HTML controlado pelo consumidor (par com `onChange`). */
    value?: string;
    /** Conteúdo inicial não-controlado. */
    defaultValue?: string;
    /** Emite o HTML JÁ sanitizado a cada mudança. */
    onChange?: (html: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
}

const TOOLS = [
    { cmd: 'bold', icon: <SarakIcon name="Bold" size={15} />, labelKey: 'richTextBoldAction' },
    { cmd: 'italic', icon: <SarakIcon name="Italic" size={15} />, labelKey: 'richTextItalicAction' },
    { cmd: 'insertUnorderedList', icon: <SarakIcon name="List" size={15} />, labelKey: 'richTextUnorderedListAction' },
    { cmd: 'insertOrderedList', icon: <SarakIcon name="ListOrdered" size={15} />, labelKey: 'richTextOrderedListAction' },
] as const;

export const SarakRichText: React.FC<SarakRichTextProps> = ({
    value,
    defaultValue,
    onChange,
    placeholder,
    label,
    disabled,
    error,
    className = '',
}: SarakRichTextProps): React.ReactElement => {
    const ref = useRef<HTMLDivElement>(null);
    const reactId = useId();
    const labelId = `${reactId}-label`;
    const t = useLibraryText();

    // Semeia o conteúdo inicial uma vez (e ressincroniza só se o `value` externo divergir
    // do DOM — evita "pular" o cursor a cada tecla, que ocorreria reescrevendo sempre).
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const incoming = value ?? defaultValue ?? '';
        if (incoming !== el.innerHTML) {
            el.innerHTML = sarakSanitizeRichText(incoming);
        }
    }, [value]);

    const emit = (): void => {
        if (ref.current) onChange?.(sarakSanitizeRichText(ref.current.innerHTML));
    };

    const exec = (cmd: string): void => {
        if (disabled) return;
        ref.current?.focus();
        document.execCommand(cmd, false);
        emit();
    };

    const addLink = (): void => {
        if (disabled || typeof window === 'undefined') return;
        const url = window.prompt(t('richTextLinkUrlPrompt'));
        if (url) {
            ref.current?.focus();
            document.execCommand('createLink', false, url);
            emit();
        }
    };

    // Cola blindada (Regra 4): intercepta, sanitiza o HTML/texto e insere o conteúdo limpo.
    const onPaste = (e: React.ClipboardEvent<HTMLDivElement>): void => {
        e.preventDefault();
        const raw = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
        const clean = sarakSanitizeRichText(raw);
        document.execCommand('insertHTML', false, clean);
        emit();
    };

    return (
        <div className={`relative ${className}`}>
            {label && <span id={labelId} className="text-sm font-medium">{label}</span>}
            <div
                role="toolbar"
                aria-label={t('richTextToolbarAriaLabel')}
                style={{
                    display: 'flex',
                    gap: 2,
                    padding: 4,
                    border: 'var(--sarak-border-width, 1px) solid var(--border-color,rgba(255,255,255,0.1))',
                    borderBottom: 'none',
                    borderTopLeftRadius: 'var(--sarak-card-radius,12px)',
                    borderTopRightRadius: 'var(--sarak-card-radius,12px)',
                    background: 'var(--sarak-table-header-bg, var(--color-theme-card,rgba(15,23,42,0.6)))',
                }}
            >
                {TOOLS.map((tool) => (
                    <SarakIconButton
                        key={tool.cmd}
                        variant="ghost"
                        size="sm"
                        aria-label={t(tool.labelKey)}
                        icon={tool.icon}
                        disabled={disabled}
                        onClick={() => exec(tool.cmd)}
                    />
                ))}
                <SarakIconButton
                    variant="ghost"
                    size="sm"
                    aria-label={t('richTextInsertLinkAction')}
                    icon={<SarakIcon name="Link2" size={15} />}
                    disabled={disabled}
                    onClick={addLink}
                />
            </div>

            <div
                ref={ref}
                role="textbox"
                aria-multiline="true"
                id={reactId}
                aria-labelledby={label ? labelId : undefined}
                aria-label={!label ? placeholder : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${reactId}-error` : undefined}
                data-sarak-richtext="true"
                contentEditable={!disabled}
                suppressContentEditableWarning
                onInput={emit}
                onBlur={emit}
                onPaste={onPaste}
                data-placeholder={placeholder}
                style={{
                    minHeight: 120,
                    padding: 'var(--sarak-layout-gap-md,16px)',
                    border: `var(--sarak-border-width, 1px) solid ${error ? 'var(--sarak-input-error-color, #ff4d4f)' : 'var(--border-color,rgba(255,255,255,0.1))'}`,
                    borderBottomLeftRadius: 'var(--sarak-card-radius,12px)',
                    borderBottomRightRadius: 'var(--sarak-card-radius,12px)',
                    background: 'var(--sarak-input-bg, var(--color-theme-card,rgba(15,23,42,0.6)))',
                    color: 'var(--sarak-input-text-color, var(--text-muted,rgba(255,255,255,0.4)))',
                    outline: 'none',
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? 'not-allowed' : 'text',
                }}
            />

            <SarakFieldError message={error} fieldId={reactId} />
        </div>
    );
};

export default SarakRichText;
