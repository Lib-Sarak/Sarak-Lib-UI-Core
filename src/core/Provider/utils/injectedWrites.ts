/** O mínimo que o injetor precisa de um elemento: o estilo inline e os atributos. */
export interface InjectionHost {
    style: {
        getPropertyValue: (name: string) => string;
        setProperty: (name: string, value: string) => void;
        removeProperty: (name: string) => unknown;
    };
    getAttribute: (name: string) => string | null;
    setAttribute: (name: string, value: string) => void;
    removeAttribute: (name: string) => void;
}

/** O que o injetor escreveu em cada elemento da última vez: a base da limpeza na troca de tema. */
const WRITTEN_BY_INJECTOR = new WeakMap<object, { variables: string[]; attributes: string[] }>();

/**
 * Tira do elemento TUDO o que o injetor escreveu nele e esquece o registro: é o que o Provider faz ao sair, para o host
 * não ficar com o tema (centenas de variáveis inline e os atributos de estado) depois de a ilha desmontar. O que o host
 * gravou por fora não é tocado.
 */
export const releaseInjectedWrites = (host: InjectionHost): void => {
    const previous = WRITTEN_BY_INJECTOR.get(host);
    if (!previous) return;
    previous.variables.forEach((name) => host.style.removeProperty(name));
    previous.attributes.forEach((name) => host.removeAttribute(name));
    WRITTEN_BY_INJECTOR.delete(host);
};

/**
 * Escreve no elemento as variáveis e os atributos do tema e tira o que o tema anterior escreveu e este não
 * escreve. Sem a limpeza, a variável inline que sobrasse venceria o `<style>` responsivo do tema novo (o
 * estilo inline vence a folha) e o valor do tema anterior continuaria na tela.
 *
 * Só sai o que o PRÓPRIO injetor escreveu: variável que o host gravou por fora não é tocada. Só grava o que
 * mudou, para economizar reflow.
 */
export const syncInjectedWrites = (
    host: InjectionHost,
    variables: Record<string, string>,
    attributes: Record<string, string>,
): void => {
    const previous = WRITTEN_BY_INJECTOR.get(host);
    previous?.variables.filter((name) => !(name in variables)).forEach((name) => host.style.removeProperty(name));
    previous?.attributes.filter((name) => !(name in attributes)).forEach((name) => host.removeAttribute(name));

    Object.entries(variables).forEach(([name, value]) => {
        if (host.style.getPropertyValue(name) !== value) host.style.setProperty(name, value);
    });
    Object.entries(attributes).forEach(([name, value]) => {
        if (host.getAttribute(name) !== value) host.setAttribute(name, value);
    });

    WRITTEN_BY_INJECTOR.set(host, { variables: Object.keys(variables), attributes: Object.keys(attributes) });
};
