/**
 * O registro dos temas embarcados EM MEMÓRIA, mais o carregador sob demanda.
 *
 * O cache é síncrono (o Provider o lê no inicializador do estado, sem efeito) e
 * nasce só com o tema padrão; o resto entra por `sarakLoadThemePreset`. Quem
 * precisa reagir à chegada de um tema assina `subscribeThemeCache` (o
 * `useThemeCollection` o faz por `useSyncExternalStore`).
 */
import { SARAK_BOOT_THEMES } from './boot';
import { SARAK_THEME_LOADERS } from './loaders';
import { SARAK_THEME_PRESET_IDS, type SarakThemePreset, type SarakThemePresetId } from './index';

const cache = new Map<string, SarakThemePreset>(SARAK_BOOT_THEMES.map((theme) => [theme.id, theme]));
const inflight = new Map<string, Promise<SarakThemePreset>>();
const listeners = new Set<() => void>();
let cacheVersion = 0;

/** `true` quando o id é de um tema EMBARCADO (carregado ou não). */
export const isSarakThemePresetId = (id: string): id is SarakThemePresetId =>
    (SARAK_THEME_PRESET_IDS as readonly string[]).includes(id);

/** O tema embarcado já em memória, ou `undefined` — nunca dispara carga. */
export const getLoadedThemePreset = (id: string): SarakThemePreset | undefined => cache.get(id);

/** Os embarcados em memória, na ordem do catálogo. */
export const getLoadedThemePresets = (): SarakThemePreset[] =>
    SARAK_THEME_PRESET_IDS.flatMap((id) => {
        const theme = cache.get(id);
        return theme ? [theme] : [];
    });

export const getThemeCacheVersion = (): number => cacheVersion;

export const subscribeThemeCache = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
};

const store = (theme: SarakThemePreset): void => {
    cache.set(theme.id, theme);
    cacheVersion += 1;
    listeners.forEach((listener) => listener());
};

const fetchTheme = (id: string): Promise<SarakThemePreset> => {
    const loader = (SARAK_THEME_LOADERS as Record<string, (() => Promise<SarakThemePreset>) | undefined>)[id];
    if (!loader) return Promise.reject(new Error(`Tema embarcado "${id}" desconhecido — veja SARAK_THEME_CATALOG.`));
    return loader().then((theme) => { store(theme); return theme; });
};

/**
 * Carrega um tema embarcado (cache em memória; um `import()` por id). Rejeita
 * com id desconhecido — nunca devolve `undefined` mudo.
 */
export const sarakLoadThemePreset = (id: string): Promise<SarakThemePreset> => {
    const loaded = cache.get(id);
    if (loaded) return Promise.resolve(loaded);
    const pending = inflight.get(id) ?? fetchTheme(id).finally(() => inflight.delete(id));
    inflight.set(id, pending);
    return pending;
};

/** Carrega vários de uma vez e popula o cache síncrono que o Provider lê. */
export const sarakPreloadThemes = (ids: readonly string[]): Promise<SarakThemePreset[]> =>
    Promise.all(ids.map((id) => sarakLoadThemePreset(id)));

/** Todos os embarcados — para o painel e para ferramenta. */
export const sarakLoadAllThemePresets = (): Promise<SarakThemePreset[]> =>
    sarakPreloadThemes(SARAK_THEME_PRESET_IDS);
