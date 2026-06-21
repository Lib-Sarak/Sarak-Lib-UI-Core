/**
 * Motor de Repetição (Spec 23) — barrel.
 *
 * Expande a diretiva `renderFor` em instâncias com escopo local. Consumido pelo
 * Renderer, que decide entre map direto e virtualização (Spec 12) pelo limiar.
 */

export {
    expandRenderFor,
    VIRTUALIZE_THRESHOLD,
    type ExpandedNode,
    type RenderForResult,
} from './expandRenderFor';
