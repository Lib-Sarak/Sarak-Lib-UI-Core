---
tipo: "plan"
titulo: "Tema rastreável — a contraparte só serve se o sistema souber qual tema está no ar"
dominio: "Sarak-Lib-UI-Core / Design / Temas"
status: "🟢 Aprovada"
prioridade: "Máxima"
tags: ["plan", "temas", "modo", "regressao", "consumidor"]
relacionados: ["[[plan-26-contraparte-de-modo]]", "[[plan-24-1-fluxo-de-criacao-de-tema]]", "[[09-temas-e-presets]]"]
depende_de: "plan-26"
objetivo: "Fazer a troca de modo funcionar no consumidor real, expondo o tema efetivo e ligando o token mode ao resolvedor"
destino_sintese: "specs/specs/09-temas-e-presets.md"
---

> 🔴 **A `plan-26` construiu a contraparte e ninguém a usa.** No consumidor real ela nunca é encontrada, e o
> seletor de modo do painel não faz nada. Esta plan fecha os dois.

# 1. Objetivo

Fazer a troca de modo funcionar **no consumidor real**: o token `mode` passa pelo resolvedor, e o contexto
passa a expor **qual tema está efetivamente no ar** — sem isso, a contraparte autorada nunca é encontrada.

# 2. Contexto

## 2.1 O sintoma, na tela do dono

`/design` do ERP, 2026-08-11: **"TEMA DO SISTEMA: Light Mode"** selecionado, interface inteira escura.

## 2.2 Defeito 1 — o token `mode` não converte nada

`mode` é um **token `select`** do catálogo (`["dark","light"]`, nome *"Tema do Sistema"*), e o painel o trata
em `useDesignDraft.ts:112`:

```js
if (key === 'mode') {
    return { ...current, mode: value };   // troca a chave e mais nada
}
```

**Esse `if` é idêntico ao caminho genérico.** Ele existia como documentação de *"`mode` é especial, quem
converte é lá embaixo"* — e a **decisão D removeu o "lá embaixo"**. É a mesma regressão da `plan-26`, num
**quinto chamador** que nem aquela spec nem o revisor mapearam: a busca foi por padrões de *toggle*, e este é
um handler genérico de token com um `if` no meio.

## 2.3 🔴 Defeito 2 — a contraparte NUNCA é encontrada no consumidor real

`ShellThemeToggle` procura assim:

```js
const activeTheme = allThemes?.find((t) => t.id === activeThemeId);
```

**O contexto expõe o `activeThemeId` cru da prop.** E o ERP passa `initialTheme` — seguindo a recomendação da
[[09-temas-e-presets]] §4.3, que chama `initialTheme` de *"o caminho seguro para o caso comum"* e reserva
`activeThemeId` a quem aceita o contrato de estabilidade referencial.

**Logo `activeThemeId` é `undefined`, nenhum tema é rastreável, e o toggle cai sempre no
`syncThemeWithMode`.** As contrapartes autoradas da `plan-26` **nunca são usadas**.

E há agravante: aplicar um preset pelo catálogo grava um `design` e **não registra id nenhum**. Mesmo quem
controla `activeThemeId` fica dessincronizado assim que o usuário troca de tema pelo painel.

> ⚠️ **A lib recomenda o caminho que degrada.** `initialTheme` é o conselho da spec, e é exatamente o que
> desliga a contraparte. Quem seguiu a documentação recebeu o pior comportamento.

## 2.4 A falha de revisão que deixou isso passar

O revisor aprovou a `plan-26` verificando `resolveThemeForMode`, os quatro chamadores, a ida e volta exata e
a autoria das 5 contrapartes. **Não verificou se a busca pela contraparte encontra alguma coisa num
consumidor real.**

**Verificou a função, não o efeito.** O critério de aceite exercitava a unidade; nenhum exercitava a
integração pela porta que a documentação recomenda. É a lição que esta plan carrega para o aceite (§7).

## 2.5 ✅ A decisão do dono *(2026-08-11)*

