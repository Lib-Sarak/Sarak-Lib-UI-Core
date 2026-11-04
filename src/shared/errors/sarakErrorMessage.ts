import { LIBRARY_TEXT_CATALOG, LIBRARY_TEXT_FALLBACK_LANGUAGE } from '../../core/i18n/catalog';

/** Acima disto é despejo técnico (corpo de resposta, consulta), não frase para o usuário. */
const MAX_MESSAGE_LENGTH = 300;
/** `{ response: { data: { error: { message } } } }` é o caminho mais fundo das respostas comuns. */
const MAX_LOOKUP_DEPTH = 4;
const NESTED_MESSAGE_KEYS = ['message', 'error', 'errors', 'detail', 'title', 'data', 'response'] as const;
/** O que `fetch` lança por motor quando a rede falha: Chromium, Firefox e WebKit. */
const NETWORK_FAILURE_RE = /^(failed to fetch|networkerror when attempting to fetch resource\.?|load failed)$/i;
const STACK_LINE_RE = /\n\s+at\s/;
/** Erro do motor JS é defeito de código: `Cannot read properties of undefined` não é para o usuário. */
const PROGRAMMING_ERRORS = ['TypeError', 'ReferenceError', 'SyntaxError', 'RangeError', 'EvalError', 'URIError'];

const isSafeText = (text: string): boolean =>
    text.length > 0 && text.length <= MAX_MESSAGE_LENGTH && !text.startsWith('<') && !STACK_LINE_RE.test(text);

/** Um `getter` que lança numa resposta de terceiro não pode derrubar a própria mensagem de erro. */
const readProperty = (value: object, key: string): unknown => {
    try {
        return Reflect.get(value, key);
    } catch {
        return undefined;
    }
};

const readableMessage = (value: unknown, depth: number): string | undefined => {
    if (typeof value === 'string') return isSafeText(value.trim()) ? value.trim() : undefined;
    if (typeof value !== 'object' || value === null || depth >= MAX_LOOKUP_DEPTH) return undefined;
    if (Array.isArray(value)) return readableMessage(value[0], depth + 1);
    for (const key of NESTED_MESSAGE_KEYS) {
        const message = readableMessage(readProperty(value, key), depth + 1);
        if (message !== undefined) return message;
    }
    return undefined;
};

const defaultText = (key: 'errorMessageUnknown' | 'errorMessageNetwork'): string =>
    LIBRARY_TEXT_CATALOG[key][LIBRARY_TEXT_FALLBACK_LANGUAGE];

/**
 * Texto seguro para mostrar ao usuário a partir de um erro: `Error`, string ou resposta comum
 * de API (`message`, `error`, `errors[]`, `detail`, `title`, `data`, `response`). Rastro de
 * pilha, HTML, texto longo demais e erro do motor JS nunca passam.
 *
 * Fora do React não há idioma ativo: quem exibe em outra língua passa `fallback` de
 * `useLibraryText()`, e ele vale também para a falha de rede.
 */
export const sarakErrorMessage = (error: unknown, fallback?: string): string => {
    if (error instanceof Error && PROGRAMMING_ERRORS.includes(error.name)) {
        if (error.name === 'TypeError' && NETWORK_FAILURE_RE.test(error.message)) return fallback ?? defaultText('errorMessageNetwork');
        return fallback ?? defaultText('errorMessageUnknown');
    }
    return readableMessage(error, 0) ?? fallback ?? defaultText('errorMessageUnknown');
};
