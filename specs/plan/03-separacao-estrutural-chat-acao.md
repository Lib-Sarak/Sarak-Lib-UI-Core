---
tipo: "spec"
titulo: "Separação Estrutural: Chat Nunca Expõe Valores de Tema"
dominio: "Design Engine (Sarak UI Core) — agent-design-operator"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "ai-agent", "architecture", "reliability"]
relacionados: ["07-agente-llm-design-e-expansao-estrutural", "02-mapeamento-semantico-rag-catalogo", "04-multi-preset-diversificado"]
---

# 1. Visão Geral
Testado em produção real: o Design Agent às vezes responde no chat com o JSON cru do tema (`[THEME_UPDATE: {...}]` aparecendo literalmente na conversa), em vez de aplicar os valores no Preset 1/Preset 2 como deveria. Causa raiz confirmada em dois cenários reais: (1) o modelo simplesmente não emite o trigger, só responde em prosa afirmando que "criou" um tema que na prática não foi aplicado a nada; (2) o modelo tenta gerar um payload grande (ex.: quase todo o catálogo, num pedido de "tema totalmente diferente"), a resposta é cortada por `max_tokens` antes de fechar o JSON, e o regex do `TriggerExtractor` (que exige `{...}` balanceado) não casa — o texto incompleto vaza pro chat sem nenhum aviso de erro. O output do agente deve ser sempre um de dois: **aplica no Preset 2, ou responde no chat** — nunca os dois misturados no mesmo texto.

# 2. Regras de Negócio
- **Regra 1 (Duas chamadas, não uma):** toda requisição ao Design Agent dispara **duas chamadas de LLM independentes, em paralelo** (`Promise.all`), não uma chamada com trigger embutido.
  - **Chamada A ("chat"):** system prompt proíbe explicitamente qualquer JSON ou valor de token na resposta — só texto natural.
  - **Chamada B ("ação"):** system prompt exige **só** um JSON válido (usando exclusivamente chaves do catálogo, resolvidas via retrieval semântico da spec 02) — proibida qualquer prosa. Temperatura próxima de zero.
- **Regra 2 (Por que não `response_format`/tool-calling nativo):** rejeitado como abordagem única porque provider/modelo são escolha do importador (podem ser um roteador como `openrouter/free`, que sorteia entre múltiplos modelos com suporte desigual a structured output) — duas chamadas de texto puro funcionam com qualquer modelo de completions, sem depender de uma capability que pode não estar disponível.
- **Regra 3 (Contrato público não muda):** `DesignAgentPromptResult{message, themePatch?, componentPresets?}` (definido em `core/Provider/types.ts`, exportado por `@sarak/lib-ui-core`) continua sendo a forma de resposta. `routes.ts` só passa a montar essa resposta combinando o resultado das duas chamadas, em vez de extrair de uma só via regex.
- **Regra 4 (Fail-safe explícito, nunca vazamento):** se a Chamada B não devolver JSON parseável, ou devolver um payload que falha na validação (`ThemeValidator`), a resposta ao usuário é a Chamada A **mais** um aviso curto ("não consegui aplicar as alterações, pode tentar reformular?") — nunca o texto/JSON cru da Chamada B.
- **Regra 5 (`TriggerExtractor` sai deste fluxo, não é removido do sistema):** `TriggerExtractor`/o padrão de regex `[TIPO: dados]` continua servindo o `default-agent` (triggers `LEAD`/`APPOINTMENT`/`HANDOFF`) — não é tocado por esta spec.