Trocar de modo com contraparte **sobrescreve os 55 tokens que carregam modo** — inclusive os customizados à
mão no painel depois de aplicar o tema. É inerente: a contraparte é um conjunto de valores fixos.

| Saída | Decisão |
|---|---|
| Preservar a customização e converter só o resto | ❌ complexo, e o resultado fica misto |
| **Trocar de modo RECARREGA o tema, com o painel avisando** | ✅ **escolhida** — simples e previsível |

# 3. Escopo

## 3.1 Dentro

1. **`resolvedThemeId` no contexto** — o tema **efetivamente** no ar. Atualiza quando: a semente aplica
   (`activeThemeId || initialTheme`, lógica que já existe em `useDesignManager:50`), a prop muda, **e o
   painel aplica um preset**. Trocar de modo **não** o altera: é o mesmo tema noutro modo.
2. **O token `mode` passa pelo resolvedor** — `useDesignDraft.updateDraft` deixa de só trocar a chave.
3. **`ShellThemeToggle` e o `PresetsCatalog` passam a ler `resolvedThemeId`**, não a prop crua.
4. **O aviso no painel** — ao trocar de modo, o usuário é informado de que o tema recarrega e customizações
   nos tokens de modo se perdem. Visível **no momento da troca**, não enterrado.

## 3.2 Fora

- ⛔ Renomear ou mudar a semântica de `activeThemeId`/`initialTheme` — são contrato público (**R33**).
  `resolvedThemeId` é **aditivo**.
- ⛔ Mudar `resolveThemeForMode`, as contrapartes dos 5, o gate ou as faixas.
- ⛔ Preservar customização na troca de modo — decisão do dono (§2.5).
- ⛔ Mexer no ERP.

## 3.3 O invariante que amarra as duas portas

O toggle do cromo e o seletor "Tema do Sistema" do painel são **duas portas para a mesma ação**. Depois desta
plan, **têm de produzir design idêntico** para o mesmo tema e o mesmo modo alvo. Vale como teste.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Plan | [[plan-26-contraparte-de-modo]] | `resolveThemeForMode` e as contrapartes que esta plan faz funcionar |
| Plan | [[plan-24-1-fluxo-de-criacao-de-tema]] §2.8 | a decisão D, origem da regressão |
| Spec fixa | [[09-temas-e-presets]] §4.3 · §4.3.1 | `activeThemeId` × `initialTheme`; D registrado |
| Spec fixa | [[00-regras-e-invariantes]] → **R33** | o payload/contrato público que não pode encolher |
| **Skill** | `test-unitario` · `padrao-typescript` · `padrao-escrita` | |

# 5. Instruções de execução

1. **O teste de integração primeiro, e ele tem de falhar.** Provider com `initialTheme` (**não**
   `activeThemeId`), tema com contraparte, trocar de modo ⇒ hoje cai na síntese. Veja o vermelho.
2. **`resolvedThemeId` antes dos chamadores** — sem ele, ligar o token `mode` só troca um defeito por outro.
3. **As duas portas juntas** — toggle e seletor do painel, com o teste de equivalência da §3.3.
4. **Não preserve customização.** É a decisão do dono; o aviso é o que a torna aceitável.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-27-tema-rastreavel.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/09-temas-e-presets.md (§4.3, §4.3.1),
specs/specs/00-regras-e-invariantes.md (R33),
a plan-26 (o resolvedor e as contrapartes) e a §2/§3 desta plan.
Skills: test-unitario, padrao-typescript, padrao-escrita.

⚠️ A plan-26 construiu a contraparte e NINGUÉM A USA. No consumidor real ela
nunca é encontrada. Esta plan não constrói nada novo — ela LIGA o que existe.

