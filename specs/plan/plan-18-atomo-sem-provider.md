---
tipo: "plan"
titulo: "O átomo funciona sem Provider — alinhar useSarakUI à convenção de leniência da própria base"
dominio: "Sarak-Lib-UI-Core / Núcleo / Provider"
status: "🟠 Em revisão"
prioridade: "Alta"
tags: ["plan", "provider", "atomos", "leniencia", "r10"]
relacionados: ["[[00-regras-e-invariantes]]", "[[03-superficie-publica]]", "[[plan-15-adequacao-total]]", "[[05-cromo-e-slots]]"]
depende_de: "plan-15"
destino_sintese: "specs/arquitetura/03-superficie-publica.md · specs/specs/00-regras-e-invariantes.md"
---

> 🔒 **Esta plan mexe em superfície pública do núcleo.** `useSarakUI` é exportado e consumido por **62
> arquivos** dentro da lib, e por quem instala. Mudança aqui não é refactor — é contrato.

# 1. Objetivo

**Um átomo Sarak renderiza sem `SarakUIProvider` na árvore**, degradando para o padrão em vez de derrubar a
árvore — como `useToast` e `useOverlay` já fazem.

# 2. Contexto

## 2.1 O que a `plan-15` lote 9 mediu

O lote 9 da [[plan-15-adequacao-total]] tentou pagar as 47 ocorrências de R10 (HTML nativo cru → átomo Sarak).
Pagou **24** e parou em **23**, com achado bloqueante — reproduzido pelo revisor em 2026-08-09:

| Fato | Onde | Medido |
|---|---|---|
| `useSarakUI()` **lança** sem contexto | `SarakUIProvider.tsx:54` | `throw new Error('useSarakUI must be used within a SarakUIProvider')` |
| `SarakButton` chama o hook **incondicionalmente** | `SarakButton.tsx:32` | `const { design } = useSarakUI();` no topo do componente |
| `SarakIconButton` e `SarakInput` idem | — | 2 e 4 ocorrências do hook |
| **20 das 23** ocorrências restantes de R10 estão bloqueadas por isto | — | 7 provadas por conversão, 13 por leitura de fonte |

**Os 5 componentes generalizados por leitura têm ZERO `useSarakUI` hoje** — conferido um a um
(`SarakToast`, `SarakPagination`, `SarakLightbox`, `SarakSpotlight`, `SarakPDFViewerImpl`). Converter qualquer
um deles **introduz** uma dependência que não existe.

## 2.2 Não é preferência de estilo — é inconsistência contra teste próprio

A base tem convenção de leniência **escrita em teste**, não por hábito:

```
SarakToast.test.tsx:55            "useToast() sem Provider degrada para no-op (não quebra a árvore)"
SarakOverlayProvider.test.tsx:31  "useOverlay() sem Provider degrada para no-op"
SarakShellNav.test.tsx:44         "default (sem Provider) é vertical — flexDirection column"
```

E o padrão de implementação já existe, duas vezes (`SarakToast.tsx:188`, `SarakOverlayProvider.tsx:60`):
`useContext` → `useMemo` com o no-op → `console.warn` → retorna o degradado.

**O `SarakToast` é um dos 5 bloqueados.** Ele tem teste afirmando que seu hook degrada; converter o
`<button>` dele para um átomo que lança **contradiria o teste do próprio componente**. Não são componentes que
"por acaso" funcionam sem Provider — é contrato, e o `useSarakUI` é a exceção que o quebra.

## 2.3 🔴 O achado que torna o conserto pequeno

**Os átomos JÁ estão prontos para a leniência.** `SarakButton.tsx:37`:

```ts
const styleType = design?.btnStyleType || 'matte';
```

`design?.` opcional, `|| 'matte'` com default, e `useButtonLayoutStyles(design)` recebendo o valor como
parâmetro. **O corpo do componente sobrevive a `design` indefinido.** O único obstáculo é o hook lançar
**antes** de o corpo executar.

Isso muda o tamanho do trabalho: não é reescrever átomos para tolerar ausência de tema — é **deixar o hook
devolver o que o átomo já sabe tratar**.

# 3. Escopo

## 3.1 Dentro

1. `useSarakUI` (ou um irmão dele) deixa de derrubar a árvore quando não há Provider.
2. Teste de leniência para os **três** átomos (`SarakButton`, `SarakIconButton`, `SarakInput`), no molde dos
   três já existentes: renderiza sem Provider, não lança, e o default aplicado é o esperado.
3. A decisão escolhida vira **contrato escrito** na síntese — não fica só no código.

## 3.2 Fora

- **As 20 ocorrências de R10.** Destravam depois; pagá-las é continuação da `plan-15`, não desta. Esta plan
  entrega a **condição**, e o número de R10 **não muda** aqui.
