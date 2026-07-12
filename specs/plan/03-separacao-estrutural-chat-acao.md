---
tipo: "spec"
titulo: "Separação Estrutural: Chat Nunca Expõe Valores de Tema"
dominio: "Design Engine (Sarak UI Core) — agent-design-operator"
status: "🟡 Em Progresso"
prioridade: "Alta"
tags: ["spec", "ai-agent", "architecture", "reliability"]
relacionados: ["07-agente-llm-design-e-expansao-estrutural", "02-mapeamento-semantico-rag-catalogo", "04-multi-preset-diversificado"]
---

# 1. Visão Geral
Testado em produção real: o Design Agent às vezes responde no chat com o JSON cru do tema (`[THEME_UPDATE: {...}]` aparecendo literalmente na conversa), em vez de aplicar os valores no Preset 1/Preset 2 como deveria. Causa raiz confirmada em dois cenários reais: (1) o modelo simplesmente não emite o trigger, só responde em prosa afirmando que "criou" um tema que na prática não foi aplicado a nada; (2) o modelo tenta gerar um payload grande (ex.: quase todo o catálogo, num pedido de "tema totalmente diferente"), a resposta é cortada por `max_tokens` antes de fechar o JSON, e o regex do `TriggerExtractor` (que exige `{...}` balanceado) não casa — o texto incompleto vaza pro chat sem nenhum aviso de erro. O output do agente deve ser sempre um de dois: **aplica no Preset 2, ou responde no chat** — nunca os dois misturados no mesmo texto.

> **Nota (2026-07-12):** o cenário (2) — payload grande cortado por `max_tokens` — foi a causa raiz que motivou a Spec 02 original (RAG/retrieval), uma correção que atacou o lado ERRADO do problema (entrada, não saída) e chegou a quebrar o agente em produção. A Spec 02 foi revisada: a "Chamada B" descrita nesta spec (Seção 2, Regra 1) não é mais UMA chamada de ação — é **6 chamadas em paralelo, uma por fatia de família de tokens** (`theme_orchestrator.ts`), precedidas por uma chamada de Design Brief. O princípio desta spec (chat nunca emite JSON, "ação" nunca emite prosa; Regra 4, fail-safe explícito) continua valendo e vale para CADA uma das 6 fatias individualmente. Ver `specs/plan/02-mapeamento-semantico-rag-catalogo.md` pra a topologia completa de chamadas — a Seção 6 abaixo foi atualizada para refletir isso.

# 2. Regras de Negócio
- **Regra 1 (Múltiplas chamadas independentes, não uma com trigger embutido):** toda requisição ao Design Agent separa estritamente "texto pro humano" de "dado estruturado pro parser" em chamadas de LLM diferentes — nunca confia num trigger embutido numa única resposta mista. Topologia atual (pós-revisão da Spec 02, `Promise.all`/`Promise.allSettled`):
  - **Chamada de Design Brief (1 chamada, roda primeiro):** traduz o pedido em prosa sem token técnico — o "entendimento" compartilhado pelas chamadas seguintes. Ver Spec 02, Seção 7.1.
  - **Chamada A ("chat", em paralelo com as fatias):** system prompt proíbe explicitamente qualquer JSON ou valor de token na resposta — só texto natural.
  - **Chamada B ("ação") — deixou de ser UMA chamada:** virou **6 chamadas em paralelo**, uma por fatia de família de tokens, cada uma exigindo **só** um JSON válido (usando exclusivamente as chaves daquela fatia) — proibida qualquer prosa, temperatura próxima de zero. Ver Spec 02, Seções 6-8, pra o fatiamento, o gabarito completo como contexto, e a política de falha parcial por fatia.
