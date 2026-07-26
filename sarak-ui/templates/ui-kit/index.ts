/**
 * TEMPLATE — a PORTA ÚNICA do pacote compartilhado (`ui-kit`).
 *
 * Os apps importam SEMPRE daqui, nunca de `@sarak/lib-ui-core` direto. Duas razões:
 *  1. garante UMA cópia da biblioteca (duas cópias = dois contextos React = tema
 *     aplicado pela metade);
 *  2. no dia em que existir um wrapper próprio de algum componente, você troca aqui
 *     e nenhum chamador muda.
 *
 * O `export *` abaixo NÃO custa nada no bundle: medido byte a byte contra a
 * alternativa (reexportar só o que se usa), a saída é idêntica — o empacotador
 * resolve o grafo igual nos dois casos. Não vale a pena manter uma lista à mão.
 */
export * from '@sarak/lib-ui-core';

export { TEMAS } from './themes';
export { NAV } from './nav';

/**
 * Ponha aqui o que é COMUM a todos os apps e não é da biblioteca: seus componentes
 * compartilhados, seus hooks de sessão, seus helpers de formatação.
 *
 * O que NÃO entra aqui: nada específico de um app. Se só um app usa, mora no app —
 * `ui-kit` que vira depósito volta a acoplar tudo em tudo.
 */