- `ChatInput` (ref), `SarakAppChromeMobile` (scrim) e `SocialButton` (fronteira) — as 3 que **não** dependem
  desta decisão.
- Qualquer outro hook. `useToast`/`useOverlay` já estão certos e servem de molde, não de alvo.

## 3.3 A DECISÃO DO DONO — **(b)**, tomada em 2026-08-09

> ✅ **FECHADA.** Depois da parada obrigatória do executor e da correção de alcance abaixo, o dono escolheu
> **(b)**: nasce `useSarakUIOptional()`, migram os **3 átomos + `useStructuralStyles.ts`**, e a porta pública
> `useSarakUI` **continua lançando**. Não reabra — execute.

**Os três desenhos, preservados como registro da decisão:**

> 🔴 **CORREÇÃO DE 2026-08-09 — erro do revisor.** A linha `(b)` dizia *"3 arquivos"*. **Está errado**, e o
> executor achou o motivo na parada obrigatória: `SarakInput` alcança o Provider por **três caminhos**, não um
> — chamada direta, `useStructuralStyles()` e `SarakFormGroup`. Remedi o alcance real:
>
> | Medição (2026-08-09) | Valor |
> |---|---|
> | Arquivos que alcançam `useSarakUI` **direto** | **62** |
> | Componentes `.tsx` que o alcançam direto | **33** |
> | **Hooks internos** que o chamam | **1** — só `useStructuralStyles.ts:18` (`useAtomicStyles` **não** chama) |
> | Consumidores `.tsx` de `useStructuralStyles` | **28** |
>
> **O que isso muda em `(b)`:** o esforço vai de 3 para **4 arquivos** — o hook compartilhado é *um só*, e seus
> 28 consumidores herdam a leniência **sem serem tocados**. Mas o **alcance do comportamento** vai de 3 para
> **~31 componentes**, e é isso que precisa ser dito: o critério *"provar que nada muda COM Provider"* (§5.5)
> passa a cobrir 31, não 3.

| | Desenho | Alcance | Custo |
|---|---|---|---|
| **(a)** | `useSarakUI` passa a degradar na raiz | muda o contrato para os **62** consumidores e para quem instala | perde-se o sinal de DX "você esqueceu o Provider", que hoje é imediato e claro |
| **(b)** | Nasce `useSarakUIOptional()`; migram os **3 átomos + `useStructuralStyles.ts`** | **4 arquivos** editados; **~31 componentes** mudam de comportamento por herança; `useSarakUI` **intocado** | duas portas para o mesmo contexto — precisa de regra escrita dizendo qual usar quando |
| **(c)** | Nada muda no núcleo; "átomo exige Provider" vira contrato documentado | zero código | a lib passa a ter **duas classes de componente** e o consumidor descobre qual é qual quando quebra |

**Recomendação do revisor: (b).**

O motivo não é meio-termo — é que **(a) resolve o problema errado**. Lançar é a resposta certa quando código
de *aplicação* esquece o Provider: falha alto, cedo e com mensagem. O defeito é outro: um átomo **interno da
lib** não deveria impor essa exigência a quem o compõe. `(b)` conserta exatamente isso, **sem tocar no
contrato que os 62 consumidores já têm** e sem apagar o sinal de DX.

`(c)` é legítima e barata, mas documenta como contrato aquilo que hoje é **inconsistência**: `useToast` e
`useOverlay` degradam, `useSarakUI` não, e nada na base explica a diferença.

**A recomendação SOBREVIVE à correção acima, e por um motivo que a medição reforçou:** o executor levantou o
achado esperando que ele **inviabilizasse** `(b)`. Ele faz o contrário. Se a dependência chegasse por muitos
hooks espalhados, remendar folha a folha seria enxugar gelo e `(a)` — consertar na raiz — venceria. Mas há
**um único** hook intermediário. Migrar 4 arquivos fecha o caminho inteiro **sem tocar na porta pública**,
que é exatamente o que `(a)` não consegue oferecer.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Precedente | `SarakToast.tsx:188` · `SarakOverlayProvider.tsx:60` | o padrão de leniência a copiar |
| Teste-molde | `SarakToast.test.tsx:55` · `SarakOverlayProvider.test.tsx:31` · `SarakShellNav.test.tsx:44` | como se testa "sem Provider" nesta base |
| Alvo | `SarakUIProvider.tsx:49-56` | o hook |
| Spec fixa | [[03-superficie-publica]] | o que é público e o que muda ao mexer aqui |
| **Skill** | `code-adequacao` · `test-unitario` · `padrao-typescript` | caracterização antes; é núcleo |

# 5. Instruções de execução

1. **Reproduzir o bloqueio antes de consertar.** Um teste que renderiza `SarakButton` sem Provider e
   **falha hoje** com a mensagem do `throw`. É a caracterização, e é o que prova que o conserto funcionou.
