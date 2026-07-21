/**
 * Gate de Submit à Prova de Erro de Autoria (Spec 28 §2.2 + Spec 29/32)
 *
 * Extraído de `createDispatcher.ts` para manter o arquivo abaixo do limite de linhas
 * (MAX_LINES=250, `ui-auditoria-modulo`) — mesma responsabilidade única: decidir se um
 * `api_call` pode seguir, montar o payload de submit e bloquear silenciosamente quando a
 * Validação (ou uma tentativa de burlá-la em silêncio) o exigir.
 *
 * Zero Any: `DispatchContext`/`ManifestAction`/`ManifestProps` são só tipo (`import
 * type`) — o ciclo de módulo com `createDispatcher.ts` é só de tipagem, apagado no
 * build (nunca vira dependência circular em runtime).
 */
import type { ManifestAction, ManifestProps } from '../types';
import type { DispatchContext } from './createDispatcher';

/**
 * Sinaliza que um `api_call` foi BARRADO pela Validação — seja um submit reconhecido
 * com erro (Spec 29, Regra 2), seja um `api_call` dentro de um form-escopo com erro que
 * NÃO foi marcado como submit (Spec 28 §2.2, defesa contra burlar o gate em silêncio).
 * `runActions` reconhece a classe e interrompe a cadeia SILENCIOSAMENTE — sem disparar
 * `onError` (diferente de uma falha de rede real).
 */
export class SubmitBlockedError extends Error {
    constructor(message = 'Submit bloqueado por validação.') {
        super(message);
        this.name = 'SubmitBlockedError';
    }
}

/**
 * Leniência de posicionamento do `submit` (Spec 28 §2.1): `action.submit` é o local
 * canônico, mas `payload.submit` é aceito como ALIAS — é intuitivo escrever `submit`
 * junto do `endpoint`/`params`, e foi exatamente o erro de autoria real do Selo.
 */
export const isSubmitAction = (action: ManifestAction): boolean =>
    Boolean(action.submit) || (action.payload as Record<string, unknown> | undefined)?.submit === true;

/**
 * Resolve o payload de submit e faz cumprir a validação. Três ramos INDEPENDENTES
 * (nunca `else if` — Clean Code), mutuamente exclusivos pelas próprias condições:
 *  1. submit reconhecido + form ativo → marca a tentativa, BARRA se houver erro,
 *     senão monta o payload a partir dos `model`.
 *  2. submit reconhecido SEM form ativo → nada para validar; só avisa (nada a montar).
 *  3. submit NÃO reconhecido + form ativo COM ERRO → é o jeito de burlar o gate em
 *     silêncio (achado do Selo); avisa E bloqueia — persistir dado inválido é o dano
 *     concreto, decisão confirmada com o mantenedor.
 */
export const resolveSubmitPayload = (action: ManifestAction, ctx: DispatchContext): ManifestProps | undefined => {
    const submitFlag = isSubmitAction(action);

    if (submitFlag && ctx.form) {
        ctx.form.markSubmitAttempted();
        if (ctx.form.hasErrors()) {
            throw new SubmitBlockedError();
        }
        return ctx.form.buildPayload() as ManifestProps;
    }

    if (submitFlag && !ctx.form) {
        console.warn(
            '[Sarak:Dispatcher] api_call marcado com "submit": true, mas nenhum form-escopo ativo ' +
                '(envolva os campos num nó com "form": { "id": "..." }) — a validação não roda.',
        );
        return undefined;
    }

    if (!submitFlag && ctx.form?.hasErrors()) {
        console.warn(
            '[Sarak:Dispatcher] api_call enviando um formulário com erros de validação SEM "submit": true ' +
                '— a chamada foi BLOQUEADA. Marque "submit": true (no topo da ação ou em `payload.submit`) ' +
                'para barrar corretamente o envio inválido.',
        );
        throw new SubmitBlockedError('api_call bloqueado: form-escopo ativo com erros e "submit" não reconhecido.');
    }

    return undefined;
};
