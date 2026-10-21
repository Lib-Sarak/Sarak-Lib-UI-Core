import { resolveThemeForMode } from './color-engine';
import type { SarakThemeCatalogEntry, SarakThemeSwatch } from './index';
import type { SarakTokenValue } from '../../types';
import type { SarakDesignState } from '../../../Provider/types';

interface CatalogSource {
    id: string;
    name?: string;
    description?: string;
    design?: Record<string, unknown>;
    contraparte?: Partial<SarakDesignState>;
}

const swatchOf = (design: Record<string, unknown>): SarakThemeSwatch => ({
    primaryColor: String(design.primaryColor ?? ''),
    colorBgBody: String(design.colorBgBody ?? ''),
    textColorMaster: String(design.textColorMaster ?? ''),
});

/**
 * A entrada leve de um tema. É a MESMA função que o gerador do catálogo
 * embarcado usa (`npm run themes:catalog`) e que o Provider usa para listar
 * tema de consumidor — uma só definição de "amostra de cor".
 */
export const toThemeCatalogEntry = (theme: CatalogSource): SarakThemeCatalogEntry => {
    const design = (theme.design ?? {}) as Record<string, SarakTokenValue>;
    const mode: 'light' | 'dark' = design.mode === 'light' ? 'light' : 'dark';
    const source = { design, contraparte: theme.contraparte };
    return {
        id: theme.id,
        name: theme.name ?? theme.id,
        description: theme.description ?? '',
        mode,
        hasContraparte: Boolean(theme.contraparte),
        swatch: swatchOf(design),
        swatchOpposite: swatchOf(resolveThemeForMode(source, mode === 'light' ? 'dark' : 'light')),
    };
};