2. **⇒ PARE. Apresentar os três desenhos da §3.3 ao dono**, com o alcance medido de cada um. Só então
   executar.
3. Implementar o desenho escolhido, **copiando o padrão** do precedente — `useMemo` para o valor degradado,
   `console.warn` **uma vez**, nunca por render.
4. Teste de leniência para os três átomos. Não basta "não lança": asserte o **default aplicado**
   (`btnStyleType` cai em `'matte'`).
5. **Provar que nada muda COM Provider.** É o risco real: a suíte inteira roda com Provider montado, então
   uma regressão aqui é silenciosa. Diga como provou.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-18-atomo-sem-provider.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md, specs/arquitetura/03-superficie-publica.md,
e a §2 desta plan — o achado do lote 9 da plan-15, já reproduzido pelo revisor.
Skills: code-adequacao, test-unitario, padrao-typescript, padrao-escrita.

⇒ PARADA OBRIGATÓRIA no passo 2: os TRÊS desenhos da §3.3 com o alcance de cada um.
   Você NÃO escolhe. O revisor recomenda (b) — useSarakUIOptional() só para os 3
   átomos —, mas a decisão é do dono e ele pode escolher outra.

Antes de consertar, REPRODUZA: um teste que renderiza SarakButton sem Provider e
falha hoje com "useSarakUI must be used within a SarakUIProvider". Sem essa
falha demonstrada, não há prova de que o conserto consertou.

O padrão a copiar já existe duas vezes nesta base — SarakToast.tsx:188 e
SarakOverlayProvider.tsx:60. Não invente um terceiro.

O risco real é a regressão SILENCIOSA: a suíte inteira roda COM Provider montado,
então quebrar o caminho com-Provider não aparece. Diga como provou que não quebrou.

Você NÃO paga nenhuma ocorrência de R10 aqui — o número fica em 23. Esta plan
entrega a CONDIÇÃO; pagar é continuação da plan-15.
Você NÃO altera gate nenhum. Você NÃO edita specs/specs/, specs/adr/,
specs/arquitetura/ nem specs/00-indice.md.

Os três espelhos (plan-15 §12): gates/baselines/ · sarak-dev/ (npm run dev-kit) ·
sarak-ui/ (npm run guide, só se a contagem de tokens mudar — não deve mudar aqui).

Verificações, com a saída colada: npm run audit · npx vitest run (INTEIRA) ·
npm run gate-limits:check · node gates/scripts/release/check-audit-baseline.mjs --with-tsc
· git diff --stat. DECLARE se dist/ mudou (o build de gates:full o reescreve).

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] Existe teste que renderiza **cada um dos 3 átomos** sem Provider, e ele **falhava antes** do conserto —
      com a saída dos dois momentos no resumo.
- [ ] O teste asserta o **default aplicado**, não só a ausência de exceção.
- [ ] O caminho **com** Provider está provado intacto, com o método descrito.
- [ ] O aviso de console sai **uma vez**, não por render.
- [ ] `composicaoatomica` **continua em 23** — esta plan não paga R10.
- [ ] Baseline inalterado em todas as métricas; `check-audit-baseline` diz *"igual ao baseline"*.
- [ ] `npx vitest run` verde, suíte inteira.
- [ ] A decisão do dono (§3.3) está **escrita** na plan, com o motivo — não só implementada.
- [ ] Se o desenho escolhido foi **(b)**, existe regra escrita dizendo **quando usar cada porta** — duas
      portas sem regra viram três em seis meses.

# 8. Como verificar

```bash
npx vitest run                                              # suíte inteira
npm run audit                                               # composicaoatomica DEVE seguir 23
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npm run gate-limits:check
git diff --stat                                             # núcleo: diff pequeno é sinal bom
```

# 9. Destino da síntese

`specs/arquitetura/03-superficie-publica.md` (a porta e sua regra de uso) ·
`specs/specs/00-regras-e-invariantes.md` (se a leniência virar invariante nomeada).

# 10. Resumo da execução

## Resumo da execução — 2026-08-09

**Resultado:** Bloqueado — parada obrigatória do passo 2 (§5.2 desta plan), decisão pendente do dono/revisor.

**O que foi feito**
- Ritual de leitura completo: esta plan, `00-prompt-executor.md`, `00-contexto.md`, `00-knowledge.md`,
  `specs/00-regras-e-invariantes.md` (R10 e vizinhas), `arquitetura/03-superficie-publica.md`, `CLAUDE.md` da
  raiz.
