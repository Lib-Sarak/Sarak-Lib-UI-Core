---
tipo: "spec"
titulo: "Gate de Submit à prova de erro de autoria (validação precisa BARRAR o envio, e falhar em voz alta)"
dominio: "Manifest Engine / Dispatcher / Formulários / Validação / DX"
status: "🟡 Executada (2026-07-20) — gates unitários/integração verdes; validação final é o re-Selo (P15)"
prioridade: "Máxima"
tags: ["spec", "correcao-pos-selo", "dispatcher", "validacao", "formulario", "resiliencia-leniente"]
relacionados: ["17-resiliencia-leniente-e-dx-de-erros", "26-instalacao-teste", "specs/specs/29 (validação declarativa)", "specs/specs/32 (binding bidirecional de formulário)", "specs/specs/25 (dispatcher central)"]
---

# 1. Visão Geral e Descrição do Problema

Achado **1** (M6 FAIL) + achado **M9 PARCIAL** do Selo da Onda: num formulário com campos `validation: [{ "rule": "required" }]`, clicar em submit com os campos vazios **não bloqueou o envio** — o `api_call` disparou, o backend persistiu registros vazios (`{"cliente_apelido":"","cliente_contato":"","valor_maximo":0,...}` — confirmado via `curl`), e um toast de **sucesso** apareceu. Zero warning no console. A skill `ui-integra-escrever-manifesto` documenta o oposto ("a validação BARRA o envio").

**Diagnóstico refinado por leitura de código (a triagem supôs a causa errada — registre a correção):** a triagem assumiu que "o Dispatcher não está checando a validação antes do `api_call`". **Isso é falso.** O gate existe e está correto:

- `src/core/Manifest/Dispatcher/createDispatcher.ts:87-94` — `if (action.submit && ctx.form) { ctx.form.markSubmitAttempted(); if (ctx.form.hasErrors()) throw new SubmitBlockedError(); }`. O `SubmitBlockedError` para a cadeia em silêncio (linha 197), sem disparar `onError`. A mecânica funciona **quando o manifesto é autorado exatamente certo**.

O bug real é **degradação silenciosa por desalinhamento de contrato**. O gate só dispara se TRÊS condições baterem, e **nenhuma emite aviso quando falha**:

1. `submit: true` precisa estar no **topo da ação** (`ManifestAction.submit`, `src/core/Manifest/types.ts:58`) — mas o executor (seguindo a skill) escreveu `payload: { submit: true }`. `action.submit` fica `undefined` → o bloco inteiro do gate é pulado → o `api_call` interpola o `payload` (com os `model` vazios) e envia. É exatamente o sintoma.
2. Um escopo `form: { id }` precisa envolver os campos para `ctx.form` existir (`src/core/Manifest/nodes/LeafNode.tsx:100` → `form: formScope ?? undefined`; provido por `useFormScope()`). Sem o escopo, `ctx.form` é `undefined` → gate pulado.
3. Cada campo precisa de `model.path` **e** `validation` para se registrar no escopo (`LeafNode.tsx:72-75` → `registerField`). Um campo sem `model` não entra em `hasErrors()`.

**A skill agrava (raiz do M9):** o único exemplo de `api_call` com dados de formulário na skill (`.agents/skills/ui-integra-escrever-manifesto/SKILL.md:96-101`) usa `params: "{{form}}"` — que **não passa pelo gate de submit** e envia o estado cru (strings vazias). Não existe **nenhum** exemplo completo do formulário que barra o submit, e o shape de um item de `validation` não aparece em skill nem catálogo (é a única diretiva reservada sem exemplo). Quem segue a skill ao pé da letra reproduz o bug.

Princípio violado: a **Resiliência Leniente** (Spec 17) manda que erro de autoria DEGRADE com `console.warn` ensinando a correção (é assim para token de espaçamento inválido e para `actions` como objeto). Aqui, um formulário com `validation` que não barra o submit é o pior caso: "funciona" e persiste lixo, sem nenhum sinal.

