/**
 * Dispatcher Central de Eventos e Ações (Spec 25)
 *
 * Medula da interatividade: traduz a diretiva declarativa `actions: []` num pipeline
 * de execução real. As ações rodam EM SEQUÊNCIA (Regra 2) — uma assíncrona (`api_call`)
 * só libera a próxima em sucesso; em falha, a cadeia para e o `onError` é disparado.
 *
 * A biblioteca NÃO conhece rede/rota/feedback diretamente: tudo entra por um
 * `DispatchContext` injetável (interceptor, navigate, toast, overlay) — a mesma
 * fronteira de confiança da Fonte de Dados (Spec 31, Regra 5).
 *
 * Zero Any: payloads são `ManifestProps`; as fronteiras dinâmicas são `unknown`.
 */

import type { ActionList, ManifestAction, ManifestProps } from '../types';
import type { SarakDataStore } from '../DataStore/SarakDataStore';
import type { StateRecord } from '../DataStore/resolvePath';
import type { NetworkInterceptor, NetworkRequest } from '../DataSource/useDataSource';
import type { DataSourceMethod } from '../types';
import type { ToastController, ToastVariant } from '../../../components/atomic/Feedback/SarakToast';
import type { FormScope } from '../Form/formScope';
import { interpolate, interpolateProps } from '../Binding/interpolate';

/**
 * Sinaliza que um `api_call` com `submit: true` foi BARRADO pela Validação (Spec 29,
 * Regra 2). `runActions` o reconhece e interrompe a cadeia SILENCIOSAMENTE — sem
 * disparar `onError` (diferente de uma falha de rede real).
 */
export class SubmitBlockedError extends Error {
    constructor(message = 'Submit bloqueado por validação.') {
        super(message);
        this.name = 'SubmitBlockedError';
    }
}

/** Pedido de overlay imperativo (open_modal/open_drawer). */
export interface OverlayRequest {
    kind: 'modal' | 'drawer';
    title?: string;
    message?: string;
}

/** Controller de overlays injetado (Spec 13 fornece a implementação). */
export interface OverlayController {
    open(request: OverlayRequest): void;
    close(): void;
}

/** Callback de navegação injetado pelo importador (router do consumidor). */
export type NavigateFn = (to: string, payload?: ManifestProps) => void;

/**
 * Capacidades disponíveis às ações. Tudo opcional: um handler que precise de uma
 * capacidade ausente falha de forma controlada (loga; em `api_call`, propaga o erro
 * para parar a cadeia). `scope`/`global` alimentam a interpolação (Spec 24).
 */
export interface DispatchContext {
    store?: SarakDataStore<StateRecord>;
    interceptor?: NetworkInterceptor;
    toast?: ToastController;
    navigate?: NavigateFn;
    overlay?: OverlayController;
    /** Escopo de formulário ativo (Spec 32) — usado pelo `api_call` com `submit`. */
    form?: FormScope;
    scope: StateRecord;
    global: unknown;
}

/** Handler de uma ação. Pode ser assíncrono (a cadeia aguarda). */
export type ActionHandler = (action: ManifestAction, ctx: DispatchContext) => void | Promise<void>;

const asString = (value: unknown, fallback = ''): string =>
    typeof value === 'string' ? value : value == null ? fallback : String(value);

/** Interpola o payload da ação contra o escopo+estado (Regra 4: URL/body dinâmicos). */
const resolvePayload = (action: ManifestAction, ctx: DispatchContext): ManifestProps =>
    interpolateProps(action.payload ?? {}, ctx.scope, ctx.global);

// ---------------------------------------------------------------------------
// Catálogo de ações padronizadas (Regra 1)
// ---------------------------------------------------------------------------

