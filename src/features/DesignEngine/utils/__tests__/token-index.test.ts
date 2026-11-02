import { describe, it, expect } from 'vitest';
import { indexOf, normalizeText, tokenizeText, type SearchableToken } from '../token-index';

const token: SearchableToken = { id: 'cardShadowBlur', label: 'Desfoque da Sombra', type: 'text', defaultValue: '' };

describe('token-index', () => {
    it('normaliza acento e caixa e descarta palavras de ligação e de pedido', () => {
        expect(normalizeText('Tipográfia')).toBe('tipografia');
        expect(tokenizeText('Mudar a Cor do Botão')).toEqual(['cor', 'botao']);
    });

    it('indexa nome, categorias e rótulos das opções', () => {
        const index = indexOf({ ...token, options: [{ value: 'off', label: 'Não oferecida' }] }, { name: 'Sombra Suave', categories: ['efeitos'] });
        expect(index.title.has('suave')).toBe(true);
        expect(index.category.has('efeitos')).toBe(true);
        expect(index.other.has('oferecida')).toBe(true);
    });

    it('reaproveita o índice enquanto rótulo e entrada não mudam, e refaz quando mudam', () => {
        const entry = { name: 'A' };
        expect(indexOf(token, entry)).toBe(indexOf({ ...token }, entry));
        expect(indexOf({ ...token, label: 'Outro' }, entry).title.has('outro')).toBe(true);
    });
});