# 2. Regras de Negócio (Solução)

A solução é **defesa em profundidade**: tornar o gate difícil de burlar por acidente E impossível de burlar em silêncio. Três frentes no motor + a documentação.

## 2.1 Leniência de posicionamento do `submit` (motor)
- `apiCall` passa a reconhecer `submit: true` também em `action.payload.submit` como **alias** de `action.submit` (normalizar antes do gate). Motivo: `submit` conceitualmente "pertence" ao envio e é intuitivo escrevê-lo junto do `endpoint`/`params` no `payload` — o erro do executor é previsível e barato de acomodar (mesma postura leniente da Spec 17). A documentação (2.4) fixa o local canônico (topo), mas o motor aceita ambos.

## 2.2 Aviso defensivo quando o gate é burlado (motor) — a correção central do M6
- Quando um `api_call` dispara **dentro de um form-escopo ativo** (`ctx.form` presente) que **tem erros de validação agora** (`ctx.form.hasErrors()`), mas a ação **não** foi reconhecida como submit (nem `action.submit` nem `payload.submit`), o motor emite `console.warn` claro: a chamada está enviando um formulário com campos inválidos sem passar pela validação; ensina a marcar `"submit": true`. (Decisão de projeto a validar na execução: **avisar e prosseguir** — leniência — vs. **avisar e barrar**. Recomendação: avisar sempre; barrar só quando `hasErrors()` for verdadeiro e houver escopo de form ativo, porque persistir dado inválido é o dano concreto que o Selo pegou. Confirmar com o mantenedor na execução se o bloqueio deve ser incondicional.)
- Quando `submit` é reconhecido (`true`) mas **não há** form-escopo ativo (`ctx.form` ausente), emitir `console.warn`: "submit marcado, mas nenhum `form: { id }` no escopo — a validação não roda; envolva os campos num nó com `form`." (Pega a condição 2 do diagnóstico.)

## 2.3 Aviso de shape inválido de `validation` (motor) — fecha o M9 do lado do código
- Estender a família de avisos de sanitização de diretivas (`src/core/Manifest/nodes/sanitizeDirectives.ts`, mesmo padrão dedup por nó da Spec 17) para a diretiva `validation`: quando um item não tem shape válido (`rule` fora do conjunto `required|minLength|maxLength|pattern|type`, ou falta o campo obrigatório da regra), `console.warn` com o exemplo correto, e a regra inválida é ignorada (nunca derruba o motor — `validate.ts` já é blindado). Hoje uma regra malformada é silenciosamente descartada.

## 2.4 Documentação: exemplo canônico + shape de `validation` (skill/catálogo) — fecha o M9 do lado da doc
- Em `.agents/skills/ui-integra-escrever-manifesto/SKILL.md` (espelhar `.claude/` com hash igual — ver memória `.claude/skills é symlink`): adicionar o **exemplo COMPLETO do formulário que barra o submit**, mostrando as três peças juntas e no lugar certo:
  - um nó com `form: { "id": "...", "resetOn": "submitSuccess" }` envolvendo os campos;
  - campos `SarakInput` com `model: { "path": "..." }` **e** `validation: [ ... ]`;
  - o botão de submit com `actions: [{ "type": "api_call", "submit": true, "payload": { "endpoint": "...", "method": "POST" } }]` — deixando explícito que `submit` vai no **topo da ação** e que o payload vem dos `model` (não se passa `params` à mão).
  - deixar explícito o contraste com o exemplo `params: "{{form}}"` existente (que NÃO valida) — quando usar cada um.
- Documentar o **shape de um item de `validation`** com pelo menos um exemplo por `rule` (`required`, `minLength`/`maxLength` com `value`, `pattern` com `value` regex, `type` com `value` = `email|url|numero`) e o campo opcional `message`. O gerador de catálogo (`docs/manifest-catalog.*`) já lista diretivas reservadas — garantir que `validation` ganhe a seção de valores/shape como as demais.

