/**
 * Entrada de pacote `@sarak/lib-ui-core/eslint` — o plugin do kit de verificação de uso. Fica fora do
 * barril: quem não a importa não paga nada, e o `eslint` (peer opcional) nunca é importado daqui.
 */
export { default, rules } from './verify/plugin';