- **Regra 2 (Por que não `response_format`/tool-calling nativo):** rejeitado como abordagem única porque provider/modelo são escolha do importador (podem ser um roteador como `openrouter/free`, que sorteia entre múltiplos modelos com suporte desigual a structured output) — duas chamadas de texto puro funcionam com qualquer modelo de completions, sem depender de uma capability que pode não estar disponível.
- **Regra 3 (Contrato público não muda):** `DesignAgentPromptResult{message, themePatch?, componentPresets?}` (definido em `core/Provider/types.ts`, exportado por `@sarak/lib-ui-core`) continua sendo a forma de resposta. `routes.ts` só passa a montar essa resposta combinando o resultado das duas chamadas, em vez de extrair de uma só via regex.
- **Regra 4 (Fail-safe explícito, nunca vazamento):** se a Chamada B não devolver JSON parseável, ou devolver um payload que falha na validação (`ThemeValidator`), a resposta ao usuário é a Chamada A **mais** um aviso curto ("não consegui aplicar as alterações, pode tentar reformular?") — nunca o texto/JSON cru da Chamada B. **Extensão pós-revisão da Spec 02:** como a Chamada B virou 6 fatias independentes, o fail-safe é POR FATIA — uma fatia falhando nunca derruba as outras 5 nem produz erro técnico; a mensagem final cita só o nome humano da(s) fatia(s) que não puderam ser aplicadas (ex. "Atmosfera e Movimento"), nunca a chave técnica ou o erro cru. Ver Spec 02, Seção 8.
- **Regra 5 (`TriggerExtractor` sai deste fluxo, não é removido do sistema):** `TriggerExtractor`/o padrão de regex `[TIPO: dados]` continua servindo o `default-agent` (triggers `LEAD`/`APPOINTMENT`/`HANDOFF`) — não é tocado por esta spec.

# 3. Critérios de Aceite
- [x] `POST /prompt` do `agent-design-operator` dispara as chamadas de "chat" e "ação" em paralelo (topologia atual: 1 Brief sequencial + 1 Chat e 6 fatias de ação em paralelo — 8 chamadas por requisição; ver Nota da Seção 1 e Spec 02).
- [x] Em nenhum cenário testado a resposta `message` contém `{`, `[THEME_UPDATE`, ou qualquer chave de token reconhecível do catálogo.
- [x] Payload de cada fatia de ação, quando presente, passa por `ThemeValidator.validatePayload` isoladamente (`theme_orchestrator.ts`) e o merge final passa de novo por `ThemeValidator.validatePayload` (via `processThemeUpdate`, defesa em profundidade) antes de virar `payload`/`themePatch` na resposta.
- [x] Falha numa fatia de ação (JSON inválido ou reprovado na validação) produz mensagem de fallback amigável citando o nome humano da fatia, nunca um erro genérico nem o payload cru — e não derruba as outras fatias (Regra 4 estendida).
- [ ] **Pendente, inalterado desde a implementação original.** Latência do fluxo completo (Brief + 7 chamadas em paralelo) não compromete a experiência — a instrumentação (`performance.now()` em `routes.ts`) existe e loga `[Design Agent] Brief + preenchimento fatiado (7 chamadas) concluído em ${latencyMs}ms`, mas não há credencial/provider LLM real disponível neste ambiente de execução pra medir um número real (sem `.env`, sem env vars de `GROQ`/`OPENROUTER` no shell). Com MAIS chamadas de LLM do que a topologia original (8 vs. 2), este item merece atenção redobrada quando um provider real estiver disponível — não inventar número; medir na primeira execução real.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** a função que monta a resposta final combinar `message` (Chamada A) e `payload` (Chamada B) corretamente quando ambas têm sucesso.
- [x] **Deve** retornar só `message` (sem `payload`) quando a Chamada B não emite JSON.
- [x] **Deve** retornar mensagem de fallback (não o JSON cru) quando a Chamada B emite JSON inválido/reprovado.

## Testes de Contrato (API)
- [x] **Endpoint** `POST /api/design-agent/prompt`: contrato de resposta `{success: boolean, message: string, payload?: Record<string, unknown>}` mantido (asserido nos 2 testes E2E); nenhum campo novo introduzido sem atualizar `DesignAgentPromptResult`.

