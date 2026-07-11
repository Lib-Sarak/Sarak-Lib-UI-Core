---
tipo: "spec"
titulo: "Ingestão Multimodal de Referências via Conversão Unificada para HTML"
dominio: "Design Engine (Sarak UI Core) — agent-design-operator"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "ai-agent", "multimodal", "security", "ssrf"]
relacionados: ["07-agente-llm-design-e-expansao-estrutural", "06-pipeline-visao-dois-estagios"]
---

# 1. Visão Geral
O Design Agent precisa aceitar referências além de texto: link de site, PDF e PPT. Em vez de três pipelines de parsing distintos, esta spec unifica os três em torno de uma **conversão para um formato intermediário seguro (HTML)** — link já chega como HTML (via fetch controlado); PDF/PPT são convertidos server-side para HTML antes de entrar na mesma lógica de extração usada para o link. Isso reduz a superfície total de manutenção (uma lógica de extração, não três) e concentra os cuidados de segurança num único ponto de entrada.

# 2. Regras de Negócio
- **Regra 1 (SSRF é o risco central do link):** buscar uma URL fornecida pelo usuário a partir do servidor é uma superfície clássica de Server-Side Request Forgery. Mitigações obrigatórias antes de qualquer fetch:
  - Timeout curto (ex.: 5s).
  - Limite de tamanho de resposta (ex.: 5MB) — abortar streaming acima disso.
  - Bloqueio de IPs privados/internos/loopback (RFC1918, `127.0.0.0/8`, `169.254.0.0/16`, `::1`) resolvidos via DNS antes do fetch (não confiar só na URL textual — validar o IP resolvido, para evitar DNS rebinding).
  - Não seguir redirects automaticamente para um host que resolva pra IP interno (revalidar a cada hop, ou desabilitar redirect automático e checar manualmente).
  - Allowlist de esquema: só `http`/`https`.
- **Regra 2 (PDF/PPT convergem pro mesmo pipeline, não pipelines próprios):** conversão server-side para HTML via ferramenta externa (candidato: LibreOffice headless, `--convert-to html`, rodando sandboxed/sem acesso de rede) — o HTML resultante entra na mesma extração usada para o link (Regra 3). Isso é uma **nova dependência crítica de infraestrutura** no ambiente que roda `agent-design-operator` — precisa de confirmação explícita do usuário sobre viabilidade antes de virar tarefa de execução (ver Seção 6).
- **Regra 3 (Extração comum, uma vez em HTML):** dado o HTML (de qualquer origem), extrair: `theme-color` de meta tag, favicon, Open Graph image, paleta de cor via CSS computado simples (sem renderização completa — parsing estático), texto visível (contexto pro pedido), URLs de imagens embutidas.
- **Regra 4 (Nada disso substitui a validação de catálogo):** o resultado da extração vira contexto de entrada pro Design Agent (via o pipeline de visão da spec 06, quando envolve imagem/paleta) — nunca contorna `ThemeValidator`; o payload final ainda precisa ser só chaves/valores válidos do catálogo.
- **Regra 5 (Limite de escopo desta spec):** conversão de arquivo (PDF/PPT) assume upload direto pelo usuário no chat (reaproveitando `SarakUploader`), não busca de arquivo por URL — busca de arquivo remoto herdaria os mesmos riscos de SSRF da Regra 1 e fica fora do escopo inicial.

# 3. Critérios de Aceite
- [ ] Fetch de link rejeita URLs que resolvem para IP privado/interno/loopback.
- [ ] Fetch de link respeita timeout e limite de tamanho, sem travar a requisição do usuário.
- [ ] Upload de PDF/PPT é convertido para HTML com sucesso para arquivos de teste representativos (apresentação simples, documento com texto+imagem).
- [ ] Extração (Regra 3) produz um resultado estruturado consistente independente da origem (link, PDF convertido, ou PPT convertido).
- [ ] Nenhum caminho de ingestão multimodal permite que o payload final contenha chave fora do catálogo — a validação de sempre (`ThemeValidator`) continua sendo o guardião final.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** o validador de URL rejeitar `http://127.0.0.1/...`, `http://169.254.169.254/...` (metadata endpoint clássico de cloud), e `http://localhost/...`.
- [ ] **Deve** o validador de URL aceitar uma URL pública real de teste.
- [ ] **Deve** o fetch abortar e retornar erro claro quando a resposta excede o limite de tamanho configurado.
- [ ] **Deve** a extração de HTML retornar `null`/vazio graciosamente para campos ausentes (nem toda página tem `theme-color`, por exemplo) sem lançar exceção.

