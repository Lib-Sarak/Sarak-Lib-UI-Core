/**
 * `src/Sarak-Engine/index.ts` — a store isolada + o `networkInterceptor` (Spec
 * 08 §6, Regra 5): a lib nunca chama rede sozinha, quem faz a chamada e injeta
 * auth é este arquivo, do consumidor.
 */
export function buildSarakEngineIndex() {
    return `import { createSarakDataStore } from '@sarak/lib-ui-core';
import type { NetworkInterceptor } from '@sarak/lib-ui-core';

// Estado inicial: chaves que os bindings \`{{...}}\` do manifesto vão ler.
export const dataStore = createSarakDataStore({});

// Todo \`source\`/\`api_call\` do manifesto passa por aqui (Spec 08 §6.2). A Sarak
// nunca chama a rede sozinha nem sabe o que é um token — quem injeta auth é o host.
export const networkInterceptor: NetworkInterceptor = async ({ endpoint, method = 'GET', params }) => {
    const response = await fetch(endpoint, {
        method,
        headers: {
            'Content-Type': 'application/json',
            // Descomente e injete a sessão do seu provider de auth (Spec 08 §6.2-b):
            // Authorization: \`Bearer \${getStoredToken()}\`,
        },
        body: method === 'GET' ? undefined : JSON.stringify(params ?? {}),
    });

    if (!response.ok) {
        // Trate 401 aqui (Spec 08 §6.2-b): redirecionar via routerInterceptor,
        // limpar a sessão, etc. — a Sarak só recebe o erro via \`onError\`.
        throw new Error(\`[Sarak-Engine] \${method} \${endpoint} -> \${response.status}\`);
    }

    return response.status === 204 ? null : response.json();
};
`;
}
