import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Porta ÚNICA de configuração do `tailwind-merge` desta base — nenhum átomo deve
 * chamar `extendTailwindMerge`/`twMerge` por conta própria. Em Tailwind, duas
 * utilitárias que escrevem a mesma propriedade têm a MESMA especificidade: quem vence
 * é a que aparece depois no stylesheet emitido, não a que aparece depois no atributo
 * `class`. `tailwind-merge` resolve isso por GRUPO de classe — só reconhece o conflito
 * se a classe estiver registrada no grupo certo. As quatro utilitárias PRÓPRIAS desta
 * base (não emitidas pelo Tailwind puro) precisam da extensão abaixo, ou o merge não
 * as vê e elas passam a COEXISTIR com o conflito, em vez de resolvê-lo:
 * - `text-2xs` / `text-3xs` — tokens de `src/styles/_theme.css`, grupo `font-size`.
 * - `rounded-btn` — classe avulsa de `src/styles/_theme.css`, grupo `rounded`.
 * - `font-tab` — classe avulsa de `src/styles/_typography.css`, grupo `font-family`.
 */
const twMergeSarak = extendTailwindMerge({
    extend: {
        classGroups: {
            'font-size': [{ text: ['2xs', '3xs'] }],
            rounded: ['rounded-btn'],
            'font-family': ['font-tab'],
        },
    },
});

/**
 * Compõe classes de um átomo pela regra de contrato: quando duas entradas escrevem a
 * mesma propriedade, a ÚLTIMA vence. Chame sempre com a `className` recebida do
 * chamador por último, para que ela vença o default do átomo.
 */
export function mergeSarakClasses(...classes: Array<string | undefined | null | false>): string {
    return twMergeSarak(...classes);
}
