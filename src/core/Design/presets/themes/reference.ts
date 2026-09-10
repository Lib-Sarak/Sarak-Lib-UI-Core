/**
 * Temas de REFERÊNCIA da lib (Spec 40.1 — L6).
 *
 * A lib fornece um PAR de temas COMPLETOS (todos os eixos: cor + fonte + cromo
 * topbar/sidebar + raio + espaçamento) para o consumidor CUSTOMIZAR — em vez de montar
 * do zero e esquecer eixos (a causa-raiz de "fonte/cromo não mudam" do Teste Real, onde
 * o `ERP_THEMES` nasceu com só ~10 chaves de cor). O consumidor parte destes, troca
 * poucos valores (marca/cor) e mantém a completude por construção.
 *
 * O par difere em MODO (claro/escuro), NAVEGAÇÃO (topbar/sidebar) e FONTE de propósito,
 * para que alternar entre eles mude visivelmente cor E fonte E cromo E raio — a prova
 * ampla do R5.
 */
import { GLOBAL_THEMES, type ThemePreset, type ThemePresetId } from './index';
import type { SarakDesignState } from '../../../Provider/types';

/** Busca um preset completo do catálogo pelo id. */
export const getThemePreset = (id: ThemePresetId): ThemePreset | undefined =>
    GLOBAL_THEMES.find((theme) => theme.id === id);

/**
 * Par de referência recomendado: um CLARO (`minimalist-airy`, topbar, Inter) e um
 * ESCURO (`sarak-sovereign`, sidebar, Outfit). Ambos completos — ponto de partida para
 * o consumidor. Use direto em `customThemes` do `SarakUIProvider`, ou clone e ajuste.
 */
export const SARAK_REFERENCE_THEMES: ThemePreset[] = [
    getThemePreset('minimalist-airy'),
    getThemePreset('sarak-sovereign'),
].filter((theme): theme is ThemePreset => Boolean(theme));

/** O que `deriveThemeFromReference` recebe: identidade do tema derivado + as
 *  sobreposições de `design`. `id` não é `ThemePresetId` — um tema
 *  derivado é do CONSUMIDOR, fora da união fechada dos temas shippados. */
export interface ThemeReferenceOverrides {
    id: string;
    name: string;
    description?: string;
    design: Record<string, unknown>;
}

/** O que `deriveThemeFromReference` devolve — mesma forma de `ThemeEntry` (Provider/types.ts),
 *  com `contraparte` a mais. Bate estruturalmente com `ModeResolvableTheme`
 *  (`color-engine.ts`), então segue direto para `resolveThemeForMode`. */
export interface DerivedThemePreset {
    id: string;
    name: string;
    description?: string;
    design: Record<string, unknown>;
    contraparte?: Partial<SarakDesignState>;
}

/**
 * Deriva um tema COMPLETO — `design` e `contraparte` — de um tema de
 * referência. Substitui o padrão que a spec 09 §4.1 registrou como
 * erro recorrente: `{ ...REF.design, primaryColor: X }` copia só metade do
 * tema e descarta a contraparte — a troca de modo volta a degradar, em
 * silêncio, para quem clonou.
 *
 * As sobreposições de `design` são aplicadas nos DOIS modos: toda chave que
 * também exista na `contraparte` da referência é espelhada lá — sem isso, o
 * modo oposto voltaria a mostrar o valor ANTIGO da referência, e a troca de
 * modo pareceria reverter a customização. Chave de marca (`primaryColor`,
 * `accentColor`, `btnPrimaryBg`…) não está em nenhuma contraparte autorada —
 * para essas, o merge em `design` já basta, e a identidade da marca atravessa
 * os dois modos porque nunca esteve na contraparte para começo de conversa.
 */
export function deriveThemeFromReference(
    referenceId: ThemePresetId,
    overrides: ThemeReferenceOverrides,
): DerivedThemePreset {
    const reference = getThemePreset(referenceId);
    if (!reference) {
        throw new Error(`Tema de referência "${referenceId}" não encontrado em GLOBAL_THEMES.`);
    }

    const design = { ...reference.design, ...overrides.design };
    const contraparte = reference.contraparte
        ? {
              ...reference.contraparte,
              ...Object.fromEntries(
                  Object.entries(overrides.design).filter(([key]) => key in (reference.contraparte as Record<string, unknown>)),
              ),
          }
        : undefined;

    return {
        id: overrides.id,
        name: overrides.name,
        description: overrides.description ?? reference.description,
        design,
        contraparte,
    };
}
