import { clearOwnedValue, releaseOwnedValues, writeOwnedValue, type InjectionOwner } from './injectedOwnership';

/** O mínimo que o injetor precisa de um elemento: estilo inline e atributos. */
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

const LEGACY_OWNER: InjectionOwner = {};
const THEME_KEYS = new WeakMap<object, Set<string>>();

const themeKeysFor = (host: object): Set<string> => {
    const existing = THEME_KEYS.get(host);
    if (existing) return existing;

    const keys = new Set<string>();
    THEME_KEYS.set(host, keys);
    return keys;
};

const styleValue = (host: InjectionHost, name: string): string | null => host.style.getPropertyValue(name) || null;
const attributeValue = (host: InjectionHost, name: string): string | null => host.getAttribute(name);
const nullableStringEquals = (left: unknown, right: unknown): boolean => left === right;

const writeStyleValue = (host: InjectionHost, name: string, value: string | null, owner: InjectionOwner): void => {
    const key = `style:${name}`;
    if (value === null) {
        clearOwnedValue(host, key);
        return;
    }

    writeOwnedValue(
        host,
        key,
        owner,
        value,
        () => styleValue(host, name),
        (next) => {
            if (next === null) host.style.removeProperty(name);
            else host.style.setProperty(name, String(next));
        },
        nullableStringEquals,
    );
};

const writeAttributeValue = (host: InjectionHost, name: string, value: string | null, owner: InjectionOwner): void => {
    const key = `attribute:${name}`;
    if (value === null) {
        clearOwnedValue(host, key);
        return;
    }

    writeOwnedValue(
        host,
        key,
        owner,
        value,
        () => attributeValue(host, name),
        (next) => {
            if (next === null) host.removeAttribute(name);
            else host.setAttribute(name, String(next));
        },
        nullableStringEquals,
    );
};

/** Libera somente valores ainda escritos por esta instância. */
export const releaseInjectedWrites = (host: InjectionHost, owner: InjectionOwner = LEGACY_OWNER): void => {
    const themeKeys = themeKeysFor(host);
    releaseOwnedValues(host, owner).forEach((key) => themeKeys.delete(key));
};

/** Sincroniza os tokens e atributos do tema, devolvendo ao host os que foram omitidos. */
export const syncInjectedWrites = (
    host: InjectionHost,
    variables: Record<string, string>,
    attributes: Record<string, string>,
    owner: InjectionOwner = LEGACY_OWNER,
): void => {
    const themeKeys = themeKeysFor(host);
    const incomingKeys = new Set([
        ...Object.keys(variables).map((name) => `style:${name}`),
        ...Object.keys(attributes).map((name) => `attribute:${name}`),
    ]);

    for (const key of themeKeys) {
        if (!incomingKeys.has(key)) clearOwnedValue(host, key);
    }
    themeKeys.clear();
    incomingKeys.forEach((key) => themeKeys.add(key));

    Object.entries(variables).forEach(([name, value]) => writeStyleValue(host, name, value === '' ? null : value, owner));
    Object.entries(attributes).forEach(([name, value]) => writeAttributeValue(host, name, value, owner));
};

/** Registra uma escrita direta em propriedade CSS inline (fonte, ponteiro, bezier). */
export const writeInjectedStyleProperty = (
    host: InjectionHost,
    name: string,
    value: string | null,
    owner: InjectionOwner,
): void => writeStyleValue(host, name, value, owner);

/** Registra uma escrita direta em atributo do elemento. */
export const writeInjectedAttribute = (
    host: InjectionHost,
    name: string,
    value: string | null,
    owner: InjectionOwner,
): void => writeAttributeValue(host, name, value, owner);

/** Registra a presença de uma classe e restaura o estado anterior ao último owner. */
export const writeInjectedClass = (
    host: HTMLElement,
    name: string,
    present: boolean,
    owner: InjectionOwner,
): void => {
    writeOwnedValue(
        host,
        `class:${name}`,
        owner,
        present,
        () => host.classList.contains(name),
        (next) => host.classList.toggle(name, Boolean(next)),
        (left, right) => left === right,
    );
};

type StyleElementValue = { element: HTMLStyleElement; text: string; nonce: string | null };

/** Compartilha a folha responsiva sem permitir que uma instância antiga a remova. */
export const writeInjectedStyleElement = (
    parent: HTMLElement,
    id: string,
    text: string,
    nonce: string | undefined,
    owner: InjectionOwner,
): void => {
    const findStyleElement = (): HTMLStyleElement | null => {
        const element = Array.from(parent.children).find((child) => child.id === id && child.tagName === 'STYLE');
        return (element as HTMLStyleElement | undefined) ?? null;
    };
    const read = (): StyleElementValue | null => {
        const element = findStyleElement();
        return element ? { element, text: element.innerHTML, nonce: element.getAttribute('nonce') } : null;
    };
    const write = (next: unknown): void => {
        const value = next as StyleElementValue | null;
        const current = findStyleElement();
        if (!value) {
            current?.remove();
            return;
        }

        const element = current ?? parent.ownerDocument.createElement('style');
        element.id = id;
        element.innerHTML = value.text;
        if (value.nonce === null) element.removeAttribute('nonce');
        else element.setAttribute('nonce', value.nonce);
        if (!current) parent.appendChild(element);
    };
    const currentElement = findStyleElement();
    const value: StyleElementValue = {
        element: currentElement ?? parent.ownerDocument.createElement('style'),
        text,
        nonce: nonce ?? currentElement?.getAttribute('nonce') ?? null,
    };

    writeOwnedValue(
        parent,
        `style-element:${id}`,
        owner,
        value,
        read,
        write,
        (left, right) => {
            const first = left as StyleElementValue | null;
            const second = right as StyleElementValue | null;
            return first === null || second === null
                ? first === second
                : first.element === second.element && first.text === second.text && first.nonce === second.nonce;
        },
    );
};
