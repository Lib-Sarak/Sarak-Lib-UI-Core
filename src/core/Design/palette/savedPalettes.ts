import { isValidPaletteValue } from './parser';

/** Uma paleta que o administrador criou e guardou com nome: o `value` é o `colorPalette` (`custom:…`) dela. */
export interface SarakSavedPalette {
    id: string;
    name: string;
    value: string;
}

/** Quantas paletas o design guarda: a lista viaja inteira a cada `Aplicar`. */
export const MAX_SAVED_PALETTES = 24;
/** O tamanho máximo do nome, em caracteres. */
export const MAX_SAVED_PALETTE_NAME = 40;

const ENTRY_SEPARATOR = '~';
const FIELD_SEPARATOR = '|';
/** Letras, números, espaço e pontuação simples: nada que abra string, comentário ou bloco numa variável CSS. */
const UNSAFE_NAME_CHARACTERS = /[^\p{L}\p{N} _\-.,&+!?@#%]/gu;
const SAVED_ID = /^sp-\d{1,6}$/;

/** O nome como o design o guarda: sem caractere que quebre o texto gravado ou a variável CSS, sem espaço sobrando e com teto. */
export const sanitizePaletteName = (name: string): string =>
    name.replace(UNSAFE_NAME_CHARACTERS, '').replace(/\s+/g, ' ').trim().slice(0, MAX_SAVED_PALETTE_NAME).trim();

const isCustomValue = (value: string): boolean => value.startsWith('custom:') && isValidPaletteValue(value);

const entryOf = (raw: string): SarakSavedPalette | null => {
    const [id, name, value, ...extra] = raw.split(FIELD_SEPARATOR);
    if (extra.length > 0 || !SAVED_ID.test(id ?? '') || value === undefined || !isCustomValue(value)) return null;
    const cleanName = sanitizePaletteName(name ?? '');
    return cleanName ? { id, name: cleanName, value } : null;
};

/**
 * A lista de paletas salvas a partir do valor gravado no token `savedPalettes`. Tolerante: entrada malformada, id repetido ou
 * valor que não é uma paleta `custom:` válida é descartada, nunca lança; passado o teto, o resto é ignorado.
 */
export const decodeSavedPalettes = (raw: unknown): SarakSavedPalette[] => {
    if (typeof raw !== 'string' || raw === '') return [];
    const seen = new Set<string>();
    const list: SarakSavedPalette[] = [];
    raw.split(ENTRY_SEPARATOR).forEach((chunk) => {
        const entry = entryOf(chunk);
        if (!entry || seen.has(entry.id) || list.length >= MAX_SAVED_PALETTES) return;
        seen.add(entry.id);
        list.push(entry);
    });
    return list;
};

/** O valor do token `savedPalettes`: a lista em texto compacto (`id|nome|valor` separados por `~`), `''` quando vazia. */
export const encodeSavedPalettes = (list: readonly SarakSavedPalette[]): string =>
    list.map((entry) => [entry.id, entry.name, entry.value].join(FIELD_SEPARATOR)).join(ENTRY_SEPARATOR);

/** O id livre seguinte (`sp-1`, `sp-2`…): determinístico, sem relógio nem acaso. */
export const nextSavedPaletteId = (list: readonly SarakSavedPalette[]): string => {
    const used = new Set(list.map((entry) => entry.id));
    let counter = list.length + 1;
    while (used.has(`sp-${counter}`)) counter += 1;
    return `sp-${counter}`;
};

/** A mesma paleta com outro nome é a mesma: a comparação de nome ignora caixa e espaço sobrando. */
export const findSavedPaletteByName = (list: readonly SarakSavedPalette[], name: string): SarakSavedPalette | undefined => {
    const wanted = sanitizePaletteName(name).toLowerCase();
    return list.find((entry) => entry.name.toLowerCase() === wanted);
};

export type SavePaletteResult =
    | { ok: true; list: SarakSavedPalette[] }
    | { ok: false; reason: 'name' | 'value' | 'full' };

/** Guarda a paleta: nome igual substitui a entrada (a confirmação é de quem chama); lista cheia só recusa uma nova. */
export const savePalette = (list: readonly SarakSavedPalette[], name: string, value: string): SavePaletteResult => {
    const cleanName = sanitizePaletteName(name);
    if (!cleanName) return { ok: false, reason: 'name' };
    if (!isCustomValue(value)) return { ok: false, reason: 'value' };
    const same = findSavedPaletteByName(list, cleanName);
    if (same) return { ok: true, list: list.map((entry) => (entry.id === same.id ? { ...entry, value } : entry)) };
    if (list.length >= MAX_SAVED_PALETTES) return { ok: false, reason: 'full' };
    return { ok: true, list: [...list, { id: nextSavedPaletteId(list), name: cleanName, value }] };
};

export const removeSavedPalette = (list: readonly SarakSavedPalette[], id: string): SarakSavedPalette[] =>
    list.filter((entry) => entry.id !== id);

/** O valor que a validação do design aceita: o texto canônico da lista que sobrou depois de descartar o que não vale. */
export const normalizeSavedPalettes = (raw: unknown): string => encodeSavedPalettes(decodeSavedPalettes(raw));

/** As paletas salvas de um design (o rascunho ou o aplicado): o leitor do token `savedPalettes`, que quem desenha a lista usa. */
export const savedPalettesOf = (design: Readonly<Record<string, unknown>> | undefined): SarakSavedPalette[] =>
    decodeSavedPalettes(design?.savedPalettes);
