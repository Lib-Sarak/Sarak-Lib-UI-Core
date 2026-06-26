import { useCallback } from 'react';
import { DiscoveredModule } from '../types';

export function useEndpointResolver(module?: DiscoveredModule) {
    return useCallback((endpointKey: string) => {
        if (!module) return endpointKey;

        // O mapa de endpoints aceita tanto chave→path direto quanto versão→(chave→path)
        // aninhado (dot-notation `v1.models`). Tipamos a forma real localmente — sem `any`.
        const endpoints = module.endpoints as
            | Record<string, string | Record<string, string>>
            | undefined;

        // 1. Resolve via dot-notation (v1.models)
        if (endpointKey && endpointKey.includes('.')) {
            const [version, key] = endpointKey.split('.');
            const versionMap = endpoints?.[version];
            if (versionMap && typeof versionMap === 'object') {
                const path = versionMap[key];
                if (path) {
                    return `${module.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
                }
            }
        }

        // 2. Resolve via direct key in endpoints
        const directPath = endpoints?.[endpointKey];
        if (directPath && typeof directPath === 'string') {
            return `${module.baseUrl}${directPath.startsWith('/') ? directPath : '/' + directPath}`;
        }

        // 3. Fallback: If starts with /, use baseUrl + path
        if (endpointKey && endpointKey.startsWith('/')) {
            return `${module.baseUrl}${endpointKey}`;
        }

        return endpointKey;
    }, [module]);
}
