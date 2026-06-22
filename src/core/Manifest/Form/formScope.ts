/**
 * Escopo de Formulário (Spec 32, Regras 2 e 4)
 *
 * Controlador PURO (sem React) de um `form: { id, resetOn? }`: isola valores, dirty,
 * touched e erros de um formulário montado sobre o DataStore. Os VALORES vivem no
 * próprio DataStore (escritos pela diretiva `model` via two-way) — este escopo guarda
 * apenas o META-estado (quais campos pertencem ao form, quais estão sujos/tocados,
 * os valores iniciais para reset) e deriva validade/payload sob demanda.
 *
 * Store injetável (`FormStore`) para teste isolado sem React/DataStore real.
 * Zero Any: valores de campo são `unknown` na fronteira, nunca `any` (Regra 5).
 */

import type { ValidationSchema } from '../types';
import { validateValue, type ValidationError } from './validate';
import { setByPath, type StateRecord } from '../DataStore/resolvePath';

/** Acesso mínimo ao estado que o escopo precisa (subconjunto do SarakDataStore). */
export interface FormStore {
    get(path: string): unknown;
    set(path: string, value: unknown): void;
}

/** Chave de estado onde o meta-estado do form é espelhado (lido por `{{form.*}}`). */
export const FORM_META_KEY = 'form';

interface FieldEntry {
    schema?: ValidationSchema;
}

/** Contrato do escopo de formulário ativo. */
export interface FormScope {
    /** Identificador do form (da diretiva `form.id`). */
    readonly id: string;
    /** Registra um campo (pelo seu `model` path); devolve a função de baixa. */
    registerField(path: string, schema?: ValidationSchema): () => void;
    /** Marca um campo como sujo (valor mudou em relação ao inicial). */
    markDirty(path: string): void;
    /** Marca um campo como tocado (recebeu e perdeu foco). */
    markTouched(path: string): void;
    /** True se o campo já foi tocado (controla quando exibir erro). */
    isTouched(path: string): boolean;
    /** Valida TODOS os campos registrados contra os valores atuais do store. */
    validate(): Record<string, ValidationError[]>;
    /** True se algum campo registrado tem erro agora. */
    hasErrors(): boolean;
    /** Monta o payload de submit a partir dos `model` registrados (estrutura aninhada). */
    buildPayload(): StateRecord;
    /** Restaura os valores iniciais e limpa dirty/touched (Regra 4 — `resetOn`). */
    reset(): void;
    /** Sinaliza tentativa de submit: campos passam a exibir erro mesmo sem `touched`. */
    markSubmitAttempted(): void;
    /** True após uma tentativa de submit (limpo no reset). */
    readonly submitAttempted: boolean;
    /** True se algum campo está sujo. */
    readonly isDirty: boolean;
    /** Assina mudanças de meta-estado (touched/dirty/submitAttempted) para re-render. */
    subscribe(listener: () => void): () => void;
}

/**
 * Cria um escopo de formulário. `store` é opcional: sem ele, o escopo degrada para
 * no-op de leitura/escrita (a árvore não quebra fora de um DataStore).
 */
export const createFormScope = (id: string, store?: FormStore): FormScope => {
    const fields = new Map<string, FieldEntry>();
    const initialValues = new Map<string, unknown>();
    const dirty = new Set<string>();
    const touched = new Set<string>();
    const listeners = new Set<() => void>();
    let submitAttempted = false;

    const read = (path: string): unknown => store?.get(path);

    const notify = (): void => {
        for (const listener of [...listeners]) listener();
    };

    /** Espelha o meta-estado em `form.*` para o avaliador condicional (Spec 26). */
    const mirrorMeta = (): void => {
        if (!store) return;
        store.set(`${FORM_META_KEY}.isDirty`, dirty.size > 0);
    };

    return {
        id,

        registerField(path, schema) {
            fields.set(path, { schema });
            // Captura o valor inicial uma única vez (para o reset).
            if (!initialValues.has(path)) initialValues.set(path, read(path));
            return () => {
                fields.delete(path);
                initialValues.delete(path);
                dirty.delete(path);
                touched.delete(path);
            };
        },

        markDirty(path) {
            if (dirty.has(path)) return;
            dirty.add(path);
            mirrorMeta();
            notify();
        },

        markTouched(path) {
            if (touched.has(path)) return;
            touched.add(path);
            notify();
        },

        isTouched(path) {
            return touched.has(path);
        },

        validate() {
            const result: Record<string, ValidationError[]> = {};
            for (const [path, entry] of fields) {
                const errors = validateValue(read(path), entry.schema);
                if (errors.length > 0) result[path] = errors;
            }
            return result;
        },

        hasErrors() {
            for (const [path, entry] of fields) {
                if (validateValue(read(path), entry.schema).length > 0) return true;
            }
            return false;
        },

        buildPayload() {
            let payload: StateRecord = {};
            for (const path of fields.keys()) {
                payload = setByPath(payload, path, read(path));
            }
            return payload;
        },

        reset() {
            if (store) {
                for (const [path, value] of initialValues) store.set(path, value);
            }
            dirty.clear();
            touched.clear();
            submitAttempted = false;
            mirrorMeta();
            notify();
        },

        markSubmitAttempted() {
            submitAttempted = true;
            notify();
        },

        get submitAttempted() {
            return submitAttempted;
        },

        get isDirty() {
            return dirty.size > 0;
        },

        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
};
