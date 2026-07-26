/**
 * TEMPLATE — os temas do sistema, como CÓDIGO COMPARTILHADO.
 *
 * Este arquivo é o que mantém a aparência idêntica entre apps que não se veem em
 * runtime (topologias 2/3/4 do GUIA-FRONTEND.md §2): todos importam daqui.
 *
 * Regra que evita o erro clássico: NUNCA monte um tema do zero com um punhado de
 * chaves de cor. Eixos omitidos (fonte, cromo, raio, espaçamento) simplesmente não
 * mudam — o sintoma é "troquei o tema e a fonte continuou igual". Parta de um tema
 * COMPLETO e sobrescreva poucos valores.
 */
import { SARAK_REFERENCE_THEMES, type ThemePreset } from '@sarak/lib-ui-core';

/**
 * As chaves de `design` válidas estão em `sarak-ui/catalog.json` → `designTokens.ids`
 * (cada uma com o tipo esperado). Chave desconhecida ou valor de tipo errado é
 * DESCARTADO com `console.warn` pelo Design Engine — se um ajuste "não pegou", o
 * console diz por quê.
 */
const MARCA = {
    primaryColor: '#2563eb',
    accentColor: '#38bdf8',
} as const;

/**
 * O par de referência já é completo em todos os eixos e difere de propósito em modo
 * (claro/escuro), cromo (topbar/sidebar) e fonte — trocar entre os dois prova que a
 * central alcança a aplicação inteira.
 */
export const TEMAS: ThemePreset[] = SARAK_REFERENCE_THEMES.map((tema) => ({
    ...tema,
    design: { ...tema.design, ...MARCA },
}));

/**
 * Quer partir de outro ponto? `catalog.json` → `themes.presetIds` lista os temas
 * embutidos; `getThemePreset(id)` devolve o preset completo de qualquer um deles.
 *
 * Quer ajustar visualmente? Abra o `CustomizationPanel`, mexa nos controles e use
 * "Exportar JSON": o arquivo baixado nasce COMPLETO, pronto para colar aqui. Não
 * existe "salvar tema no banco" — salvar É exportar para o seu repositório.
 */