## Testes E2E (Integração)
- [x] Fluxo feliz: pedido simples de alteração de cor → `message` é uma confirmação textual curta, `payload` chega separadamente e aplica no Preset 1/2.
- [x] Fluxo de estresse: pedido de "tema totalmente diferente" (payload grande) → mesmo que a Chamada B precise de mais tokens, o resultado nunca vaza JSON parcial no chat (ou aplica corretamente, ou cai no fallback da Regra 4).

> **Nota (2026-07-12):** os testes acima cobrem o PRINCÍPIO desta spec (chat isolado de ação, fail-safe sem vazamento) e continuam verdes com a topologia atual. A cobertura de teste da topologia de 6 fatias em si (merge, falha parcial por fatia, "tema completo não trunca", modos `create`/`patch`) está documentada na Spec 02, Seção 9 — não duplicada aqui pra não desatualizar em dois lugares.

# 5. Prompts Exatos (copie e adapte, não escreva do zero)

## 5.1. Chamada A — "chat"

```
${GLOBAL_SYSTEM_CONSTRAINTS}

[AGENT IDENTITY]
${identity}

[REGRA ABSOLUTA DESTA CHAMADA]
Você está respondendo SOMENTE o texto que o usuário vai ler no chat. É TERMINANTEMENTE PROIBIDO:
- Incluir qualquer JSON, chave de configuração, ou valor de token na sua resposta.
- Usar colchetes `[` `]` ou chaves `{` `}` na resposta.
- Listar nomes de propriedades técnicas (ex: "primaryColor", "cardBorderRadius").

Responda em 1-3 frases, tom natural, confirmando o que você entendeu do pedido e o que você
está aplicando (sem detalhar valores técnicos). Se o pedido não fizer sentido ou não puder ser
atendido, explique brevemente por quê — ainda sem JSON.

[STRICT GUARDRAILS]
${rules}
```
- `temperature`: pode usar o valor padrão do provider (mais natural).
- `history`: mesmo histórico de conversa das chamadas anteriores (`agentRepository.getConversationHistory`).

## 5.2. Chamada B — "ação" (histórico — topologia original de 1 chamada; SUPERSEDIDA)

> **Superseded (2026-07-12):** este prompt de UMA chamada de ação, usando `retrieveRelevantTokens` (RAG), é o que causou a regressão descrita na Nota da Seção 1 — mantido aqui só como registro histórico de como a Chamada B nasceu. O prompt real de cada uma das 6 fatias de ação está na Spec 02, Seção 7.2 (`theme_slice_filler.ts`) — mesmo princípio (só JSON, só chaves autorizadas, `NENHUMA_ALTERACAO` quando não há mudança, temperatura baixa), mas o "TOKENS DISPONÍVEIS" virou o gabarito COMPLETO como contexto + uma lista de chaves restrita à fatia (não um recorte por relevância semântica).

```
${GLOBAL_SYSTEM_CONSTRAINTS}

[AGENT IDENTITY]
${identity}

[REGRA ABSOLUTA DESTA CHAMADA]
Sua resposta é consumida por um parser JSON, NUNCA por um humano. É TERMINANTEMENTE PROIBIDO:
- Escrever qualquer texto fora do JSON (sem saudação, sem explicação, sem markdown ```).
- Inventar uma chave que não está na lista de "TOKENS DISPONÍVEIS" abaixo.
- Devolver um objeto vazio {} se não houver nenhuma alteração a fazer — nesse caso devolva
  literalmente a string "NENHUMA_ALTERACAO" (sem JSON).

Sua resposta deve ser SOMENTE um objeto JSON válido, no formato:
{"nomeDoToken1": valor1, "nomeDoToken2": valor2}

Use SÓ chaves da lista abaixo. Cada uma mostra o tipo esperado do valor.

