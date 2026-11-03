import { useEffect, useRef } from 'react';

export interface SarakShortcutOptions {
    /** Liga ou desliga o atalho; omitido, `true`. */
    enabled?: boolean;
    /** Chama `preventDefault` quando o atalho dispara; omitido, `true`. */
    preventDefault?: boolean;
    /** Dispara também com o foco num campo de texto; omitido, só atalhos com Ctrl, Alt ou Meta disparam ali. */
    allowInInputs?: boolean;
}

interface ParsedShortcut {
    key: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
    mod: boolean;
}

const KEY_ALIASES: Readonly<Record<string, string>> = { esc: 'escape', space: ' ', spacebar: ' ', del: 'delete', return: 'enter' };
const MODIFIER_ORDER = ['ctrl', 'alt', 'shift', 'meta'] as const;
const MODIFIER_KEYS: ReadonlySet<string> = new Set(['control', 'alt', 'shift', 'meta']);
const EDITABLE_TAGS: ReadonlySet<string> = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const normalizeKey = (key: string): string => KEY_ALIASES[key.toLowerCase()] ?? key.toLowerCase();

/** Lê um atalho como `mod+k`, `ctrl+shift+s` ou `escape`; `mod` vale Ctrl ou Cmd. */
const parseShortcut = (shortcut: string): ParsedShortcut => {
    const tokens = shortcut.split('+').map((token) => token.trim().toLowerCase());
    const key = normalizeKey(tokens[tokens.length - 1] === '' ? '+' : tokens[tokens.length - 1]);
    const has = (name: string): boolean => tokens.slice(0, -1).includes(name);
    return { key, ctrl: has('ctrl') || has('control'), alt: has('alt') || has('option'), shift: has('shift'), meta: has('meta') || has('cmd'), mod: has('mod') };
};

const matches = (parsed: ParsedShortcut, event: KeyboardEvent): boolean => {
    if (normalizeKey(event.key) !== parsed.key) return false;
    if (event.altKey !== parsed.alt || event.shiftKey !== parsed.shift) return false;
    if (parsed.mod) return (event.ctrlKey || event.metaKey) && !parsed.ctrl && !parsed.meta;
    return event.ctrlKey === parsed.ctrl && event.metaKey === parsed.meta;
};

const isEditable = (target: EventTarget | null): boolean => {
    const element = target as HTMLElement | null;
    return Boolean(element && (EDITABLE_TAGS.has(element.tagName) || element.isContentEditable));
};

/**
 * Escreve o atalho que o evento representa (`ctrl+shift+k`), na ordem Ctrl, Alt, Shift, Meta. Devolve `null` enquanto só
 * há modificador apertado. É o que um editor de atalhos grava e depois devolve a `useSarakShortcut`.
 */
export const sarakShortcutFromEvent = (event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>): string | null => {
    if (MODIFIER_KEYS.has(event.key.toLowerCase())) return null;
    const flags = { ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey, meta: event.metaKey };
    const pressed = MODIFIER_ORDER.filter((name) => flags[name]);
    return [...pressed, normalizeKey(event.key)].join('+');
};

/** Texto de exibição do atalho (`Ctrl+Shift+K`). */
export const sarakFormatShortcut = (shortcut: string): string =>
    shortcut.split('+').map((token) => (token.length === 1 ? token.toUpperCase() : token.charAt(0).toUpperCase() + token.slice(1))).join('+');

/**
 * Chama `handler` quando o usuário aperta o atalho. `keys` aceita um atalho ou vários (`'mod+k'`, `['ctrl+k', 'meta+k']`) e
 * pode mudar a qualquer momento — é o que deixa o atalho editável pelo usuário. `undefined` ou vazio desliga.
 */
export const useSarakShortcut = (
    keys: string | readonly string[] | undefined,
    handler: (event: KeyboardEvent) => void,
    { enabled = true, preventDefault = true, allowInInputs = false }: SarakShortcutOptions = {},
): void => {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;
    const signature = typeof keys === 'string' ? keys : (keys ?? []).join('|');

    useEffect(() => {
        const list = signature === '' ? [] : (typeof keys === 'string' ? [keys] : [...(keys ?? [])]);
        if (!enabled || list.length === 0 || typeof document === 'undefined') return undefined;
        const parsed = list.map(parseShortcut);
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.repeat || !parsed.some((entry) => matches(entry, event))) return;
            if (!allowInInputs && isEditable(event.target) && !(event.ctrlKey || event.metaKey || event.altKey)) return;
            if (preventDefault) event.preventDefault();
            handlerRef.current(event);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
        // `signature` representa `keys` por valor: um array novo com o mesmo conteúdo não reinscreve o ouvinte.
    }, [signature, enabled, preventDefault, allowInInputs]);
};