PASSO 1 — O TESTE DE INTEGRAÇÃO QUE FALHA HOJE. Escreva ANTES de consertar.
  Provider com `initialTheme` (NÃO `activeThemeId` — é o caminho que a
  09-temas-e-presets §4.3 RECOMENDA e é o que o ERP usa), tema com contraparte
  autorada, trocar de modo.
  ⇒ HOJE cai em `syncThemeWithMode` porque `activeThemeId` é undefined.
    VEJA O VERMELHO e cole a saída. Sem isso não há prova de conserto.
  ⚠️ Foi exatamente este teste que faltou na plan-26: o revisor verificou a
    FUNÇÃO `resolveThemeForMode` e não verificou se a BUSCA pela contraparte
    encontra algo. Verificou a unidade, não o efeito.

PASSO 2 — `resolvedThemeId` no contexto: o tema EFETIVAMENTE no ar.
  Atualiza em: semente (`activeThemeId || initialTheme` — a lógica já existe em
  useDesignManager:50), mudança da prop, E aplicação de preset pelo painel.
  ⚠️ Trocar de MODO não altera: é o mesmo tema noutro modo.
  ⚠️ ADITIVO. NÃO renomeie nem mude a semântica de `activeThemeId`/
    `initialTheme` — são contrato público (R33).

PASSO 3 — o token `mode` passa pelo resolvedor.
  `useDesignDraft.ts:112` tem hoje:
      if (key === 'mode') return { ...current, mode: value };
  Esse `if` é IDÊNTICO ao caminho genérico — existia porque, antes da decisão D,
  quem convertia era o `useDesignVariables` a cada render. Esse "lá embaixo"
  acabou. Passe por `resolveThemeForMode` com o tema de `resolvedThemeId`;
  sem tema rastreável, mantenha o fallback sintetizado sobre o design corrente.

PASSO 4 — `ShellThemeToggle` e `PresetsCatalog` passam a ler `resolvedThemeId`
  em vez da prop crua.

PASSO 5 — O AVISO. Ao trocar de modo, o usuário é informado de que o tema
  RECARREGA e que customizações nos 55 tokens de modo se perdem (decisão do
  dono). Visível NO MOMENTO da troca, não enterrado em texto de ajuda.

PASSO 6 — O INVARIANTE DAS DUAS PORTAS: o toggle do cromo e o seletor "Tema do
  Sistema" do painel produzem design IDÊNTICO para o mesmo tema e mesmo modo
  alvo. Teste isso.

LINHAS VERMELHAS:
  · Você NÃO renomeia nem muda a semântica de activeThemeId/initialTheme.
  · Você NÃO altera resolveThemeForMode, as contrapartes, o gate ou as faixas.
  · Você NÃO preserva customização na troca de modo — é decisão do dono.
  · Você NÃO mexe no ERP.
  · Você NÃO conserta os achados 33, 35, 37, 38 e 39 — têm plan própria.

Os três espelhos: gates/baselines/ · sarak-dev/ · sarak-ui/.

VERIFICAÇÕES, com a saída colada:
  npm run audit           (contraste 0/0 nos dois modos, 23 temas)
  npx vitest run          (INTEIRA)
  npm run gate-limits:check · npm run dev-kit:check · npm run guide:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] 🔴 **O teste de integração pela porta `initialTheme` existe e falhava antes** — com a saída vermelha
      colada. **É o critério que define esta plan**, porque foi exatamente ele que faltou na `plan-26`.
- [ ] `resolvedThemeId` existe, é **aditivo**, e atualiza na semente, na prop **e ao aplicar preset**.
- [ ] Trocar de modo **não** altera `resolvedThemeId`.
- [ ] O token `mode` converte de verdade — e cai no fallback sintetizado só quando não há tema rastreável.
- [ ] **As duas portas produzem design idêntico** (§3.3), demonstrado por teste.
- [ ] O aviso aparece **no momento da troca**.
- [ ] `activeThemeId` e `initialTheme` inalterados em nome e semântica (**R33**).
- [ ] `npx vitest run` verde; contraste **0/0 nos dois modos**; baselines e espelhos regravados.

# 8. Como verificar