# 3. Critérios de Aceite
- [x] Um formulário autorado pelo exemplo canônico da skill (form-escopo + `model` + `validation` + `submit: true` no topo) **barra** o submit com campos inválidos: nenhum `api_call` dispara, nenhum toast de sucesso, os campos revelam o erro. (Já coberto pelo caminho feliz pré-existente de `Form.integration.test.tsx` — comportamento preservado.)
- [x] O mesmo formulário com `submit` escrito em `payload: { submit: true }` **também** barra (leniência 2.1) — `isSubmitAction()` reconhece os dois locais.
- [x] Um `api_call` que envia um form-escopo com erros SEM marcar submit emite `console.warn` ensinando a correção (2.2) **e BLOQUEIA** (decisão confirmada com o mantenedor via HITL na execução: avisar E bloquear — persistir dado inválido é o dano concreto que o Selo pegou).
- [x] `submit: true` sem `form: { id }` no escopo emite `console.warn` (2.2) — não bloqueia (nada a bloquear sem form-escopo).
- [x] Uma regra de `validation` com shape inválido emite `console.warn` com exemplo e é ignorada sem quebrar a tela (2.3) — só a regra culpada é removida; as demais do mesmo campo continuam validando.
- [x] Skill `ui-integra-escrever-manifesto` (+ espelho `.claude`, hash igual — symlink) traz o exemplo canônico do form que barra e o shape documentado de `validation`; catálogo regenerado inclui a seção "Regras de `validation`".
- [x] Gates verdes: `RegistryParity` (5/5), `catalog:check` (em dia), `npm run build` (verde), `run_audit.mjs` sem regressão — mesmo baseline pré-existente (1 hardcode `SarakTypography.tsx:42`; 3 vars-fantasma; 3 órfãos da Conferência Funcional).

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] Dispatcher/`apiCall`: (a) `action.submit` true + form com erro → `SubmitBlockedError`, nenhum interceptor chamado; (b) `payload.submit` true + form com erro → mesmo bloqueio (leniência); (c) form com erro + api_call sem submit → `console.warn` (spy) + BLOQUEIA; (d) `submit` true sem form-escopo → `console.warn`, segue sem bloquear; (e) form sem erro + sem submit → passa normal, zero warn. (`src/core/Manifest/__tests__/createDispatcher.test.ts`, describe "Spec 28" — 6 casos novos; lógica extraída para `Dispatcher/submitGate.ts` por limite de linhas do arquivo, MAX_LINES=250)
- [x] `sanitizeDirectives`: item de `validation` com `rule` desconhecido / faltando `value` → `console.warn` + regra descartada, motor de pé; array 100% válido passa intacto; `validation` não-array continua removendo a diretiva inteira (não regride). (`nodes/__tests__/sanitizeDirectives.test.ts`, describe "Spec 28" — 5 casos novos)
- [x] Regressão: o caminho feliz existente (form válido → submit dispara, `buildPayload` aninhado, `reset` no sucesso) continua verde (`Form.integration.test.tsx`).
## Integração
- [x] Tela de formulário montada via manifesto (do exemplo canônico da skill) exercitando submit vazio → bloqueio + erros revelados; submit preenchido → api_call + toast de sucesso + reset (pré-existente, intacto). Casos novos: `payload.submit` alias barra igual ao topo; botão sem `submit` num form com erro é bloqueado + avisa. (`Form.integration.test.tsx`, describe "Spec 28" — 2 casos novos)
## Re-teste real (validação final — NÃO é só unitário)
- [ ] **Re-Selo — P15, item 15 do roteiro (2ª execução da Spec 26, precedida da limpeza da Spec 31/P14):** um agente externo, seguindo a skill atualizada, monta um formulário e confirma que submit vazio é barrado (M6 volta a PASS) e que a skill/catálogo bastaram para escrever `validation` sem adivinhar (M9 volta a PASS). O gate do Selo é o teste real, não a suíte unitária.
