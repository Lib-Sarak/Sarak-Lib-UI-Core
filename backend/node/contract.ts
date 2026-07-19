/**
 * Fonte única do Contrato REST da Porta de Persistência de UI (Spec 19 §2.3).
 * `docs/ui-storage-contract.md` é a versão humana deste mesmo contrato — o teste
 * de contrato (`__tests__/contract.test.ts`) roda os handlers de referência e
 * compara as CHAVES da resposta real contra `fields` aqui, então os dois nunca
 * divergem em silêncio (a skill `test-api-contrato` trata divergência doc↔código
 * como bug: aqui o "provider" são os handlers de referência SQLite/Postgres).
 */

/** Shape de resposta comum às 5 rotas que devolvem um tema (design/themes). */
export const THEME_RESPONSE_FIELDS = ['id', 'name', 'description', 'system', 'owner_id', 'is_public', 'is_active', 'design'] as const;

export interface UIStorageContractResponse {
    status: number;
    description: string;
    fields: readonly string[];
}

export interface UIStorageContractEndpoint {
    id: string;
    method: 'GET' | 'POST' | 'PUT';
    path: string;
    description: string;
    requestFields?: readonly string[];
    responses: readonly UIStorageContractResponse[];
}

export const UI_STORAGE_CONTRACT: readonly UIStorageContractEndpoint[] = [
    {
        id: 'design-get',
        method: 'GET',
        path: '{base}/design',
        description: 'Lê o design do tema ativo do escopo (`system` + usuário resolvido por `getUserId`).',
        responses: [
            { status: 200, description: 'Nenhum tema ativo no escopo', fields: ['design'] },
            { status: 200, description: 'Tema ativo encontrado', fields: THEME_RESPONSE_FIELDS },
        ],
    },
    {
        id: 'design-post',
        method: 'POST',
        path: '{base}/design',
        description: 'Salva o design do tema ativo (cria um tema "Personalizado" se não houver um ativo no escopo).',
        requestFields: ['design'],
        responses: [{ status: 200, description: 'Tema salvo', fields: THEME_RESPONSE_FIELDS }],
    },
    {
        id: 'branding-get',
        method: 'GET',
        path: '{base}/branding',
        description: 'Lê o branding do escopo.',
        responses: [{ status: 200, description: 'Branding (vazio `{}` se não cadastrado)', fields: ['branding'] }],
    },
    {
        id: 'branding-post',
        method: 'POST',
        path: '{base}/branding',
        description: 'Cria ou atualiza o branding do escopo (upsert por `system` + usuário).',
        requestFields: ['branding'],
        responses: [{ status: 200, description: 'Persistido', fields: ['success'] }],
    },
    {
        id: 'themes-create',
        method: 'POST',
        path: '{base}/themes',
        description: 'Cria um tema nomeado; `is_active: true` desativa os demais temas do escopo.',
        requestFields: ['name', 'design', 'is_active'],
        responses: [{ status: 200, description: 'Tema criado', fields: THEME_RESPONSE_FIELDS }],
    },
    {
        id: 'themes-update',
        method: 'PUT',
        path: '{base}/themes/:id',
        description: 'Atualiza nome/design/ativação de um tema existente.',
        requestFields: ['name', 'design', 'is_active'],
        responses: [
            { status: 200, description: 'Tema atualizado', fields: THEME_RESPONSE_FIELDS },
            { status: 404, description: 'Id inexistente', fields: ['error'] },
        ],
    },
    {
        id: 'themes-activate',
        method: 'PUT',
        path: '{base}/themes/:id/activate',
        description: 'Ativa o tema (desativa os demais do escopo).',
        responses: [
            { status: 200, description: 'Tema ativado', fields: THEME_RESPONSE_FIELDS },
            { status: 404, description: 'Id inexistente', fields: ['error'] },
        ],
    },
];