[TOKENS DISPONÍVEIS]
${retrieveRelevantTokens(userPrompt)}  // ver spec 02 — resultado do retrieval semântico, não o catálogo inteiro

[STRICT GUARDRAILS]
${rules}
```
- `temperature`: baixa (0.0-0.2) — determinismo, não criatividade.
- `history`: **não** inclua o histórico completo de chat aqui — só o pedido atual do usuário. Histórico de conversa é contexto pra "chat", não pra "extração de valores" (reduz tokens e ruído).

# 6. Pseudocódigo de Orquestração (`routes.ts`) — reescrito na revisão da Spec 02 (2026-07-12)

Fluxo real: **Brief (sequencial) → (Chat ‖ 6 fatias de ação, em paralelo) → merge por fatia → validação final → aplica.** Código simplificado do `agent-design-operator/src/api/routes.ts` real (ver o arquivo pra versão completa, com as validações de `mode`/`base_theme`):

```ts
// agent-design-operator/src/api/routes.ts
routes.post('/prompt', async (req, res) => {
  const { prompt, session_id, mode, base_theme } = req.body;
  // ... validações de sempre (campos obrigatórios, InputValidator.sanitizeInput) ...

  const themeMode = mode === 'patch' ? 'patch' : 'create'; // seleção EXPLÍCITA, nunca heurística (spec 02)
  if (themeMode === 'patch' && !base_theme) {
    return res.status(400).json({ error: 'Modo "patch" exige "base_theme" no corpo da requisição.' });
  }

  const scaffold = deduplicateScaffoldById(getDesignScaffold()); // gabarito completo, spec 02 §5.1

  // Etapa 1 — Design Brief (sequencial, contexto compartilhado pelas chamadas seguintes)
  const brief = await generateDesignBrief(prompt, identity, rules, provider, temp, maxTokens, model);

  const chatPrompt = buildChatPrompt(identity, rules, brief); // Chamada A agora recebe o Brief também

  // Etapa 2 — Chat (Chamada A) e as 6 fatias de ação (Chamada B fatiada), TODAS em paralelo
  const [chatResult, sliceOutcome] = await Promise.all([
    provider.generateResponse(chatPrompt, [...history, { role: 'user', content: prompt }], temp, maxTokens, model),
    generateThemeSlices({ scaffold, brief, mode: themeMode, baseTheme: base_theme, provider, identity, rules, temperature: 0.1, maxTokens, model }),
    // ^ dispara as 6 fatias internamente via Promise.allSettled — uma fatia falhando
    //   nunca derruba as outras 5 (Regra 4 estendida). Cada fatia validada isoladamente
    //   contra o catálogo (ThemeValidator) ANTES do merge. Retorna:
    //   { payload?: Record<string, unknown>, failedSliceLabels: string[] }
  ]);

  await agentRepository.saveMessage(session_id, 'user', prompt);
  await agentRepository.saveMessage(session_id, 'assistant', chatResult);

  // assembleAgentResponse: valida o merge de novo (defesa em profundidade via
  // processThemeUpdate) e monta a message final incluindo, se houver, o aviso
  // de quais fatias (por nome humano) não puderam ser aplicadas — nunca JSON cru.
  const responsePayload = await assembleAgentResponse(chatResult, sliceOutcome, session_id);
  return res.status(200).json(responsePayload);
});
```

**Ponto crítico de implementação:** mesmo quando UMA OU MAIS fatias falham (JSON inválido, ou reprovada na validação), a resposta ainda é **200 com `success: true`** e a `message` da Chamada A — mais um aviso curto citando o nome humano da(s) fatia(s) que não aplicaram, se houver. O usuário sempre recebe uma resposta em linguagem natural coerente, nunca um erro técnico cru nem o payload malformado. Isso é o que a Regra 4 (estendida) da Seção 2 exige — agora "por fatia", não mais "tudo ou nada" numa única Chamada B.
