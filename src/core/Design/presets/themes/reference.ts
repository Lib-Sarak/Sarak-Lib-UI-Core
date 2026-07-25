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
