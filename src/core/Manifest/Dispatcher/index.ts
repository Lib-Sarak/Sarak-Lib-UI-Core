/**
 * Barrel do Dispatcher Central de Eventos (Spec 25).
 */
export {
    runActions,
    ACTION_HANDLERS,
    SubmitBlockedError,
    type DispatchContext,
    type ActionHandler,
    type OverlayController,
    type OverlayRequest,
    type NavigateFn,
} from './createDispatcher';
export { debounce, throttle } from './rateLimit';