```bash
npm run audit
npx vitest run
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

[[09-temas-e-presets]] §4.3 — `resolvedThemeId` ao lado de `activeThemeId`/`initialTheme`, e o registro de
que **a contraparte depende de tema rastreável**: sem isso a lib degrada para a síntese em silêncio.

# 10. Resumo da execução

## Resumo da execução — 2026-08-11

**Resultado:** Concluído.

## PASSO 1 — o teste de integração que falhava, com a saída vermelha

Escrito ANTES de qualquer conserto: `src/core/Provider/__tests__/TemaRastreavel.test.tsx`, renderizando o
Provider REAL (sem mocks, seguindo o padrão de `HostIdentity.test.tsx`) com `initialTheme="terracota-solar"`
(não `activeThemeId`) e um `ShellThemeToggle` real.

```
FAIL  src/core/Provider/__tests__/TemaRastreavel.test.tsx
  trocar de modo pelo ShellThemeToggle aplica a CONTRAPARTE AUTORADA de terracota-solar, não a síntese
Error: expect(element).toHaveTextContent()
Expected: #0e0a06
Received: #362617ff
```

`#362617ff` é o resultado do fallback sintetizado (`syncThemeWithMode`) — a contraparte autorada
(`#0e0a06`) nunca foi encontrada, exatamente o Defeito 2 da plan. Depois do PASSO 4, o mesmo teste fecha
verde com o valor autorado.

## PASSO 2 — `resolvedThemeId`, aditivo

- `useDesignManager.ts`: extraí a lógica de semente (`activeThemeId || initialTheme`, que já existia) para
  `resolveSeedThemeId()` — reusada tanto por `getSeedConfig` (os tokens) quanto para semear
  `resolvedThemeId` (o id), garantindo que os dois nunca divirjam.
- `useResolvedThemeId.ts` (novo hook, extraído de `useDesignManager` para não estourar o teto de estado por
  hook — R9: eram 5 `useState`/`useEffect` juntos, o auditor de clean code acusou): nasce da semente,
  acompanha `activeThemeId` quando a prop CONTROLADA muda de fato, expõe um `setResolvedThemeId` manual.
  4 testes próprios.
- Exposto no contexto (`SarakUIContextType.resolvedThemeId` / `.setResolvedThemeId`) — ambos **opcionais**,
  aditivos; `activeThemeId` continua existindo, inalterado em nome e semântica (R33).
- `PresetsCatalog.tsx` chama `sarak?.setResolvedThemeId?.(theme.id)` ao aplicar um tema pelo painel —
  ponto 3 do PASSO 2 (aplicação de preset).
- Trocar de MODO **nunca** chama `setResolvedThemeId` — nem em `ShellThemeToggle`, nem no handler de
  `mode` do PASSO 3. Confirmado pelo teste do invariante das duas portas (PASSO 6): o mesmo
  `resolvedThemeId` segue valendo para as duas portas antes e depois da troca.

## PASSO 3 — o token `mode` passa pelo resolvedor

`useDesignDraft.ts:112` tinha o `if (key === 'mode') return { ...current, mode: value }` — idêntico ao
caminho genérico, exatamente como a plan descreveu. Reescrito para: achar o tema por
`sarak.resolvedThemeId` em `sarak.allThemes`; se achado, `resolveThemeForMode` (contraparte autorada ou
fallback sintetizado, os 18 legados); sem tema rastreável, `syncThemeWithMode` sobre o **design corrente**
(preserva customizações de tokens não-mode, como antes). Isto RECARREGA o tema quando ele é rastreável
(decisão do dono, §2.5) — testado nos dois ramos (com e sem tema rastreável).

## PASSO 4 — os dois chamadores leem `resolvedThemeId`

- `ShellThemeToggle.tsx`: trocou `activeThemeId` por `resolvedThemeId` na busca em `allThemes` — a
  correção de uma linha que resolve o PASSO 1.
- `PresetsCatalog.tsx`: já usava `resolveThemeForMode(theme, currentMode)` direto sobre o tema clicado (não
  tinha o defeito de busca); ganhou o `setResolvedThemeId` do PASSO 2.

## PASSO 5 — o aviso, no momento da troca

