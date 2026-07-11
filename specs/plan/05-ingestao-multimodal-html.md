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

# 5. Pendência de Decisão (HITL)
Esta spec introduz uma dependência de infraestrutura nova e não trivial: um conversor de documento para HTML (LibreOffice headless é a opção mais comum e gratuita, mas exige instalar/manter esse binário no ambiente onde `agent-design-operator` roda, e rodá-lo sandboxed por segurança). **Preciso de confirmação explícita antes desta spec virar execução**: essa dependência é aceitável na infraestrutura do(s) sistema(s) importador(es), ou existe preferência por outra ferramenta/serviço de conversão?
