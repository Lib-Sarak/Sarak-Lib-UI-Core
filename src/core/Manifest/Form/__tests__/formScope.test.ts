import { describe, it, expect, vi } from 'vitest';
import { createFormScope, FORM_META_KEY } from '../formScope';
import { createSarakDataStore } from '../../DataStore/SarakDataStore';
import type { ValidationSchema } from '../../types';

const REQUIRED: ValidationSchema = [{ rule: 'required' }];

describe('Spec 32 — Escopo de formulário (createFormScope)', () => {
    it('buildPayload monta estrutura aninhada só com os campos registrados', () => {
        const store = createSarakDataStore({
            user: { name: 'Ana', email: 'a@b.com' },
            ignorado: 'fora do form',
        });
        const form = createFormScope('cadastro', store);
        form.registerField('user.name');
        form.registerField('user.email');

        expect(form.buildPayload()).toEqual({ user: { name: 'Ana', email: 'a@b.com' } });
    });

    it('hasErrors valida os campos registrados contra o estado atual', () => {
        const store = createSarakDataStore({ user: { name: '' } });
        const form = createFormScope('f', store);
        form.registerField('user.name', REQUIRED);

        expect(form.hasErrors()).toBe(true);
        store.set('user.name', 'Preenchido');
        expect(form.hasErrors()).toBe(false);
    });

    it('markDirty espelha form.isDirty no store (lido por {{form.isDirty}}) e notifica', () => {
        const store = createSarakDataStore({ user: { name: 'x' } });
        const form = createFormScope('f', store);
        const listener = vi.fn();
        form.subscribe(listener);
        form.registerField('user.name');

        expect(form.isDirty).toBe(false);
        form.markDirty('user.name');

        expect(form.isDirty).toBe(true);
        expect(store.get(`${FORM_META_KEY}.isDirty`)).toBe(true);
        expect(listener).toHaveBeenCalled();
    });

    it('reset restaura valores iniciais e limpa dirty/touched/submitAttempted', () => {
        const store = createSarakDataStore({ user: { name: 'Inicial' } });
        const form = createFormScope('f', store);
        form.registerField('user.name', REQUIRED);

        store.set('user.name', 'Editado');
        form.markDirty('user.name');
        form.markTouched('user.name');
        form.markSubmitAttempted();
        expect(form.submitAttempted).toBe(true);

        form.reset();

        expect(store.get('user.name')).toBe('Inicial');
        expect(form.isDirty).toBe(false);
        expect(form.isTouched('user.name')).toBe(false);
        expect(form.submitAttempted).toBe(false);
    });

    it('markSubmitAttempted notifica para revelar erros mesmo sem touched', () => {
        const store = createSarakDataStore({ user: { name: '' } });
        const form = createFormScope('f', store);
        const listener = vi.fn();
        form.subscribe(listener);
        form.registerField('user.name', REQUIRED);

        form.markSubmitAttempted();
        expect(form.submitAttempted).toBe(true);
        expect(listener).toHaveBeenCalled();
    });

    it('a baixa do campo (unregister) o remove do escopo', () => {
        const store = createSarakDataStore({ user: { name: '' } });
        const form = createFormScope('f', store);
        const off = form.registerField('user.name', REQUIRED);
        expect(form.hasErrors()).toBe(true);
        off();
        expect(form.hasErrors()).toBe(false);
        expect(form.buildPayload()).toEqual({});
    });

    it('sem store: degrada para no-op sem quebrar', () => {
        const form = createFormScope('f');
        form.registerField('a.b', REQUIRED);
        expect(() => {
            form.markDirty('a.b');
            form.reset();
        }).not.toThrow();
        // Sem store, o valor é undefined → required acusa erro.
        expect(form.hasErrors()).toBe(true);
    });

    it('model em índice de array PRESERVA o array (correção do setByPath)', () => {
        // Antes era um caveat (a escrita em índice colapsava o array em objeto).
        // O setByPath agora clona arrays como arrays — a escrita por índice é segura.
        const store = createSarakDataStore<{ tags: string[] }>({ tags: ['a', 'b'] });
        store.set('tags.1', 'B');
        expect(Array.isArray(store.get('tags'))).toBe(true);
        expect(store.get('tags')).toEqual(['a', 'B']);

        // Substituir a fatia inteira continua válido (atualização imutável idiomática).
        const store2 = createSarakDataStore<{ tags: string[] }>({ tags: ['a', 'b'] });
        const tags = [...(store2.get('tags') as string[])];
        tags[1] = 'B';
        store2.set('tags', tags);
        expect(store2.get('tags')).toEqual(['a', 'B']);
    });
});
