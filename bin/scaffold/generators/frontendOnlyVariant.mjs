/**
 * Stack `frontend-only` (Spec 21 §2.3): sem backend Node — o host implementa o
 * contrato REST (Spec 19) em qualquer linguagem. Este arquivo só documenta o
 * contrato, sem gerar servidor nenhum.
 */
export function buildContractStubMd() {
    return `# Contrato REST da Porta de Persistência de UI

Este projeto foi gerado como \`frontend-only\` — o backend não é Node.js, então o
\`init\` não gerou servidor nenhum. Implemente, no seu backend (qualquer
linguagem), os 5 endpoints abaixo. A referência completa (formato de
request/response, códigos de erro) está em
\`node_modules/@sarak/lib-ui-core/docs/ui-storage-contract.md\`.

| Método | Path | Uso |
|---|---|---|
| GET | \`/api/ui/design\` | Lê o design do tema ativo do escopo. |
| POST | \`/api/ui/design\` | Salva o design do tema ativo. |
| GET | \`/api/ui/branding\` | Lê o branding do escopo. |
| POST | \`/api/ui/branding\` | Cria/atualiza o branding (upsert). |
| POST | \`/api/ui/themes\` | Cria um tema nomeado. |
| PUT | \`/api/ui/themes/:id\` | Atualiza um tema existente. |
| PUT | \`/api/ui/themes/:id/activate\` | Ativa o tema (desativa os demais do escopo). |

O \`SarakUIProvider\` do frontend chama esses endpoints sozinho (base configurável
em \`options.endpoints.baseUrl\`) — nenhum código React adicional é necessário
além do \`main.tsx\` já gerado.
`;
}
