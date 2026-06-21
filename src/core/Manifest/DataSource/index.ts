/**
 * Fonte de Dados Declarativa (Spec 31) — barrel.
 *
 * Hook de ciclo de vida que carrega dados via `networkInterceptor` e deposita no
 * DataStore. Consumido pelo Renderer (nó `DataSourceNode`).
 */

export {
    useDataSource,
    type NetworkInterceptor,
    type NetworkRequest,
    type DataSourceController,
} from './useDataSource';