## Testes de Contrato (API)
- [ ] **Endpoint** novo (ex.: `POST /prompt` aceitando anexos, ou endpoint dedicado de ingestão) — definir e documentar o formato de entrada (multipart? URL no corpo JSON?) antes da implementação.

## Testes E2E (Integração)
- [ ] Fluxo feliz: usuário cola um link de site público real → resposta do agente reflete alguma característica visual capturada (cor dominante, por exemplo).
- [ ] Fluxo negativo: usuário cola uma URL interna (ex. `http://localhost:5432`) → requisição rejeitada com mensagem clara, sem vazamento de informação de rede interna.

# 5. Decisão de Ferramenta (resolvida — pode executar)

**Ferramenta escolhida: LibreOffice headless**, via CLI, chamado como subprocesso a partir de `agent-design-operator`.

```bash
# Conversão de PPT/PPTX/PDF para HTML (mesma invocação serve pros 3 formatos de entrada)
soffice --headless --convert-to html --outdir /tmp/sarak-convert/<uuid> /caminho/do/arquivo-enviado.pptx
```

- **Se `libreoffice`/`soffice` não estiver instalado no ambiente**, a spec cai graciosamente: a rota de upload responde erro claro ("conversão de documento indisponível neste ambiente — envie um link ou imagem em vez disso") em vez de travar. Não é um requisito rígido de boot do `agent-design-operator` (ele continua funcionando pra texto/link/imagem sem essa dependência).
- **Sandboxing mínimo exigido:** rodar o subprocesso com timeout (ex.: 15s — conversões travadas não devem prender a requisição HTTP), diretório de saída temporário exclusivo por requisição (`/tmp/sarak-convert/<uuid>`, apagado após uso), e **sem acesso de rede** do processo `soffice` (não deve haver macro/script externo sendo executado — arquivos de usuário não confiáveis são a entrada).
- **Se, ao executar, esta ferramenta não estiver disponível/viável no ambiente real**, troque só esta Seção 5 por outra ferramenta equivalente (ex. um serviço gerenciado de conversão) — o resto da spec (Regras 1, 3, 4, Critérios de Aceite) não muda.

# 6. Código de Referência — Fetch de Link com Hardening de SSRF

```ts
// agent-design-operator/src/toolbox/safe_fetch.ts (novo arquivo)
import dns from 'dns/promises';
import net from 'net';
import axios from 'axios';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const TIMEOUT_MS = 5000;

const PRIVATE_RANGES = [
  '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', // RFC1918
  '127.0.0.0/8', '169.254.0.0/16', // loopback, link-local (inclui metadata endpoint de cloud)
  '::1/128', 'fc00::/7', 'fe80::/10', // IPv6 loopback/ULA/link-local
];

function isPrivateIp(ip: string): boolean {
  // Use uma lib testada (ex. `ip-address` ou `netmask`) em vez de reimplementar CIDR match —
  // pseudocódigo aqui só ilustra a checagem, não é implementação de produção.
  return PRIVATE_RANGES.some(range => ipInCidr(ip, range));
}

export async function safeFetchHtml(url: string): Promise<string> {
  const parsed = new URL(url); // lança se malformada
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Apenas http/https são permitidos.');
  }

  // Resolve o IP ANTES de buscar — nunca confiar só na URL textual (mitiga DNS rebinding)
  const { address } = await dns.lookup(parsed.hostname);
  if (isPrivateIp(address) || !net.isIP(address)) {
    throw new Error('URL aponta para um host interno/privado — bloqueado.');
  }

  const response = await axios.get(url, {
    timeout: TIMEOUT_MS,
    maxContentLength: MAX_BYTES,
    maxRedirects: 3,
    responseType: 'text',
    // valida CADA redirect manualmente reaplicando a checagem de IP acima —
    // axios com `maxRedirects` sozinho NÃO revalida IP a cada hop; isso precisa
    // ser feito com um `beforeRedirect` custom ou desabilitando redirect automático
    // (`maxRedirects: 0`) e resolvendo manualmente, revalidando a cada hop.
  });

  return response.data;
}
```

**Não reimplementar o parsing de CIDR na mão em produção** — usar uma biblioteca madura (ex. `ip-address`, `netmask`, ou `is-cidr`/`ip-range-check` do ecossistema npm) em vez do `ipInCidr` de exemplo acima, que é só ilustrativo.
