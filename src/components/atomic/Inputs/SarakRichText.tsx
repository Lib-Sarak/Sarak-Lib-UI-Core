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

import React, { useEffect, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Link2 } from 'lucide-react';
import { sanitizeHtml } from '../../../core/Manifest/Security/sanitizeHtml';

/** Allowlist semântica restrita (Regra 4): sem `style`/`script`, só marcação segura. */
const ALLOWED_TAGS = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'blockquote', 'code'];
const ALLOWED_ATTR = ['href'];

/** Sanitiza o HTML do editor pela allowlist restrita. Exportado para teste isolado. */
export const sanitizeRichText = (html: string): string =>
    sanitizeHtml(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: ALLOWED_ATTR });

export interface SarakRichTextProps {
    /** Conteúdo HTML controlado (fiado pelo `model` no manifesto). */
    value?: string;
    /** Conteúdo inicial não-controlado. */
    defaultValue?: string;
    /** Emite o HTML JÁ sanitizado a cada mudança. */
    onChange?: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
}

interface ToolButton {
    cmd: string;
    icon: React.ReactNode;
    label: string;
}

const TOOLS: ToolButton[] = [
    { cmd: 'bold', icon: <Bold size={15} />, label: 'Negrito' },
    { cmd: 'italic', icon: <Italic size={15} />, label: 'Itálico' },
    { cmd: 'insertUnorderedList', icon: <List size={15} />, label: 'Lista' },
    { cmd: 'insertOrderedList', icon: <ListOrdered size={15} />, label: 'Lista numerada' },
];

export const SarakRichText: React.FC<SarakRichTextProps> = ({
    value,
    defaultValue,
    onChange,
    placeholder,
    disabled,
    error,
    className = '',
}) => {
    const ref = useRef<HTMLDivElement>(null);

    // Semeia o conteúdo inicial uma vez (e ressincroniza só se o `value` externo divergir
    // do DOM — evita "pular" o cursor a cada tecla, que ocorreria reescrevendo sempre).
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const incoming = value ?? defaultValue ?? '';
        if (incoming !== el.innerHTML) {
            el.innerHTML = sanitizeRichText(incoming);
        }
    }, [value]);

    const emit = () => {
        if (ref.current) onChange?.(sanitizeRichText(ref.current.innerHTML));
    };

    const exec = (cmd: string) => {
        if (disabled) return;
        ref.current?.focus();
        document.execCommand(cmd, false);
        emit();
    };

    const addLink = () => {
        if (disabled || typeof window === 'undefined') return;
        const url = window.prompt('URL do link:');
        if (url) {
            ref.current?.focus();
            document.execCommand('createLink', false, url);
            emit();
        }
    };

    // Cola blindada (Regra 4): intercepta, sanitiza o HTML/texto e insere o conteúdo limpo.
    const onPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const raw = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
        const clean = sanitizeRichText(raw);
        document.execCommand('insertHTML', false, clean);
        emit();
    };

    const btn = 'flex items-center justify-center w-8 h-8 rounded-md text-[var(--color-theme-title,#ffffff)] hover:bg-[var(--text-muted,#94a3b8)]/10 disabled:opacity-40 transition-colors';

    return (
        <div className={`relative ${className}`}>
            <div
                role="toolbar"
                aria-label="Formatação"
                style={{
                    display: 'flex',
                    gap: 2,
                    padding: 4,
                    border: '1px solid var(--border-color,#334155)',
                    borderBottom: 'none',
                    borderTopLeftRadius: 'var(--sarak-card-radius,12px)',
                    borderTopRightRadius: 'var(--sarak-card-radius,12px)',
                    background: 'var(--sarak-table-header-bg, var(--color-theme-card,#1e293b))',
                }}
            >
                {TOOLS.map((tool) => (
                    <button key={tool.cmd} type="button" aria-label={tool.label} className={btn} disabled={disabled} onClick={() => exec(tool.cmd)}>
                        {tool.icon}
                    </button>
                ))}
                <button type="button" aria-label="Inserir link" className={btn} disabled={disabled} onClick={addLink}>
                    <Link2 size={15} />
                </button>
            </div>

            <div
                ref={ref}
                role="textbox"
                aria-multiline="true"
                aria-label={placeholder}
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
                    border: `1px solid ${error ? 'var(--sarak-input-error-color, #ff4d4f)' : 'var(--border-color,#334155)'}`,
                    borderBottomLeftRadius: 'var(--sarak-card-radius,12px)',
                    borderBottomRightRadius: 'var(--sarak-card-radius,12px)',
                    background: 'var(--sarak-input-bg, var(--color-theme-card,#1e293b))',
                    color: 'var(--sarak-input-text-color, var(--text-muted,#94a3b8))',
                    outline: 'none',
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? 'not-allowed' : 'text',
                }}
            />

            {error && (
                <p className="mt-2 text-sm text-[var(--sarak-input-error-color,#ff4d4f)]">{error}</p>
            )}
        </div>
    );
};

export default SarakRichText;
