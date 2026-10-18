import { describe, expect, it } from 'vitest';
import { releaseInjectedWrites, syncInjectedWrites, type InjectionHost } from '../injectedWrites';

const makeHost = (): HTMLElement => document.createElement('div');

describe('syncInjectedWrites', () => {
    it('grava as variáveis e os atributos', () => {
        const host = makeHost();
        syncInjectedWrites(host, { '--a': '1px' }, { 'data-sx-x': 'y' });
        expect(host.style.getPropertyValue('--a')).toBe('1px');
        expect(host.getAttribute('data-sx-x')).toBe('y');
    });

    it('na troca, tira a variável e o atributo que a escrita nova não traz', () => {
        const host = makeHost();
        syncInjectedWrites(host, { '--a': '1px', '--b': '2px' }, { 'data-sx-x': 'y' });
        syncInjectedWrites(host, { '--b': '3px' }, {});
        expect(host.style.getPropertyValue('--a')).toBe('');
        expect(host.style.getPropertyValue('--b')).toBe('3px');
        expect(host.hasAttribute('data-sx-x')).toBe(false);
    });

    it('CONTRAPROVA: o que outra parte escreveu no elemento não é do injetor e fica', () => {
        const host = makeHost();
        host.style.setProperty('--do-host', 'x');
        host.setAttribute('data-do-host', '1');
        syncInjectedWrites(host, { '--a': '1px' }, {});
        syncInjectedWrites(host, {}, {});
        expect(host.style.getPropertyValue('--do-host')).toBe('x');
        expect(host.getAttribute('data-do-host')).toBe('1');
    });

    it('cada elemento tem a sua conta: limpar um não toca o outro', () => {
        const first = makeHost();
        const second = makeHost();
        syncInjectedWrites(first, { '--a': '1px' }, {});
        syncInjectedWrites(second, { '--a': '1px' }, {});
        syncInjectedWrites(first, {}, {});
        expect(first.style.getPropertyValue('--a')).toBe('');
        expect(second.style.getPropertyValue('--a')).toBe('1px');
    });

    describe('valor vazio (o tema novo não declara a imagem de fundo)', () => {
        /** Host que guarda `''` como valor, o oposto do `setProperty` do navegador (que o trata como remoção). */
        const makeLiteralHost = (): { host: InjectionHost; props: Map<string, string> } => {
            const props = new Map<string, string>();
            const host: InjectionHost = {
                style: {
                    getPropertyValue: (name) => props.get(name) ?? '',
                    setProperty: (name, value) => void props.set(name, value),
                    removeProperty: (name) => props.delete(name),
                },
                getAttribute: () => null,
                setAttribute: () => undefined,
                removeAttribute: () => undefined,
            };
            return { host, props };
        };
        const ART = { '--sarak-global-bg-image': 'https://exemplo.test/arte.png', '--sarak-global-background-image-url': 'https://exemplo.test/arte.png' };
        const NO_ART = { '--sarak-global-bg-image': '', '--sarak-global-background-image-url': '' };

        it('a troca para um tema sem imagem tira as duas variáveis do tema anterior', () => {
            const { host, props } = makeLiteralHost();
            syncInjectedWrites(host, ART, {});
            syncInjectedWrites(host, NO_ART, {});
            expect([...props.keys()]).toEqual([]);
        });

        it('CONTRAPROVA: o tema sem imagem desde o começo não escreve a variável vazia', () => {
            const { host, props } = makeLiteralHost();
            syncInjectedWrites(host, NO_ART, {});
            expect(props.size).toBe(0);
        });

        it('CONTRAPROVA: o valor não vazio continua sendo gravado e trocado', () => {
            const { host, props } = makeLiteralHost();
            syncInjectedWrites(host, ART, {});
            expect(props.get('--sarak-global-bg-image')).toBe('https://exemplo.test/arte.png');
            syncInjectedWrites(host, { ...ART, '--sarak-global-bg-image': 'https://exemplo.test/outra.png' }, {});
            expect(props.get('--sarak-global-bg-image')).toBe('https://exemplo.test/outra.png');
        });
    });

    it('releaseInjectedWrites tira tudo o que o injetor escreveu, e só isso, e esquece o registro', () => {
        const host = makeHost();
        host.style.setProperty('--do-host', 'x');
        syncInjectedWrites(host, { '--a': '1px', '--b': '2px' }, { 'data-sx-x': 'y' });
        releaseInjectedWrites(host);
        expect(host.style.getPropertyValue('--a')).toBe('');
        expect(host.style.getPropertyValue('--b')).toBe('');
        expect(host.hasAttribute('data-sx-x')).toBe(false);
        expect(host.style.getPropertyValue('--do-host')).toBe('x');
        // O registro sumiu: uma nova escrita parte do zero (não "lembra" de --a).
        syncInjectedWrites(host, { '--c': '3px' }, {});
        expect(host.style.getPropertyValue('--c')).toBe('3px');
    });

    it('releaseInjectedWrites num elemento nunca escrito não faz nada', () => {
        const host = makeHost();
        host.style.setProperty('--do-host', 'x');
        releaseInjectedWrites(host);
        expect(host.style.getPropertyValue('--do-host')).toBe('x');
    });
});