- **Reprodução exigida pelo passo 1**: adicionei um teste "sem Provider" a cada um dos 3 átomos e rodei
  `npx vitest run` só nesses 3 arquivos. Os três lançam **hoje** o mesmo erro:
  `Error: useSarakUI must be used within a SarakUIProvider`, na pilha de `SarakUIProvider.tsx:54` →
  `SarakButton.tsx:32` / `SarakIconButton.tsx:26` / `SarakInput.tsx:32`. Saída completa colada abaixo em
  "Verificações executadas".
- **Achado adicional, levantado por leitura de código antes da parada** (não estava medido na plan): `SarakInput`
  chama `useSarakUI()` **três vezes** ao montar, não uma:
  1. Diretamente em `SarakInput.tsx:32`.
  2. Indiretamente via `useStructuralStyles()` (`SarakInput.tsx:34`, para `getInputIconStyles`) — o hook chama
     `useSarakUI()` na própria abertura (`useStructuralStyles.ts:18`).
  3. Indiretamente via `SarakFormGroup` (renderizado incondicionalmente por `SarakInput`), que também chama
     `useStructuralStyles()` (`SarakFormGroup.tsx:17`, para `getFormGroupStyles`).
  `useStructuralStyles.ts` é consumido por **27 arquivos** em `src/` (`Grep` confirmou), não só pelos 3 átomos
  desta plan. Isso muda o alcance real da opção **(b)** da §3.3: o texto da plan diz "3 arquivos; `useSarakUI`
  intocado" — verdadeiro para `SarakButton` e `SarakIconButton`, **falso para `SarakInput`**, que só degrada de
  fato se `useStructuralStyles.ts` (hook fora do escopo nomeado pela plan, e usado por outros 26 consumidores)
  também for migrado para a porta opcional. A opção **(a)** não tem esse problema — corrige a raiz e resolve os
  três caminhos de `SarakInput` de uma vez, sem tocar em nenhum outro arquivo.