# 3. Critérios de Aceite
- [ ] `POST /prompt` do `agent-design-operator` dispara as duas chamadas em paralelo.
- [ ] Em nenhum cenário testado a resposta `message` contém `{`, `[THEME_UPDATE`, ou qualquer chave de token reconhecível do catálogo.
- [ ] Payload da Chamada B, quando presente, sempre passa por `ThemeValidator.validatePayload` antes de virar `payload`/`themePatch` na resposta.
- [ ] Falha na Chamada B (JSON inválido ou reprovado na validação) produz mensagem de fallback amigável, nunca um erro genérico nem o payload cru.
- [ ] Latência da dupla chamada em paralelo não excede significativamente (não dobra) a latência da chamada única anterior — medir e registrar.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** a função que monta a resposta final combinar `message` (Chamada A) e `payload` (Chamada B) corretamente quando ambas têm sucesso.
- [ ] **Deve** retornar só `message` (sem `payload`) quando a Chamada B não emite JSON.
- [ ] **Deve** retornar mensagem de fallback (não o JSON cru) quando a Chamada B emite JSON inválido/reprovado.

## Testes de Contrato (API)
- [ ] **Endpoint** `POST /api/design-agent/prompt`: contrato de resposta `{success: boolean, message: string, payload?: Record<string, unknown>}` mantido; nenhum campo novo introduzido sem atualizar `DesignAgentPromptResult`.

## Testes E2E (Integração)
- [ ] Fluxo feliz: pedido simples de alteração de cor → `message` é uma confirmação textual curta, `payload` chega separadamente e aplica no Preset 1/2.
- [ ] Fluxo de estresse: pedido de "tema totalmente diferente" (payload grande) → mesmo que a Chamada B precise de mais tokens, o resultado nunca vaza JSON parcial no chat (ou aplica corretamente, ou cai no fallback da Regra 4).

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

## 5.2. Chamada B — "ação"

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

# 6. Pseudocódigo de Orquestração (`routes.ts`)

```ts
// agent-design-operator/src/api/routes.ts
routes.post('/prompt', async (req, res) => {
  const { prompt, session_id } = req.body;
  // ... validações de sempre (campos obrigatórios, InputValidator.sanitizeInput) ...

  const relevantTokens = await retrieveRelevantTokens(prompt, embeddingsProviderName); // spec 02

  const [chatResult, actionResult] = await Promise.all([
    provider.generateResponse(buildChatPrompt(identity, rules), history, temp, maxTokens, model),
    provider.generateResponse(buildActionPrompt(identity, rules, relevantTokens), [{ role: 'user', content: prompt }], 0.1, maxTokens, model),
  ]);

  await agentRepository.saveMessage(session_id, 'user', prompt);
  await agentRepository.saveMessage(session_id, 'assistant', chatResult);

  // Chamada B pode devolver: "NENHUMA_ALTERACAO", JSON válido, ou lixo/inválido — os 3 casos:
  if (actionResult.trim() === 'NENHUMA_ALTERACAO') {
    return res.status(200).json({ success: true, message: chatResult });
  }

  let rawPayload;
  try {
    rawPayload = JSON.parse(actionResult);
  } catch {
    // Regra 4: fallback amigável, NUNCA devolve actionResult cru
    return res.status(200).json({
      success: true,
      message: `${chatResult}\n\n(não consegui aplicar as alterações — pode tentar reformular?)`,
    });
  }

  try {
    const validatedPayload = await processThemeUpdate(rawPayload, session_id); // ThemeValidator por dentro
    return res.status(200).json({ success: true, message: chatResult, payload: validatedPayload });
  } catch (validationError) {
    // mesma Regra 4 — validação falhou, não devolve o payload rejeitado
    return res.status(200).json({
      success: true,
      message: `${chatResult}\n\n(não consegui aplicar as alterações — pode tentar reformular?)`,
    });
  }
});
```

**Ponto crítico de implementação:** repare que mesmo quando a Chamada B falha (JSON inválido ou reprovado na validação), a resposta ainda é **200 com `success: true`** e a `message` da Chamada A — o usuário sempre recebe uma resposta em linguagem natural coerente, nunca um erro técnico cru nem o payload malformado. Isso é o que a Regra 4 da Seção 2 exige.