`updateDraft('mode', ...)` dispara `showToast('warning', ...)` (o mesmo mecanismo de toast que
`ThemeFeedbackToast` já renderiza no painel — nenhuma UI nova) **só quando a troca de fato recarrega um
tema rastreável** (não quando cai no fallback sobre o design corrente, que não descarta nada). Mensagem:
*"Tema recarregado para o modo [escuro/claro] — customizações de cor feitas neste tema foram substituídas
pela contraparte autorada."* 2 testes: dispara quando recarrega, não dispara quando não recarrega.

## PASSO 6 — o invariante das duas portas

`src/features/DesignEngine/hooks/__tests__/DuasPortasModoTema.test.tsx` (não em `core/Provider/__tests__/`
— explico na seção de achados): renderiza duas árvores independentes do Provider REAL com
`initialTheme="ardosia-ao-entardecer"` — uma clicando o `ShellThemeToggle` (porta 1, aplica ao SISTEMA),
outra chamando `updateDraft('mode', 'light')` (porta 2, aplica ao DRAFT do painel) — e compara, chave a
chave, todas as chaves que a contraparte declara. As duas convergem exatamente.

## Achados fora do escopo / decisões de execução

- **A localização do teste do PASSO 6 não é a que a plan sugeriria à primeira vista.** `core/` não pode
  importar `features/` (R1) — nem em teste: o `auditor_arquitetura.mjs` não isenta `__tests__/`, e a
  primeira versão do arquivo (em `core/Provider/__tests__/`, importando `useDesignDraft` de `features/`)
  quebrou o auditor. Movido para `src/features/DesignEngine/hooks/__tests__/DuasPortasModoTema.test.tsx`
  (features PODE importar core) — o teste do PASSO 1 (que só usa `core/`) ficou onde estava.
- **2 erros de tipo pré-existentes na minha própria autoria de teste, corrigidos antes de fechar**: (1)
  `renderHook(..., { initialProps: { activeThemeId: undefined } })` — TS infere o campo como literalmente
  `undefined`, não `string | undefined`, quando o valor inicial É `undefined`; corrigido com
  `undefined as string | undefined`. (2) comparação de uma variável `let x: T | null` mutada dentro de um
  componente React fechado (closure) — TS não propaga a mutação para o tipo no escopo externo da mesma
  forma que uma reatribuição direta; corrigido com `as unknown as Record<string, unknown>` (o mesmo padrão
  de duplo-cast já usado em `ShellThemeToggle.tsx` desde a plan-26).
- **`dist/`, `sarak-dev/`, `sarak-ui/`**: `sarak-dev`/`sarak-ui` já estavam em dia (`dev-kit:check`/
  `guide:check` verdes sem regeneração — nada nesta plan mexe em componente, token ou catálogo público).
  `dist/BUILD_INFO.json` **e agora também `dist/index.{js,cjs,d.ts,d.cts}` e os chunks** aparecem
  modificados no `git status` — **não rodei `npm run build`** nesta execução (não é um dos comandos que
  usei). `BUILD_INFO.json` mostra `builtAt: 2026-08-11T21:33:33Z`, várias horas depois de qualquer comando
  meu nesta sessão — mesmo padrão já confirmado pelo revisor na `plan-26` (§11.4: *"é o `npm run build` que
  o dono rodou ao diagnosticar o consumidor"*). Os artefatos mudaram porque meu código-fonte mudou (o build
  reflete as mudanças reais desta plan), mas o comando não foi disparado por mim.

## Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/hooks/useDesignManager.ts` | alterado | `resolveSeedThemeId` extraído; usa `useResolvedThemeId` |
| `src/core/Provider/hooks/useResolvedThemeId.ts` | criado | o hook `resolvedThemeId`/`setResolvedThemeId` |
| `src/core/Provider/hooks/__tests__/useResolvedThemeId.test.ts` | criado | 4 testes |
| `src/core/Provider/types.ts` | alterado | `resolvedThemeId?`, `setResolvedThemeId?` no contexto |
| `src/core/Provider/SarakUIProvider.tsx` | alterado | expõe os dois no `uiContextValue` |
| `src/core/Provider/__tests__/TemaRastreavel.test.tsx` | criado | PASSO 1 — a prova da regressão (RED→GREEN) |
| `src/core/Shell/Components/ShellThemeToggle.tsx` | alterado | busca por `resolvedThemeId`, não `activeThemeId` |
| `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx` | alterado | chama `setResolvedThemeId` ao aplicar |
| `src/features/DesignEngine/hooks/useDesignDraft.ts` | alterado | token `mode` passa por `resolveThemeForMode`/`syncThemeWithMode` + aviso |
| `src/features/DesignEngine/hooks/__tests__/useDesignDraft.test.tsx` | alterado | +4 testes (2 casos do resolvedor + 2 do aviso) |
| `src/features/DesignEngine/hooks/__tests__/DuasPortasModoTema.test.tsx` | criado | PASSO 6 — o invariante das duas portas |

## Verificações executadas

- **PASSO 1 (a prova exigida pela plan)**: saída vermelha colada acima; verde depois do PASSO 4.
- `npm run audit` → `auditor_contraste`: **0/0 nos dois modos, 23 temas**; Exigência de CONTRAPARTE: 18
  isentos, 0 faltando (inalterado — esta plan não mexe em tema nenhum). 2 auditores vermelhos no total
  (`ghostvars`=1, `composicaoatomica`=2) — idênticos ao baseline; **1ª rodada acusou um 3º**
  (`auditor_arquitetura`, o achado do PASSO 6 acima) — corrigido, confirmado de volta a 2.
- `npx vitest run` (suíte INTEIRA, rodada final) → **304 arquivos / 1180 testes, 100% verde** (cresceu de
  301/1170 para 304/1170: +3 arquivos, +10 testes desta plan).
- `npm run gate-limits:check` → **29/29**.
- `npm run dev-kit:check` / `npm run guide:check` → **em dia**, sem regeneração necessária.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → **1ª rodada: REGRESSÃO** —
  `tsc.erros: 0→5` (todos em teste, 2 causas de tipo na minha própria autoria, corrigidas); **2ª rodada
  (final): "igual ao baseline de 2026-08-11 — nenhuma regressão."**
- `git diff --stat` (excluindo `dist/`, externo) → **8 arquivos rastreados alterados** + 4 novos (o plan +
  3 arquivos de teste); nada em `specs/specs/`, `specs/adr/`; `specs/00-indice.md` confirmado pré-existente
  (o revisor registrando a fila antes desta execução).

## Critérios de aceite

- [x] 🔴 O teste de integração pela porta `initialTheme` existe e falhava antes — saída vermelha colada.
- [x] `resolvedThemeId` existe, é aditivo, e atualiza na semente, na prop e ao aplicar preset.
- [x] Trocar de modo não altera `resolvedThemeId` — confirmado pelo teste do invariante das duas portas
      (o mesmo tema segue rastreável nos dois lados, antes e depois da troca).
- [x] O token `mode` converte de verdade — cai no fallback sintetizado só sem tema rastreável (2 testes).
- [x] As duas portas produzem design idêntico (§3.3) — `DuasPortasModoTema.test.tsx`, chave a chave.
- [x] O aviso aparece no momento da troca — via o toast já existente no painel, só quando recarrega.
- [x] `activeThemeId` e `initialTheme` inalterados em nome e semântica (R33) — `resolvedThemeId` é aditivo,
      nenhuma prop existente mudou de tipo ou comportamento.
- [x] `npx vitest run` verde (304/304, 1180/1180); contraste 0/0 nos dois modos; baselines/espelhos
      regravados (nenhuma regeneração necessária desta vez — `sarak-dev`/`sarak-ui` já em dia).

## Decisões e suposições