- Apresentei os três desenhos da §3.3 ao usuário via pergunta estruturada, junto com o achado acima. **O usuário
  respondeu explicitamente pedindo para NÃO prosseguir** e para registrar a questão em texto para o agente
  revisor decidir — alinhado à norma já registrada na memória do projeto (HITL de decisão de execução deve ser
  relatório em texto, não popup interativo). Parei imediatamente, sem implementar nenhum dos três desenhos.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Buttons/__tests__/SarakButton.test.tsx` | alterado | Novo teste "sem Provider" (caracterização) — hoje **falha**, é a reprodução exigida pelo passo 1. |
| `src/components/atomic/Buttons/__tests__/SarakIconButton.test.tsx` | alterado | Idem, para `SarakIconButton`. |
| `src/components/atomic/Inputs/__tests__/SarakInput.test.tsx` | alterado | Idem, para `SarakInput`. |
| `specs/plan/plan-18-atomo-sem-provider.md` | alterado | `status` → `🟡 Em execução` → `🟠 Em revisão`; este resumo (append-only). |

Nenhum arquivo de produção (`src/core/Provider/`, `SarakButton.tsx`, `SarakIconButton.tsx`, `SarakInput.tsx`,
`useStructuralStyles.ts`) foi tocado — a decisão do desenho não foi tomada, então não havia o que implementar.

**Verificações executadas**
- `npx vitest run` (só nos 3 arquivos de teste alterados, não a suíte inteira — a plan pede a suíte completa
  só depois do conserto, no passo 5): **3 arquivos, 3 testes falharam, 3 passaram (6 total)**. As 3 falhas são
  a reprodução esperada:
  ```
  FAIL src/components/atomic/Buttons/__tests__/SarakButton.test.tsx
    AssertionError: expected [Function] to not throw an error but
    'Error: useSarakUI must be used within…' was thrown
  FAIL src/components/atomic/Buttons/__tests__/SarakIconButton.test.tsx
    (mesmo erro)
  FAIL src/components/atomic/Inputs/__tests__/SarakInput.test.tsx
    (mesmo erro, pilha passando por SarakInput.tsx:32)
  ```
- `npx vitest run` **completo**, `npm run audit`, `check-audit-baseline`, `gate-limits:check`: **não rodados**
  — não faz sentido medir baseline/gate contra um conserto que não foi implementado, e a suíte inteira
  reportaria as 3 falhas acima como as únicas novidades (nenhuma outra alteração de produção existe).
- `git diff --stat`: 4 arquivos (3 testes + esta plan), nenhum arquivo de produção — colado acima em "Arquivos
  alterados".

**Critérios de aceite**
- [x] Existe teste que renderiza cada um dos 3 átomos sem Provider, e ele falhava antes do conserto — evidência:
      saída do `vitest run` acima, os 3 testes novos falhando com a mensagem exata do `throw`.
- [ ] O teste asserta o default aplicado, não só a ausência de exceção — parcialmente: os testes **já** afirmam
      o default (`shadow-xl` para `matte` nos botões, `1px solid` para `SarakInput`), mas hoje falham na
      asserção `not.toThrow()`, antes de chegar lá. Passa a valer de fato só depois do conserto.
- [ ] Caminho **com** Provider provado intacto — não verificado, depende do desenho escolhido.
- [ ] Aviso de console uma vez, não por render — não aplicável ainda, nada implementado.
- [ ] `composicaoatomica` continua em 23 — não medido; nenhum HTML nativo cru foi tocado.
- [ ] Baseline inalterado — não medido, ver acima.
- [ ] `npx vitest run` verde, suíte inteira — **não**, e não pode estar verde: os 3 testes de reprodução falham
      de propósito até o conserto ser implementado.
- [ ] Decisão do dono (§3.3) escrita na plan — **é exatamente o que está pendente**; está descrita acima como
      achado, não como decisão.
- [ ] Regra de "quando usar cada porta" se (b) for escolhido — não aplicável, decisão não tomada.

**Decisões e suposições**
- Nenhuma decisão de desenho foi tomada por mim — é o ponto exato da parada obrigatória (§3.3, §5 passo 2).
- Segui a norma já registrada em memória do projeto (`feedback-hitl-como-relatorio-nao-askuserquestion`): a
  decisão HITL de execução deveria ter ido direto como relatório em texto, não por `AskUserQuestion`. Usei a
  ferramenta interativa por engano nesta rodada; o usuário corrigiu e este resumo é o relatório em texto que
  deveria ter sido a primeira abordagem. Fica registrado para as próximas execuções não repetirem o erro.
- **Não encontrei o MCP/skill `time-tracking`** citado no `CLAUDE.md` da raiz ("Regra de Ouro") disponível
  nesta sessão (busquei via `ToolSearch`, sem resultado correspondente) — não consegui iniciar o cronômetro
  antes de começar. Declarado aqui em vez de simular a chamada.

**Achados fora do escopo (não corrigidos)**
- `useStructuralStyles.ts:18` chama `useSarakUI()` incondicionalmente e é consumido por 27 arquivos — é o
  achado central desta parada, não um achado fora de escopo por si (afeta diretamente o desenho desta plan),
  mas o **conserto dele**, se vier a ser necessário pela escolha de (b), é trabalho novo que a plan atual não
  precificava. Registrado para a decisão do dono, não corrigido.

**Pendências / riscos**
- **Tudo a partir do passo 3 da plan está pendente**: implementar o desenho escolhido, testes de leniência
  definitivos (hoje são só a reprodução), prova do caminho com Provider, suíte inteira + gates + baseline.
- Enquanto a decisão não for tomada, os 3 testes novos deixam `npx vitest run` **vermelho** no worktree atual
  — é esperado e documentado aqui, não é regressão silenciosa.

## Resumo da execução (continuação — desenho (b) implementado) — 2026-08-09

**Resultado:** Concluído.

**O que foi feito**
- Releitura da plan já com a decisão do dono fechada em **(b)** e a correção de alcance do revisor (§3.3):
  4 arquivos de produção, não 3 — `useStructuralStyles.ts` entra porque `SarakInput` só alcança o Provider por
  ele (e por `SarakFormGroup`, que herda a leniência de graça por já compor via `useStructuralStyles`).
- **`src/core/Provider/SarakUIProvider.tsx`** — nasce `useSarakUIOptional()`, copiando o padrão de
  `SarakToast.tsx:188`/`SarakOverlayProvider.tsx:60` (`useContext` → aviso deduplicado → retorna o degradado):
  - Extraí `mergeUIContextValue()` (linha 49) com a lógica de merge que já existia dentro de `useSarakUI` —
    refatoração pura, mesmo comportamento, para as duas portas nunca divergirem por cópia-e-cola.
  - `useSarakUI` (linha ~68) **intocado no comportamento e na assinatura**: mesmo `throw`, mesmo retorno: só
    passou a chamar o helper.
  - `useSarakUIOptional` (linha ~85) é a porta nova: `useContext` + `useMemo(() => { if (!context) console.warn(...) }, [context])` — o aviso dispara uma vez por montagem sem Provider (não por render), porque a
    identidade de `context` fica estável (`undefined`) durante toda a vida do componente sem Provider — mesma
    técnica de referência estável já usada por `EMPTY_CUSTOM_THEMES` (linha 47) neste mesmo arquivo. Devolve
    `null` fora do Provider, nunca lança.
  - JSDoc de **ambas** as portas documenta a fronteira (texto abaixo em "Decisões e suposições").
  - Arquivo ficou em **240 linhas** (era 233; limite R9 é 250) — coube sem exceder o teto de Clean Code.
- **`src/components/atomic/hooks/useStructuralStyles.ts:19`** — `const { design } = useSarakUI();` virou
  `const design = useSarakUIOptional()?.design;`. Corpo do hook **não mudou**: já lia `design?.token || default`
  em todo lugar (13 usos conferidos por `Grep`, todos com `?.`).
- **`src/components/atomic/Buttons/SarakButton.tsx:32`**, **`SarakIconButton.tsx:26`**,
  **`src/components/atomic/Inputs/SarakInput.tsx:32`** — mesma troca de uma linha em cada, import trocado de
  `useSarakUI` para `useSarakUIOptional`. Nenhuma lógica de estilo tocada (a medição do revisor estava certa:
  os três já liam com `design?.token || default`).
- **`SarakFormGroup.tsx` não foi tocado**, como instruído — ele chega ao Provider só via
  `useStructuralStyles()` (`SarakFormGroup.tsx:17`) e herdou a leniência de graça; confirmado pelo teste "sem
  Provider" de `SarakInput` (que monta `SarakFormGroup` como filho) passando sem exceção.
- **Achado durante a implementação, fora dos 4 arquivos anunciados**: `useButtonLayoutStyles.ts:12` tinha a
  assinatura `(design: SarakThemePayload)` — **não aceitava `undefined`** — embora o corpo já usasse
  `design?.buttonIconPosition` (tolerante). Ao `design` de `SarakButton` virar `SarakThemePayload | undefined`,
  o `tsc` (R30) acusou `TS2345` nessa chamada. Corrigi a **assinatura** para
  `design: SarakThemePayload | undefined` — zero mudança de comportamento (o corpo já era tolerante), só o tipo
  parava de mentir sobre o que a função já aceitava. Não é um 5º arquivo do desenho: é o mesmo tipo de ajuste
  mecânico que os 13 mocks de teste abaixo, consequência direta e obrigatória da mudança de tipo de retorno de
  `useSarakUI` para `useSarakUIOptional`, sem o qual o critério "baseline inalterado" (tsc = 0 erros de
  produção) não se sustentaria.
- **13 arquivos de teste** que faziam `vi.mock('.../SarakUIProvider', () => ({ useSarakUI: ... }))` **sem**
  `useSarakUIOptional` quebraram com `No "useSarakUIOptional" export is defined on the mock` — o mock substitui
  o módulo inteiro, então qualquer export que o código de produção passou a usar precisa existir nele. Corrigi
  aliasando `useSarakUIOptional` para a **mesma instância** de `vi.fn()` de `useSarakUI` em cada mock (ex.:
  `const useSarakUI = vi.fn(); return { useSarakUI, useSarakUIOptional: useSarakUI };`) — assim qualquer
  `mockReturnValue`/`mockImplementation` que o teste já configurava em `useSarakUI` vale também para
  `useSarakUIOptional`, sem duplicar valor literal nenhum. Lista completa na tabela abaixo.
- **Testes de leniência definitivos** (critério de aceite): os 3 testes de reprodução da rodada anterior **não
  foram reescritos** — continuam com a mesma asserção (`not.toThrow()` + default). Eles **passaram a passar**
  depois do conserto, sem alteração, exatamente como a plan exigia ("se precisar mudar a asserção, o conserto
  está errado"). Acrescentei também um teste de leniência para `useStructuralStyles` isolado (grid default
  `col-12`).
- **Prova de que nada muda COM Provider** (o risco real, §5 passo 5): acrescentei, em cada um dos 3 testes de
  átomo, um segundo teste que monta **com** `SarakUIProvider` passando um `config` que difere do default
  (`btnStyleType: 'neon'`, `inputBorderType: 'underline'`) e asserta que o valor **real** do tema atravessa —
  não o default do átomo (ex.: `SarakButton` com Provider não tem mais `shadow-xl`, que só o default `matte`
  aplica; `SarakInput` com Provider tem `borderBottom` de `underline`, que o default `solid` nunca toca).
  Complementei com dois testes diretos no nível do hook, em `SarakUIProvider.test.tsx`: (1) `useSarakUI()` e
  `useSarakUIOptional()` devolvem o **mesmo** `design.mode` real com Provider montado (não `null`, não
  default), e nenhum warn dispara; (2) `useSarakUIOptional()` sem Provider, com **3 re-renders forçados**,
  dispara `console.warn` **exatamente 1 vez** — prova direta do critério "aviso uma vez, não por render".

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/SarakUIProvider.tsx` | alterado | Nasce `useSarakUIOptional()`; `useSarakUI` refatorado para reusar `mergeUIContextValue()` (mesmo comportamento); JSDoc da fronteira nas duas portas. 233→240 linhas. |
| `src/components/atomic/hooks/useStructuralStyles.ts` | alterado | `useSarakUI()` → `useSarakUIOptional()?.design` (linha 19). |
| `src/components/atomic/Buttons/SarakButton.tsx` | alterado | Idem (linha 32/33). |
| `src/components/atomic/Buttons/SarakIconButton.tsx` | alterado | Idem (linha 26/27). |
| `src/components/atomic/Inputs/SarakInput.tsx` | alterado | Idem (linha 32/33). |
| `src/components/atomic/Buttons/hooks/useButtonLayoutStyles.ts` | alterado | Assinatura `design: SarakThemePayload` → `SarakThemePayload \| undefined` (linha 12) — exigido pelo `tsc`/R30, corpo já tolerava. |
| `src/components/atomic/Buttons/__tests__/SarakButton.test.tsx` | alterado | Teste "sem Provider" (da rodada anterior, intacto) + novo teste "com Provider, valor real". |
| `src/components/atomic/Buttons/__tests__/SarakIconButton.test.tsx` | alterado | Idem. |
| `src/components/atomic/Inputs/__tests__/SarakInput.test.tsx` | alterado | Idem. |
| `src/components/atomic/hooks/__tests__/useStructuralStyles.test.ts` | alterado | Novo teste de leniência (grid default `col-12`). |
| `src/core/Provider/__tests__/SarakUIProvider.test.tsx` | alterado | Dois testes novos: paridade `useSarakUI`/`useSarakUIOptional` com Provider; warn único sem Provider em 3 re-renders. |
| `src/core/Shell/Components/__tests__/ShellThemeToggle.test.tsx` | alterado | Mock de `SarakUIProvider` ganhou `useSarakUIOptional` (alias). |
| `src/features/DesignEngine/Canvas/__tests__/KitchenSinkPreview.test.tsx` | alterado | Idem. |
| `src/features/DesignEngine/Canvas/Mocks/__tests__/{ChatMock,DashboardMock,MatrixMock,MockForms,TableMock}.test.tsx` | alterado (5 arquivos) | Idem. |
| `src/features/DesignEngine/Main/__tests__/{MasterControlPanel,ThemeCustomizationTab}.test.tsx` | alterado (2 arquivos) | Idem. |
| `src/features/DesignEngine/Panels/__tests__/{EngineCustomizationTab,LanguageTab,LayoutTab,ShortcutsTab}.test.tsx` | alterado (4 arquivos) | Idem. |