const apiCall: ActionHandler = async (action, ctx) => {
    // Submit de formulário (Spec 29, Regra 2 + Spec 32, Regra 3): marca a tentativa
    // (campos passam a exibir erro) e BARRA silenciosamente se a Validação acusar erro.
    let submitPayload: ManifestProps | undefined;
    if (action.submit && ctx.form) {
        ctx.form.markSubmitAttempted();
        if (ctx.form.hasErrors()) {
            throw new SubmitBlockedError();
        }
        // Monta o payload a partir dos `model` do form-escopo (estrutura aninhada).
        submitPayload = ctx.form.buildPayload() as ManifestProps;
    }

    if (!ctx.interceptor) {
        throw new Error('[Sarak:Dispatcher] api_call sem networkInterceptor injetado.');
    }
    // `endpoint` é interpolado mesmo quando misturado a texto (ex.: `/users/{{user.id}}`).
    const endpoint = interpolate(asString(action.payload?.endpoint), ctx.scope, ctx.global);
    const payload = resolvePayload(action, ctx);
    // `params` explícito do JSON tem prioridade; senão usa o payload montado do form.
    const explicitParams = payload.params as ManifestProps | undefined;
    const request: NetworkRequest = {
        endpoint,
        method: payload.method as DataSourceMethod | undefined,
        params: explicitParams ?? submitPayload,
    };
    const data = await ctx.interceptor(request);
    // Opcional: deposita o resultado no estado para outras engines lerem.
    const into = asString(payload.into);
    if (into && ctx.store) ctx.store.set(into, data);
    // Sucesso do submit: dispara o reset declarativo (Spec 32, Regra 4 — `resetOn`).
    if (action.submit && ctx.form) ctx.form.reset();
};

const mutateState: ActionHandler = (action, ctx) => {
    if (!ctx.store) throw new Error('[Sarak:Dispatcher] mutate_state sem DataStore.');
    const payload = resolvePayload(action, ctx);
    const path = asString(payload.path);
    if (!path) throw new Error('[Sarak:Dispatcher] mutate_state exige `payload.path`.');
    ctx.store.mutate_state(path, payload.value);
};

const navigate: ActionHandler = (action, ctx) => {
    if (!ctx.navigate) throw new Error('[Sarak:Dispatcher] navigate sem callback de rota.');
    const payload = resolvePayload(action, ctx);
    ctx.navigate(asString(payload.to), payload);
};

const triggerToast: ActionHandler = (action, ctx) => {
    const payload = resolvePayload(action, ctx);
    if (!ctx.toast) {
        console.warn('[Sarak:Dispatcher] trigger_toast sem controller de toast; ignorado.');
        return;
    }
    ctx.toast.notify({
        message: asString(payload.message),
        variant: (payload.variant as ToastVariant | undefined) ?? 'info',
        duration: typeof payload.duration === 'number' ? payload.duration : undefined,
    });
};

const openOverlay = (kind: OverlayRequest['kind']): ActionHandler => (action, ctx) => {
    const payload = resolvePayload(action, ctx);
    if (!ctx.overlay) {
        console.warn(`[Sarak:Dispatcher] open_${kind} sem controller de overlay; ignorado.`);
        return;
    }
    ctx.overlay.open({ kind, title: asString(payload.title), message: asString(payload.message) });
};

const closeOverlay: ActionHandler = (_action, ctx) => {
    ctx.overlay?.close();
};

/** Registry tipado `type → handler` (Regra 1). Extensível sem `any`. */
export const ACTION_HANDLERS: Readonly<Record<string, ActionHandler>> = {
    api_call: apiCall,
    mutate_state: mutateState,
    navigate,
    trigger_toast: triggerToast,
    open_modal: openOverlay('modal'),
    open_drawer: openOverlay('drawer'),
    close_modal: closeOverlay,
    close_drawer: closeOverlay,
    close_overlay: closeOverlay,
};

const runSingle = async (action: ManifestAction, ctx: DispatchContext): Promise<void> => {
    const handler = ACTION_HANDLERS[action.type];
    if (!handler) {
        console.warn(`[Sarak:Dispatcher] ação desconhecida "${action.type}"; ignorada.`);
        return;
    }
    await handler(action, ctx);
};

/**
 * Executa uma lista de ações em sequência (Regra 2). Se uma ação falhar, as seguintes
 * são BLOQUEADAS e a lista `onError` (se houver) é disparada — best-effort, sem
 * recursão de `onError` sobre `onError`.
 */
export const runActions = async (
    actions: ActionList,
    ctx: DispatchContext,
    onError?: ActionList,
): Promise<void> => {
    for (const action of actions) {
        try {
            await runSingle(action, ctx);
        } catch (err) {
            // Submit barrado pela Validação: para a cadeia em silêncio (Spec 29, Regra 2).
            if (err instanceof SubmitBlockedError) return;
            const reason = err instanceof Error ? err.message : String(err);
            console.warn(`[Sarak:Dispatcher] ação "${action.type}" falhou: ${reason}. Cadeia interrompida.`);
            if (onError && onError.length > 0) {
                for (const fallback of onError) {
                    try {
                        await runSingle(fallback, ctx);
                    } catch {
                        // onError é best-effort: nunca relança.
                    }
                }
            }
            return;
        }
    }
};
