import { describe, expect, it } from 'vitest';
import { releaseInjectedWrites, syncInjectedWrites } from '../injectedWrites';

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
