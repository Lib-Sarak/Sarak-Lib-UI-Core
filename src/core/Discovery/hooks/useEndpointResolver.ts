import { useCallback } from 'react';
import { DiscoveredModule } from '../types';

export function useEndpointResolver(module?: DiscoveredModule) {
    return useCallback((endpointKey: string) => {
        if (!module) return endpointKey;
        
        // 1. Resolve via dot-notation (v1.models)
        if (endpointKey && endpointKey.includes('.')) {
            const [version, key] = endpointKey.split('.');
            const versionMap = (module.endpoints as any)?.[version];
            if (versionMap && versionMap[key]) {
                const path = versionMap[key];
                return `${module.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
            }
        }

        // 2. Resolve via direct key in endpoints
        const directPath = (module.endpoints as any)?.[endpointKey];
        if (directPath) {
            return `${module.baseUrl}${directPath.startsWith('/') ? directPath : '/' + directPath}`;
        }

        // 3. Fallback: If starts with /, use baseUrl + path
        if (endpointKey && endpointKey.startsWith('/')) {
            return `${module.baseUrl}${endpointKey}`;
        }

        return endpointKey;
    }, [module]);
}