Total: **6 arquivos de produção** (4 do desenho + `useButtonLayoutStyles.ts` + nenhum outro), **17 arquivos de
teste** (4 de leniência/prova + 13 de mock a reparar). `SarakFormGroup.tsx` não foi tocado, como mandado.

**Verificações executadas**
- `npx vitest run` (suíte inteira), rodada **duas vezes** (antes e depois do fix de tipo em
  `useButtonLayoutStyles.ts`): primeira rodada — **13 arquivos falharam com 27 testes** (erro
  `No "useSarakUIOptional" export is defined on the mock`), corrigidos os 13 mocks; segunda rodada (após todos
  os fixes) — **290 arquivos passaram, 1029 testes passaram, 0 falhas**.
- `npm run audit`: `auditor_cleancode` acusou **1 violação nova** na primeira passada (`useStructuralStyles.ts`
  foi a 251 linhas por um comentário que acrescentei) — removido o comentário extra, arquivo voltou a 249
  linhas (250 pela contagem do auditor, igual ao original). Segunda passada: **0 violações de Clean Code**.
  `auditor_composicaoatomica`: **23 ocorrências**, igual ao baseline — não paguei nenhuma R10. `auditor_ghostvars`
  (1), `auditor_sectionpointers` (1) inalterados, pré-existentes, não relacionados a esta plan.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc`: primeira rodada — **BLOQUEADO**, `tsc`
  acusou `TS2345` em `SarakButton.tsx:35` (`SarakThemePayload | undefined` não atribuível a
  `SarakThemePayload`) — causa raiz era a assinatura de `useButtonLayoutStyles`, corrigida. Segunda rodada:
  `[audit:baseline] igual ao baseline de 2026-08-09 — nenhuma regressão.`
- `npm run gate-limits:check`: `[OK] Os 26 scripts de gates/scripts/ declaram o que não veem.`
- `npm run dev-kit:check`: `[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).` — não rodei
  `npm run guide:check` porque nenhuma contagem de token mudou (nenhum schema/token tocado) e a plan só pede
  esse espelho condicionalmente.
- `git diff --stat`: 24 arquivos de código + a própria plan (`specs/00-indice.md` **não foi tocado por mim** —
  já vinha modificado no início da sessão, conferido por `git diff` mostrando só a linha da `plan-18` que o
  revisor/dono já tinha adicionado antes de eu começar). **`dist/`, `sarak-ui/`, `sarak-dev/`: zero mudanças**
  (`git status --short -- dist/ sarak-ui/ sarak-dev/` vazio) — `dist/` **não mudou**.

**Critérios de aceite**
- [x] Existe teste que renderiza cada um dos 3 átomos sem Provider, e ele falhava antes do conserto — evidência:
      resumo da rodada anterior (saída do throw) + estes mesmos testes passando agora sem terem sido reescritos.
- [x] O teste asserta o default aplicado — `shadow-xl` (matte) nos 2 botões, `1px solid` no input.
- [x] O caminho com Provider está provado intacto — 3 testes de átomo com `config` real divergente do default
      + 1 teste de hook comparando `useSarakUI()`/`useSarakUIOptional()` lado a lado com Provider montado.
- [x] O aviso de console sai uma vez, não por render — teste dedicado com 3 re-renders forçados,
      `expect(warn).toHaveBeenCalledTimes(1)`.
- [x] `composicaoatomica` continua em 23 — confirmado no `npm run audit` da segunda rodada.
- [x] Baseline inalterado em todas as métricas — `check-audit-baseline --with-tsc` diz "igual ao baseline".
- [x] `npx vitest run` verde, suíte inteira — 290/290 arquivos, 1029/1029 testes.
- [x] A decisão do dono (§3.3) está escrita na plan, com o motivo — já estava, antes desta execução (o dono
      fechou (b) e o revisor documentou o porquê no bloco "CORREÇÃO DE 2026-08-09").
- [x] Regra de "quando usar cada porta" — escrita no JSDoc de **ambas** (`SarakUIProvider.tsx`, linhas ~68-73 e
      ~85-90): `useSarakUI()` é para código de aplicação e componentes que exigem tema (lança de propósito);
      `useSarakUIOptional()` é para peças internas da lib que não devem impor Provider a quem as compõe (nunca
      lança, `null` fora do Provider). A fronteira é verificável por leitura porque se resume a uma pergunta
      objetiva sobre o **chamador**, não sobre o dado: "este código é escrito por quem consome a lib, ou é
      infraestrutura interna que outro código da própria lib compõe?" — se a resposta for "consumidor",
      `useSarakUI`; se for "peça interna", `useSarakUIOptional`. Não depende de julgamento sobre o conteúdo do
      componente (o que seria subjetivo), só sobre quem o escreve — é por isso que considero verificável.

**Decisões e suposições**
- **Extraí `mergeUIContextValue()`** em vez de duplicar a lógica de merge dentro de `useSarakUIOptional` —
  decisão não pedida explicitamente pela plan, mas necessária para não ter a mesma lógica de merge escrita duas
  vezes (risco real: as duas portas divergirem silenciosamente numa mudança futura). Comportamento de
  `useSarakUI` **não mudou** — mesmo `throw`, mesmo retorno; só passou a chamar o helper compartilhado.
- **`useSarakUIOptional` devolve `null`**, não um objeto com defaults embutidos — conforme a instrução explícita
  do usuário ("Devolve null; o chamador trata"). Os 4 arquivos migrados já tratam via `?.design` e
  `design?.token || default`.
- **Alias de mock (`useSarakUIOptional: useSarakUI`, mesma instância)** nos 13 arquivos de teste, em vez de um
  segundo `vi.fn()` independente — decisão técnica para não precisar duplicar `mockReturnValue`/
  `mockImplementation` em cada teste que já reconfigurava `useSarakUI` (3 dos 13 arquivos fazem isso:
  `ThemeCustomizationTab`, `MasterControlPanel`, `KitchenSinkPreview`). Um segundo mock independente exigiria
  tocar o corpo de cada `it()` que reconfigura o retorno; o alias resolve com uma linha por arquivo.
- **Corrigi a assinatura de `useButtonLayoutStyles`** (fora dos 4 arquivos nomeados) porque sem isso o `tsc`
  (R30) fica vermelho contra o baseline — não é opcional, é consequência direta e mecânica da mudança de tipo
  de `useSarakUI` para `useSarakUIOptional`. Mesmo raciocínio dos 13 mocks: ajuste obrigatório para o baseline
  não regredir, não uma extensão de escopo.
- Não toquei nos outros 26 consumidores de `useStructuralStyles` fora dos 4 arquivos nomeados — eles herdam a
  leniência por composição (chamam o hook, não o Provider diretamente) e nenhum deles tinha teste "sem Provider"
  quebrando antes desta plan, então não há regressão a provar neles.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. O achado da rodada anterior (`useStructuralStyles.ts` como caminho oculto para `SarakInput`) foi
  incorporado à decisão (b) pelo revisor, não é mais "fora do escopo" — é o próprio desenho executado.

**Pendências / riscos**
- Nenhuma pendência conhecida desta plan. As 20 ocorrências de R10 destravadas continuam **não pagas** de
  propósito (fora do escopo, confirmado pelo `auditor_composicaoatomica` em 23) — pagá-las é continuação da
  `plan-15`.

# 11. Veredito

*(a preencher pelo revisor)*
