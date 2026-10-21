import type { LoadableFontFace, LoadableFontFamily } from '../fontLoader';
import type { SarakCustomFont, SarakCustomFontFile, SarakFontFallback, SarakFontsOption } from '../providerProps';
import { isSafeFontUrl } from './cssSafety';
import { listLoadableFamilies } from './googleFontsUrl';

/**
 * As fontes que o host registra em `options.fonts.custom`: o registro validado (nome, arquivo, peso, estilo) que o
 * carregador usa para injetar o `@font-face` delas e o painel usa para listá-las. O registro não decide o que o tema
 * aceita — um valor de fonte seguro (`isSafeCssString`) vale, registrado ou não; registrar só faz a família ser
 * carregada e oferecida. É derivado das `options` de cada Provider, nunca guardado em estado de módulo: duas ilhas
 * do Modo Embarcado não carregam os arquivos uma da outra.
 */
const FAMILY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,63}$/;
const FALLBACKS: readonly SarakFontFallback[] = ['sans-serif', 'serif', 'monospace', 'cursive', 'system-ui'];
const WEIGHTS = new Set<unknown>([100, 200, 300, 400, 500, 600, 700, 800, 900, 'normal', 'bold']);
const MAX_CATEGORY_LENGTH = 40;
export const HOST_FONT_CATEGORY = 'Personalizadas';

export interface HostFont {
    family: string;
    /** O valor que o tema grava: `'<família>', <genérica>`. */
    value: string;
    category: string;
}

export interface HostFontRegistry {
    fonts: HostFont[];
    /** Valor gravado no tema → família. */
    values: Map<string, string>;
    manifest: Record<string, LoadableFontFamily>;
}

const warned = new Set<string>();
const warnOnce = (message: string): void => {
    if (warned.has(message)) return;
    warned.add(message);
    console.warn(message);
};
const quoted = (value: unknown): string => JSON.stringify(String(value).slice(0, 80));

function acceptFile(family: string, file: SarakCustomFontFile, index: number): LoadableFontFace | null {
    const style = file?.style ?? 'normal';
    if (isSafeFontUrl(file?.url) && WEIGHTS.has(file?.weight) && (style === 'normal' || style === 'italic')) {
        return { file: file.url, weight: String(file.weight), style, url: () => new URL(file.url, document.baseURI) };
    }
    warnOnce(`[Sarak:UI] options.fonts.custom: arquivo ${index + 1} da família "${family}" recusado — a url aceita só `
        + 'https:, caminho ou data:font/…;base64; o peso, 100–900, normal ou bold; o estilo, normal ou italic.');
    return null;
}

function acceptFont(font: SarakCustomFont, taken: Set<string>): (HostFont & { faces: LoadableFontFace[] }) | null {
    const family = font?.family;
    if (typeof family !== 'string' || !FAMILY_PATTERN.test(family) || taken.has(family.toLowerCase())) {
        warnOnce(`[Sarak:UI] options.fonts.custom: família ${quoted(family)} recusada — use letras, dígitos, espaço, hífen `
            + 'ou sublinhado (até 64), sem repetir uma família da lib ou já registrada.');
        return null;
    }
    const fallback = font.fallback ?? 'sans-serif';
    const faces = FALLBACKS.includes(fallback) && Array.isArray(font.files)
        ? font.files.map((file, index) => acceptFile(family, file, index)).filter((face): face is LoadableFontFace => face !== null)
        : [];
    if (faces.length === 0) {
        warnOnce(`[Sarak:UI] options.fonts.custom: família "${family}" sem arquivo válido ou com fallback fora de ${FALLBACKS.join(', ')} — ignorada.`);
        return null;
    }
    const category = typeof font.category === 'string' && font.category.trim() ? font.category.trim().slice(0, MAX_CATEGORY_LENGTH) : HOST_FONT_CATEGORY;
    return { family, value: `'${family}', ${fallback}`, category, faces };
}

function buildRegistry(custom: SarakCustomFont[]): HostFontRegistry {
    const taken = new Set(listLoadableFamilies().map((family) => family.toLowerCase()));
    const registry: HostFontRegistry = { fonts: [], values: new Map(), manifest: {} };
    for (const font of custom) {
        const accepted = acceptFont(font, taken);
        if (!accepted) continue;
        const { faces, ...hostFont } = accepted;
        taken.add(hostFont.family.toLowerCase());
        registry.fonts.push(hostFont);
        registry.values.set(hostFont.value, hostFont.family);
        registry.manifest[hostFont.family] = { variable: false, faces };
    }
    return registry;
}

const registryCache = new WeakMap<SarakCustomFont[], HostFontRegistry>();

/** O registro validado de `options.fonts.custom`; `undefined` sem fonte registrada. Memoizado pela lista recebida. */
export function getHostFontRegistry(option?: SarakFontsOption): HostFontRegistry | undefined {
    const custom = typeof option === 'object' && option !== null ? option.custom : undefined;
    if (!Array.isArray(custom) || custom.length === 0) return undefined;
    let registry = registryCache.get(custom);
    if (!registry) {
        registry = buildRegistry(custom);
        registryCache.set(custom, registry);
    }
    return registry;
}