- **`resolveThemeForMode` no handler de `mode` RECARREGA o design inteiro** (não faz merge parcial dos 55
  tokens) quando há tema rastreável — a mesma semântica que `ShellThemeToggle` já usava desde a plan-26
  (`applyFullConfigRaw` substitui o design inteiro). Interpretei a frase da §2.5 ("sobrescreve os 55 tokens
  que carregam modo") como descrevendo QUAIS tokens mudam de valor visível (só eles diferem entre native e
  contraparte), não como uma exigência de merge cirúrgico só nesses 55 — um merge parcial contradiria "É
  inerente: a contraparte é um conjunto de valores fixos" e quebraria o invariante das duas portas (que
  exige as DUAS produzirem o MESMO resultado, e o toggle já fazia reload completo).
- **O aviso só dispara quando há reload de fato** (tema rastreável E o modo realmente muda) — não a cada
  clique no seletor, e não no caminho de fallback (que preserva customizações, não há o que avisar).
- **Local do teste do PASSO 6** — movido de `core/` para `features/` por causa de R1, documentado acima.

## Pendências / riscos

- Nenhuma pendência técnica.
- `dist/` mudou por processo externo (ver "Achados fora do escopo" acima) — não é build meu, mas reflete
  fielmente o código-fonte desta entrega.

# 11. Veredito

**🟢 APROVADA** — *revisor, 2026-08-11.* Sem pendências.

## 11.1 O critério que definia a plan — cumprido, e do jeito certo

`src/core/Provider/__tests__/TemaRastreavel.test.tsx` monta um **`SarakUIProvider` real** com
`initialTheme="terracota-solar"`, clica no **toggle real**, e afirma o valor **autorado**:

```
antes do clique :  mode=light  colorBgBody=#f9f5f1   (o design nativo)
depois do clique:  mode=dark   colorBgBody=#0e0a06   (a CONTRAPARTE, não a síntese)
```

É integração **pela porta que a documentação recomenda**, não unidade. O executor confirmou o vermelho antes:
caía em `#362617ff` — saída de faixa — porque `activeThemeId` é sempre `undefined` para quem usa
`initialTheme`. **É exatamente o teste que faltou na `plan-26`** (§2.4).

## 11.2 A cadeia, conferida ponta a ponta

| Peça | Estado |
|---|---|
| `useResolvedThemeId` | nasce da semente, acompanha a prop controlada; **troca de modo não passa por ele** |
| `PresetsCatalog:99` | anuncia `setResolvedThemeId(theme.id)` **antes** de aplicar |
| `ShellThemeToggle:37` | lê `resolvedThemeId`, não a prop crua |
| `useDesignDraft:117` | o token `mode` resolve pela contraparte; fallback sintetizado só sem tema rastreável |
| `types.ts:216-217` | ambos **opcionais** — aditivo; `activeThemeId`/`initialTheme` intocados (**R33**) |
| Aviso | dispara só quando **de fato** recarrega (`isReload`), não a cada mexida no seletor |

## 11.3 Medições

| Verificado | Resultado |
|---|---|
| Gate | **0/0 nos dois modos**, 23 temas · 5 com contraparte · **0 faltando** |
| Suíte | **304/304 arquivos · 1180/1180 testes**, exit 0 |
| Baseline | `check-audit-baseline --with-tsc` sem regressão · `gate-limits` **29/29** |
| Invariante das duas portas | testado, design **idêntico chave a chave** |
| `dist/` | rebuild do **dono** (`builtAt` 21:33 sobre `cc3a6f0`, a `plan-26` commitada); 9 apagados / 9 novos — coerente |

## 11.4 O achado de execução estava certo

Mover o teste das duas portas para `features/` **não é contorno**: `core/` importar `features/` violaria a
**R1**, e o teste precisa do `useDesignDraft`, que mora em `features/`. Leu a fronteira em vez de furá-la.

## 11.5 A lição que fica para o revisor

A `plan-26` foi aprovada com `resolveThemeForMode` correto, quatro chamadores ligados, ida e volta exata e
contrapartes provadamente autoradas — **e nada disso funcionava no consumidor real**, porque ninguém
verificou se a *busca* encontrava alguma coisa.

**Componente correto não é sistema correto.** Toda plan que entrega um mecanismo novo precisa de ao menos um
aceite que o exercite **pela porta que a documentação recomenda ao importador** — não pela porta mais
conveniente de testar.
