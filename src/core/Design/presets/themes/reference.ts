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
 * ampla do R5. Só o escuro (`sarak-sovereign`, o tema padrão) está no boot; o claro
 * (`minimalist-airy`) chega por `sarakLoadReferenceThemes()`.
 */
import { SARAK_BOOT_THEMES as BOOT_THEMES } from './boot';
import { sarakLoadThemePreset } from './registry';
import type { SarakDesignState } from '../../../Provider/types';
import type { SarakThemePreset, SarakThemePresetId } from './index';

/** Os ids que `sarakDeriveThemeFromReference` aceita SEM carregar nada: os do boot. */
export type SarakReferenceThemeId = 'sarak-sovereign';

/** O id do par CLARO de referência — fora do boot; carregue-o antes de derivar dele. */
const LIGHT_REFERENCE_ID: SarakThemePresetId = 'minimalist-airy';

/**
 * Referência ESCURA e COMPLETA, síncrona (`sarak-sovereign`, topbar/sidebar, Outfit) —
 * ponto de partida para o consumidor. Use direto em `customThemes` do
 * `SarakUIProvider`, ou clone e ajuste. O par claro vem de `sarakLoadReferenceThemes()`.
 */
export const SARAK_BOOT_THEMES: SarakThemePreset[] = [...BOOT_THEMES];

/** O par COMPLETO de referência — claro e escuro —, carregando o que ainda não está em memória. */
export const sarakLoadReferenceThemes = async (): Promise<SarakThemePreset[]> => {
    const light = await sarakLoadThemePreset(LIGHT_REFERENCE_ID);
    return [light, ...SARAK_BOOT_THEMES];
};

/** O que `deriveThemeFromReference` recebe: identidade do tema derivado + as
 *  sobreposições de `design`. `id` não é `ThemePresetId` — um tema
 *  derivado é do CONSUMIDOR, fora da união fechada dos temas shippados. */
export interface SarakThemeReferenceOverrides {
    id: string;
    name: string;
    description?: string;
    design: Record<string, unknown>;
}

/** O que `deriveThemeFromReference` devolve — mesma forma de `ThemeEntry` (Provider/types.ts),
 *  com `contraparte` a mais. Bate estruturalmente com `ModeResolvableTheme`
 *  (`color-engine.ts`), então segue direto para `resolveThemeForMode`. */
export interface SarakDerivedThemePreset {
    id: string;
    name: string;
    description?: string;
    design: Record<string, unknown>;
    contraparte?: Partial<SarakDesignState>;
}

/**
 * Deriva um tema COMPLETO — `design` e `contraparte` — de um tema de
 * referência: o id do tema do boot (síncrono) ou um preset já carregado. Substitui o padrão que a spec 09 §4.1 registrou como
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
export function sarakDeriveThemeFromReference(
    referenceOrId: SarakReferenceThemeId | SarakThemePreset,
    overrides: SarakThemeReferenceOverrides,
): SarakDerivedThemePreset {
    const reference = typeof referenceOrId === 'string'
        ? SARAK_BOOT_THEMES.find((theme) => theme.id === referenceOrId)
        : referenceOrId;
    if (!reference) {
        throw new Error(
            `Tema de referência "${String(referenceOrId)}" não está no boot. Carregue-o antes ` +
            '(`await sarakLoadThemePreset(id)`) e passe o preset como 1º argumento.',
        );
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
