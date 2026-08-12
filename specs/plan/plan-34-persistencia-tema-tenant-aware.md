---
tipo: "plan"
titulo: "Implementar persistência de tema tenant-aware e strategy configurável"
dominio: "Sarak-Lib-UI-Core / Design Engine / Persistência"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "persistencia", "temas", "multi-tenant", "adr-009"]
relacionados: ["[[009-persistencia-tenant-aware]]", "[[09-temas-e-presets]]", "[[02-design-engine]]", "[[003-remocao-backend-proprio]]"]
depende_de: ""
destino_sintese: "specs/specs/09-temas-e-presets.md · specs/arquitetura/02-design-engine.md · docs/migracoes.md"
objetivo: "Um app multi-tenant na mesma origem não tem mais vazamento de tema entre tenants, e um consumidor com backend próprio pode fazê-lo vencer sobre o cache local"
---

# 1. Objetivo

Dois tenants de um mesmo consumidor, rodando na mesma origem, deixam de compartilhar tema por acidente — e um
consumidor que já tem backend próprio consegue declará-lo como fonte de verdade sem o `localStorage`
sobrescrever o que ele carregou.

# 2. Contexto

**Decisão já tomada em [[009-persistencia-tenant-aware]]** — leia-a inteira antes de começar; ela é o
contrato que esta plan implementa, não uma sugestão.

Resumo do que a investigação mediu (`arquivo:linha`, não refaça a leitura):

- `localStorage` é escrito de forma incondicional em `src/core/Provider/hooks/useDesignManager.ts:107`
  (`persistDesign`), lido no boot em `:76-88`, e lido de novo como fallback em
  `src/core/Provider/hooks/useDesignSync.ts:56-65`. Nenhum dos três pontos checa `strategy`.
- `src/core/Provider/types.ts:154-167` já declara `persistence.strategy?: 'local'|'remote'|'hybrid'` — campo
  **morto**, nunca lido.
- `src/core/Provider/constants.ts:1` — `DEFAULT_STORAGE_KEY = 'sarak-ui-design-v9.0'`, fixa, sem tenant.
- `src/core/Provider/hooks/useDesignStorageSync.ts:29-76` implementa `crossTabSync`; o filtro (`:50-51`) é só
  `event.key !== storageKey` — herda isolamento automaticamente de qualquer chave nova que passe a incluir o
  tenant, **sem precisar mudar a lógica do hook**.
- `src/core/Provider/hooks/useDesignRemoteLoader.ts:22-38` chama `onLoad` (quando existe) num `useEffect`
  assíncrono e funde por cima do design corrente (`:32`, `{ ...prev, ...custom }`) — hoje `onLoad` já "vence"
  por rodar depois, mas isso é acidente de ordem de execução, não contrato formal.
- Ordem de resolução hoje, medida: `onLoad` (assíncrono, quando existe) > `localStorage` (síncrono no boot) >
  seed (`activeThemeId`/`initialTheme`/`initialConfig`).

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/types.ts` — adicionar `tenantId?: string` a `SarakUIProviderOptions['persistence']`;
  tornar `strategy` de fato documentado como funcional (o campo já existe, só o comentário/JSDoc precisa
  refletir o comportamento novo).
- `src/core/Provider/hooks/useDesignManager.ts` — função auxiliar que resolve a chave efetiva
  (`storageKey` + `tenantId`, ver [[009-persistencia-tenant-aware]] §2.1); leitura no boot (`:76-88`) e
  `persistDesign` (`:103-115`) passam a respeitar `strategy` (ver §2.2 do ADR).
- `src/core/Provider/hooks/useDesignSync.ts` — o fallback de leitura (`:56-65`) usa a mesma chave efetiva.
- `src/core/Provider/hooks/useDesignStorageSync.ts` — usa a mesma chave efetiva no filtro do evento
  `storage`; **não precisa mudar a lógica de isolamento em si**, só passar a chave certa.
- `src/core/Provider/hooks/useDesignRemoteLoader.ts` — formalizar que, com `strategy: 'remote'`, o resultado
  de `onLoad` vence sobre o que veio de `localStorage`; emitir o `console.warn` único quando `strategy` for
  `'remote'` sem `onSave`/`onLoad` configurado, e degradar para o comportamento de `'local'` nesse caso.
- Testes em `__tests__/` ao lado de cada arquivo tocado (R8) — inclusive um teste que **simula dois
  `tenantId` diferentes na mesma `storageKey`** e prova que não há vazamento entre eles, e um teste por valor
  de `strategy`.
- `docs/migracoes.md` — entrada nova, é MAJOR (ver [[009-persistencia-tenant-aware]] §3).

## 3.2 Fora
- ⛔ **Qualquer backend embarcado na lib.** Nenhum endpoint, nenhum driver, nenhum `fetch` da lib para
  servidor. [[003-remocao-backend-proprio]] continua valendo por inteiro.
- ⛔ `src/features/DesignEngine/` — o painel de customização é escopo das plans 35/36/37. Esta plan toca só
  `src/core/Provider/`.
- ⛔ Mudar o schema de tokens ou o Design Engine (`src/core/Design/`).
- ⛔ Rodar `npm version` ou empurrar qualquer coisa.
- ⛔ Validar `tenantId` contra alguma lista — é um valor opaco que o consumidor fornece; a lib não conhece o
  conceito de tenant, só compõe a chave.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| ADR | `specs/adr/009-persistencia-tenant-aware.md` | o contrato exato que esta plan implementa — **não reabra a decisão** |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.4 | o ciclo de vida de persistência atual, que esta plan estende |
| Spec fixa | `specs/arquitetura/02-design-engine.md` §8 | o pipeline de persistência sem backend |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` §3 | por que isto é MAJOR e o formato de `docs/migracoes.md` |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 · R32 | teste ao lado de todo arquivo; a lib continua indiferente a auth/backend |
| **Skill** | `padrao-escrita` · `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | todo conserto muda comportamento e leva teste |
| Código | os 5 arquivos de `src/core/Provider/hooks/` listados na §3.1 | ler antes de editar |

# 5. Instruções de execução

1. **Estender o tipo** (`types.ts`) com `tenantId?: string`, e atualizar o JSDoc de `strategy` para descrever
   os três valores exatamente como o ADR §2.2 define. **Pronto quando** o tipo compila e o JSDoc bate com o
   ADR.
2. **Criar a função de resolução de chave** (nome à sua escolha, ex. `resolveStorageKey(persistence)`) que
   devolve `storageKey` cru sem `tenantId`, ou `` `${storageKey}::tenant:${tenantId}` `` com ele. Usá-la nos
   três pontos de leitura/escrita (`useDesignManager.ts:76-88,103-115`, `useDesignSync.ts:56-65`,
   `useDesignStorageSync.ts` no filtro do evento). **Pronto quando** os três consumirem a mesma função — nunca
   compondo a chave duas vezes de formas diferentes.
3. **Implementar `strategy` em `persistDesign`**: `'local'` e `'hybrid'` gravam `localStorage` como hoje;
   `'remote'` não grava — só chama `onSave`. **Pronto quando** um teste prova que `strategy: 'remote'` não
   deixa rastro em `localStorage.setItem` (spy) e chama `onSave`.
4. **Implementar `strategy` na leitura do boot**: `'remote'` lê `localStorage` uma vez (fallback síncrono
   contra flash), mas o valor é descartado assim que `onLoad` resolver — não há merge "por cima", é
   substituição. **Pronto quando** um teste prova que, com `strategy: 'remote'` e `onLoad` resolvendo um
   design diferente do que estava em `localStorage`, o design final é o de `onLoad`.
5. **O aviso de `'remote'` sem porta configurada**: se `strategy === 'remote'` e nem `onSave` nem `onLoad`
   estiverem definidos, emitir `console.warn` uma única vez (mesma disciplina de "warn, nunca lança" da
   [[04-contrato-de-tokens-e-paridade]] §4.5) e tratar como `'local'` daquele ponto em diante. **Pronto
   quando** existir teste cobrindo esse caso e confirmando que o tema **não** se perde.
6. **Teste de isolamento entre tenants**: simular `localStorage` (jsdom já faz isso na suíte), montar duas
   instâncias de `useDesignManager`/Provider com `tenantId` diferentes e a mesma `storageKey`, e provar que
   escrever num não é lido no outro — nem via leitura direta, nem via o mecanismo de `crossTabSync`.
7. **`docs/migracoes.md`** — nova entrada seguindo o formato de [[03-versionamento-e-release]] §5: o que
   mudou (tabela antes×depois), por quê, como migrar (nada a fazer se não usar `tenantId`/`strategy`), o que
   NÃO mudou (comportamento default é idêntico).
8. **Fechar.** Rodar, nesta ordem, e colar a saída real no resumo: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` ·
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` ·
   `npm run dev-kit:check` · `git diff --stat`. **Declare toda métrica de baseline que se moveu.**

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-34-persistencia-tema-tenant-aware.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/adr/009-persistencia-tenant-aware.md (O CONTRATO — não o reabra),
specs/specs/09-temas-e-presets.md §4, specs/specs/03-versionamento-e-release.md §3 e §5,
specs/specs/00-regras-e-invariantes.md R8 e R32.
Skills a aplicar: padrao-escrita, padrao-typescript, test-unitario.

O CONTRATO JÁ FOI DECIDIDO no ADR-009. Você implementa exatamente os três valores de
strategy ('hybrid' default = comportamento atual, 'local' = ignora onSave/onLoad,
'remote' = onLoad vence e localStorage para de ser escrito) e o tenantId compondo a
chave. Não invente uma quarta opção nem mude o default.

LINHAS VERMELHAS:
  · Você NÃO cria backend, endpoint, fetch para servidor da lib. Zero.
  · Você NÃO toca em src/features/DesignEngine/ — é escopo de outra plan.
  · Você NÃO valida tenantId contra nada — é valor opaco do consumidor.
  · Você NÃO muda o default de 'strategy' — tem que ser 'hybrid', retrocompatível.

Todo conserto leva teste ao lado (R8), incluindo o teste de isolamento entre dois
tenantId na mesma storageKey.

docs/migracoes.md precisa de entrada nova — é MAJOR.

Não commite. Ao terminar, escreva o resumo na própria plan, declarando cada baseline que
se moveu, e mova o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] `persistence.tenantId` existe no tipo e compõe a chave efetiva nos três pontos de leitura/escrita e no
      filtro de `crossTabSync` — todos via **uma** função compartilhada.
- [ ] `strategy: 'hybrid'` (default) reproduz **byte a byte** o comportamento de antes desta plan — provado
      por teste que não muda de veredito.
- [ ] `strategy: 'local'` ignora `onSave`/`onLoad` mesmo se fornecidos.
- [ ] `strategy: 'remote'` não escreve em `localStorage`; `onLoad`, quando resolve, **substitui** (não funde)
      o que veio do fallback síncrono.
- [ ] `strategy: 'remote'` sem `onSave`/`onLoad` emite um warn único e degrada para `'local'` sem perder tema.
- [ ] Teste de isolamento entre dois `tenantId` na mesma `storageKey` — evidência no resumo.
- [ ] `docs/migracoes.md` tem entrada nova, formato antes×depois×por quê×como migrar×o que não mudou.
- [ ] `npx vitest run` inteira, verde, e não encolheu.
- [ ] `run_audit` sem regressão contra o baseline; `npx tsc --noEmit` → 0 erros.
- [ ] **Nenhum arquivo de `specs/` no diff**, exceto `docs/migracoes.md` (que não é `specs/`).

# 8. Como verificar (uso do revisor)

```bash
git diff --stat                          # só os arquivos de §3.1
git diff                                 # ler INTEIRO
grep -n "tenantId" src/core/Provider/types.ts
npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
npm run dev-kit:check
git diff docs/migracoes.md
```

**O que reprova, além do óbvio:**
- `strategy: 'hybrid'` que se comporta diferente do `localStorage` atual em qualquer caso não coberto por
  teste — peça reprodução manual do cenário antes de aceitar a alegação de retrocompatibilidade;
- `tenantId` sendo tratado como algo que a lib valida ou interpreta além de compor a chave;
- warn de `'remote'` sem porta configurada disparando mais de uma vez por sessão (vira ruído — mesma lição do
  aviso de atualização em [[13-instalacao-e-atualizacao]] §5.1).

# 9. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` · `specs/arquitetura/02-design-engine.md` · `docs/migracoes.md`

**Texto pronto para transporte, na síntese:**

- `09-temas-e-presets.md` §4.4 (Persistir) ganha os três valores de `strategy` e o `tenantId`, com a mesma
  tabela do ADR §2.2 — a spec de temas descreve o *contrato do dado*, e isto é parte dele.
- `02-design-engine.md` §8 (Persistência, sem backend) ganha a chave efetiva composta e a nova ordem de
  resolução quando `strategy: 'remote'` está em uso.
- `docs/migracoes.md` já é escrito diretamente pelo executor (não é síntese futura — é entrega desta plan).

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

**O que foi feito**
- `src/core/Provider/types.ts:154-164` — `persistence.tenantId?: string` adicionado; JSDoc de `strategy`
  reescrito para descrever os três valores do ADR-009 §2.2 (compactado para caber no teto de 250 linhas
  do arquivo — ver "Decisões e suposições").
- `src/core/Provider/utils/resolveStorageKey.ts` (novo) — `resolveStorageKey(persistence)`, a função
  única que compõe `storageKey` cru ou `` `${storageKey}::tenant:${tenantId}` `` (ADR-009 §2.1).
- `src/core/Provider/utils/persistenceStrategy.ts` (novo) — `resolveEffectiveStrategy(persistence)`:
  resolve `strategy` (default `'hybrid'`) e degrada `'remote'` sem `onSave`/`onLoad` para `'local'`, com
  `console.warn` único por sessão (flag de módulo, não por instância de Provider).
- `src/core/Provider/hooks/useDesignManager.ts` — o `useMemo` de `storageKey` (`:80-83`) foi movido para
  ANTES do `useState` de `design` e passou a chamar `resolveStorageKey`, para que a leitura síncrona do
  boot (`:85-96`) consuma a MESMA chave já resolvida, sem compô-la de novo. `persistDesign` (`:110-125`)
  passou a checar `resolveEffectiveStrategy`: `strategy !== 'remote'` grava `localStorage`;
  `strategy !== 'local'` chama `onSave` — as três combinações (`hybrid`/`local`/`remote`) descritas no
  ADR. `useDesignRemoteLoader` passou a receber `getSeedConfig` (`:99`) para o caso `'remote'`.
- `src/core/Provider/hooks/useDesignRemoteLoader.ts` — `strategy === 'local'` agora pula `onLoad`
  inteiramente (`:29`); `strategy === 'remote'` substitui o design pela semente + `onLoad`
  (`{ ...getSeedConfig(), ...custom }`) em vez de fundir sobre `prev` (`:44-46`) — as demais estratégias
  mantiveram a fusão `{ ...prev, ...custom }` de antes, byte a byte.
- `useDesignSync.ts` e `useDesignStorageSync.ts` **não foram alterados** — ambos já recebem `storageKey`
  como parâmetro do chamador; ao passar a receber a chave já composta por tenant de
  `useDesignManager`, o isolamento chega neles automaticamente (confirmado pelo teste de isolamento
  abaixo), exatamente como a plan previu no passo 2.
- `docs/migracoes.md` — nova entrada no topo ("Persistência de tema tenant-aware e `strategy` funcional
  (ADR-009)"), formato antes×depois×por quê×como migrar×o que não mudou.
- `sarak-dev/{state.json,GUIA-MANUTENCAO.md,START-HERE.md}` — regenerados via `npm run dev-kit` (kit do
  mantenedor; ficou defasado pela contagem de testes nova, exigido pelo próprio `dev-kit:check`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/types.ts` | alterado | `persistence.tenantId` novo; JSDoc de `strategy` funcional |
| `src/core/Provider/utils/resolveStorageKey.ts` | criado | chave efetiva única (ADR-009 §2.1) |
| `src/core/Provider/utils/__tests__/resolveStorageKey.test.ts` | criado | 6 casos, inclusive dois tenants ≠ chaves |
| `src/core/Provider/utils/persistenceStrategy.ts` | criado | `strategy` efetivo + degrade + warn único |
| `src/core/Provider/utils/__tests__/persistenceStrategy.test.ts` | criado | 4 casos, inclusive warn único por sessão |
| `src/core/Provider/hooks/useDesignManager.ts` | alterado | chave efetiva 1x; `persistDesign` respeita `strategy` |
| `src/core/Provider/hooks/__tests__/useDesignManager.test.ts` | alterado | substituído o stub por 6 testes comportamentais |
| `src/core/Provider/hooks/useDesignRemoteLoader.ts` | alterado | `strategy` decide pular `onLoad` ou substituir |
| `src/core/Provider/hooks/__tests__/useDesignRemoteLoader.test.ts` | alterado | substituído o stub por 5 testes comportamentais |
| `docs/migracoes.md` | alterado | entrada nova (MAJOR) |
| `sarak-dev/state.json` | regenerado | contagem de testes/gates atualizada |
| `sarak-dev/GUIA-MANUTENCAO.md` | regenerado | idem |
| `sarak-dev/START-HERE.md` | regenerado | idem |

**Verificações executadas**
- `npx vitest run` (suíte INTEIRA) → **308 arquivos / 1206 testes, 100% verde** (dois arquivos de teste
  novos: `resolveStorageKey.test.ts`, `persistenceStrategy.test.ts`; dois stubs viraram testes reais).
- `node gates/scripts/audit/run_audit.mjs` → **2 violações de R10** (`SarakMultiSelect.tsx:113`,
  `SarakUploader.tsx:111`) — pré-existentes, nenhum arquivo tocado por esta plan; confirmado sem
  regressão pelo passo seguinte.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `[audit:baseline] igual ao baseline
  de 2026-08-11 — nenhuma regressão.`
- `npx tsc --noEmit` → 0 erros.
- `npm run dev-kit:check` → `kit em dia (3 arquivos, 0 ponteiros mortos)` — ficou defasado após os testes
  novos, corrigido rodando `npm run dev-kit` (gerador, não edição à mão).
- `git diff --stat` — só os arquivos de `src/core/Provider/` + `docs/migracoes.md` + `sarak-dev/`
  (gerado); nenhum arquivo de `specs/` no diff desta execução.

**Baseline que se moveu:** nenhum. `check-audit-baseline.mjs` confirmou "igual ao baseline de
2026-08-11" — os 2 achados de R10 já estavam no baseline antes desta plan; nenhuma métrica de
`gates/baselines/audit-baseline.json` foi regravada por esta execução.

**Critérios de aceite**
- [x] `persistence.tenantId` existe e compõe a chave efetiva nos três pontos, via **uma** função
      compartilhada — evidência: `resolveStorageKey.ts`, consumido em `useDesignManager.ts:81` (o único
      ponto de chamada; `useDesignSync`/`useDesignStorageSync` recebem a chave já resolvida por
      parâmetro, nunca recompondo).
- [x] `strategy: 'hybrid'` reproduz o comportamento de antes, byte a byte — evidência: teste
      `useDesignManager.test.ts` ("strategy 'hybrid' (default) grava localStorage E chama onSave —
      mesmo comportamento de antes desta plan, byte a byte") e teste de fusão em
      `useDesignRemoteLoader.test.ts` ("strategy 'hybrid' FUNDE... comportamento de antes desta plan").
- [x] `strategy: 'local'` ignora `onSave`/`onLoad` mesmo fornecidos — evidência: dois testes dedicados
      (escrita em `useDesignManager.test.ts`, leitura em `useDesignRemoteLoader.test.ts`).
- [x] `strategy: 'remote'` não escreve `localStorage`; `onLoad` substitui, não funde — evidência: teste
      "strategy 'remote' com onSave configurado NÃO grava localStorage" e teste "strategy 'remote'
      SUBSTITUI o design pela semente + onLoad — não funde com o que veio do fallback de localStorage".
- [x] `strategy: 'remote'` sem porta degrada para `'local'` com warn único — evidência:
      `persistenceStrategy.test.ts` ("degrada para `local` e avisa uma única vez por sessão") +
      `useDesignManager.test.ts` ("degrada para 'local' — grava localStorage e não perde o tema").
- [x] Teste de isolamento entre dois `tenantId` na mesma `storageKey` — evidência:
      `useDesignManager.test.ts` ("duas instâncias com tenantId diferentes e a MESMA storageKey não
      vazam entre si — nem por leitura direta, nem por crossTabSync"): confirma chaves de `localStorage`
      distintas E que um evento `storage` disparado sob a chave de um tenant não altera o design do outro.
- [x] `docs/migracoes.md` tem entrada nova no formato antes×depois×por quê×como migrar×o que não mudou.
- [x] `npx vitest run` inteira, verde, e não encolheu (306→308 arquivos, cresceu).
- [x] `run_audit` sem regressão contra o baseline; `npx tsc --noEmit` → 0 erros.
- [x] Nenhum arquivo de `specs/` no diff desta execução, exceto `docs/migracoes.md`.

**Decisões e suposições**
- **`types.ts` já estava exatamente no teto de 250 linhas (R9) antes desta plan.** A primeira versão do
  JSDoc de `strategy` (transcrevendo o ADR quase por inteiro) levou o arquivo a 274 linhas e reprovou
  `auditor_cleancode`. Compactei o JSDoc de `strategy`/`tenantId` para uma linha cada e, para abrir
  margem sem perder informação, também compactei o JSDoc pré-existente de `crossTabSync` (era um bloco
  de 4 linhas de prosa; virou uma linha equivalente). Resultado: 247 linhas, e o conteúdo de
  `crossTabSync` não perdeu nenhuma informação, só a formatação multi-linha. Não é um achado fora do
  escopo — é o mesmo objeto literal (`persistence`) que a plan já mandava editar — mas registro a decisão
  porque toca uma linha que o passo 1 não citava explicitamente.
- **A chave efetiva é calculada uma única vez** (`useDesignManager.ts`, o `useMemo` de `storageKey`,
  reordenado para ANTES do `useState` de `design`) e todo o resto do hook — inclusive a leitura síncrona
  do boot — consome esse valor por clausura, nunca chamando `resolveStorageKey` uma segunda vez com
  composição diferente. Interpretação do critério "nunca compondo a chave duas vezes de formas
  diferentes" (§5.2 da plan).
- **O aviso único de `'remote'` sem porta é por flag de MÓDULO**, não por instância de Provider ou por
  `useRef` — dois Providers `'remote'` sem porta no mesmo processo avisam juntos uma vez, não duas,
  seguindo a mesma disciplina citada em §8 da plan ("nunca mais de uma vez por sessão").
- **`onThemeChange` (prop de topo, distinta de `persistence.onSave`/`onLoad`) permanece incondicional**
  em `persistDesign` — o ADR-009 e a plan só falam de `onSave`/`onLoad`; `onThemeChange` já era uma porta
  separada antes desta plan e não foi tocada.

**Achados fora do escopo (não corrigidos)**
- Nenhum achado novo. Os 2 achados de R10 (`SarakMultiSelect.tsx:113`, `SarakUploader.tsx:111`) já
  estavam documentados como dívida aceita em `specs/specs/00-regras-e-invariantes.md` antes desta plan;
  não foram tocados.

**Pendências / riscos**
- Nenhuma. Todos os critérios de aceite da §7 têm evidência; nenhum gate ficou vermelho; nenhuma métrica
  de baseline se moveu.

## Resumo da execução (correção 1) — 2026-08-12

**Resultado:** Concluído

**Escopo desta rodada:** exclusivamente o achado único do veredito de 2026-08-12
(`useDesignRemoteLoader.ts:55` — `getSeedConfig` instável no array de dependências). Nenhum dos 6
critérios já aprovados foi tocado; `SarakUIProvider.tsx` e a definição de `getSeedConfig` em
`useDesignManager.ts:59-69` não foram tocados, conforme a linha vermelha do prompt de correção.

**O que foi feito**
- `src/core/Provider/hooks/useDesignRemoteLoader.ts:26-29` — novo `getSeedConfigRef = useRef(getSeedConfig)`
  com `getSeedConfigRef.current = getSeedConfig` a cada render (o mesmo idioma de `optionsRef` no arquivo
  vizinho `useDesignManager.ts:32-35`, só que criado e mantido **dentro do próprio consumidor**, sem
  precisar editar `useDesignManager.ts`).
- `:50` — a branch `'remote'` passou a ler `getSeedConfigRef.current()` no momento em que `onLoad`
  resolve, em vez de `getSeedConfig()` fechado sobre a chamada do efeito.
- `:62` — `getSeedConfig` saiu do array de dependências do `useEffect`; as 5 dependências restantes
  (`isHydrated`, `isBackendLoaded`, `optionsRef`, `setDesign`, `setIsBackendLoaded`) voltam a ser todas
  estáveis, como eram antes desta plan.
- `src/core/Provider/hooks/__tests__/useDesignRemoteLoader.test.ts` — novo teste
  ("`getSeedConfig` instável entre renders... NÃO chama onLoad mais de uma vez"): `rerender()` três vezes
  com uma nova função `getSeedConfig` a cada vez, mantendo `isBackendLoaded=false` (a janela do bug), e
  afirma `onLoad` chamado exatamente 1 vez.

**Prova de que o teste pega o defeito (não só passa no fix):** apliquei o teste novo contra o código de
`useDesignRemoteLoader.ts` **sem** o conserto (voltando `getSeedConfig()` direto e `getSeedConfig` no
array de dependências) — o teste **reprovou**, com `onLoad` chamado **4 vezes** em vez de 1
(`AssertionError: expected "vi.fn()" to be called 1 times, but got 4 times`). Restaurado o conserto, o
mesmo teste volta a passar.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/hooks/useDesignRemoteLoader.ts` | alterado | `getSeedConfig` passa por ref; saiu do array de dependências do efeito |
| `src/core/Provider/hooks/__tests__/useDesignRemoteLoader.test.ts` | alterado | +1 teste de regressão (`getSeedConfig` instável → `onLoad` 1x) |

Nenhum outro arquivo do diff mudou nesta rodada — `types.ts`, `useDesignManager.ts`,
`useDesignManager.test.ts`, os dois utils novos e `docs/migracoes.md` permanecem exatamente como na
entrega anterior (conferido por `git diff --stat`, abaixo).

**Verificações executadas**
- `npx vitest run` (suíte INTEIRA) → **308 arquivos / 1207 testes, 100% verde** (1206 + o teste de
  regressão novo).
- `node gates/scripts/audit/run_audit.mjs` → **2 violações de R10** (`SarakMultiSelect.tsx:113`,
  `SarakUploader.tsx:111`) — as mesmas duas de antes, pré-existentes, nenhum arquivo tocado por esta
  correção.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `[audit:baseline] igual ao baseline
  de 2026-08-11 — nenhuma regressão.`
- `npx tsc --noEmit` → 0 erros (exit 0).
- `npm run dev-kit:check` → `kit em dia (3 arquivos, 0 ponteiros mortos)` — não precisou regenerar
  (a contagem de testes já estava refletida pela regeneração da entrega anterior).
- `git diff --stat -- src docs sarak-dev`:
  ```
  docs/migracoes.md                                  |  58 ++
  sarak-dev/GUIA-MANUTENCAO.md                       |   4 +-
  sarak-dev/START-HERE.md                            |   4 +-
  sarak-dev/state.json                               |   6 +-
  .../hooks/__tests__/useDesignManager.test.ts       | 118 +++++++++++++++++++--
  .../hooks/__tests__/useDesignRemoteLoader.test.ts  | 117 ++++++++++++++++++--
  src/core/Provider/hooks/useDesignManager.ts        |  34 +++---
  src/core/Provider/hooks/useDesignRemoteLoader.ts   |  31 ++++--
  src/core/Provider/types.ts                         |  10 +-
  9 files changed, 340 insertions(+), 42 deletions(-)
  ```
  Mesmos 9 arquivos da entrega anterior — só `useDesignRemoteLoader.ts` (24→31 linhas de diff) e seu
  teste (94→117) cresceram; o resto é idêntico byte a byte ao que já estava aprovado.

**Critérios de aceite**
- [x] Achado único do veredito corrigido — evidência: `useDesignRemoteLoader.ts:26-29,50,62` + teste de
      regressão que reprova sem o conserto e passa com ele (reproduzido nesta rodada).
- [x] Os 6 critérios já aprovados permanecem intactos — evidência: nenhum outro arquivo no diff mudou;
      `strategy: 'remote'` continua substituindo (não fundindo), sem alteração de comportamento.
- [x] `SarakUIProvider.tsx` e `useDesignManager.ts:59-69` (`getSeedConfig` em si) não tocados — evidência:
      ausentes do `git diff --stat` desta rodada.

**Decisões e suposições**
- O prompt de correção citava o idioma "por ref" já usado em `useDesignManager.ts:32-35`
  (`optionsRef`/`configRef`/`onThemeChangeRef`) como referência de estilo, não como instrução de criar o
  ref *naquele* arquivo. Optei por criar `getSeedConfigRef` **dentro de `useDesignRemoteLoader.ts`**
  (o consumidor da função), não em `useDesignManager.ts` — assim a linha vermelha "não toca em
  `useDesignManager.ts:69`" fica inequívoca: nem essa linha nem nenhuma outra de `useDesignManager.ts`
  entrou no diff desta correção.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- Nenhuma.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🔴 Reprovado

**Um achado, e o resto da entrega é bom.** Rodei tudo, li o diff inteiro e reproduzi cada alegação. O
contrato do ADR-009 está implementado com precisão; o que reprova é um efeito colateral **fora do contrato**,
na classe de defeito que [[02-design-engine]] §3.1 existe para impedir.

### O que verifiquei, e como

| Verificação | Saída real |
|---|---|
| Escopo | `git diff --stat` → os arquivos da §3.1 + os 2 utils novos + `sarak-dev/` (justificado, ver abaixo). **Nada de `specs/` além desta plan** |
| Diff lido **integralmente** | `types.ts`, `useDesignManager.ts`, `useDesignRemoteLoader.ts`, os 2 utils e os 4 testes. Toda alteração corresponde a um item declarado |
| Suíte | `npx vitest run` → **308 arquivos / 1206 testes, 100% verde** (147,7 s). Baseline era 306/1187 — **cresceu** |
| `run_audit` | 2 auditores vermelhos — **os mesmos dois**. Nenhuma métrica se moveu |
| `check-audit-baseline --with-tsc` | `igual ao baseline de 2026-08-11 — nenhuma regressão` |
| `npx tsc --noEmit` | **0**, exit 0 |
| `dev-kit:check` | **verde** — e era vermelho antes (resíduo meu, ver abaixo) |
| R9 (250 linhas) | `types.ts` **247** · `useDesignManager.ts` 161 · `useDesignRemoteLoader.ts` 56 · utils 15 e 28. Nenhum estourou |

### Os critérios de aceite, um a um

✅ **`tenantId` compõe a chave por UMA função compartilhada.** `resolveStorageKey` é chamada num ponto só
(`useDesignManager:78-81`), e `useDesignSync`/`useDesignStorageSync` **recebem** a chave já resolvida. A
decisão de **não editar os dois hooks** está certa e é melhor que o que a plan pedia: uma fonte, não três
chamadas coordenadas.

✅ **`strategy` implementado exatamente como o ADR §2.2 define.** Conferido linha a linha em `persistDesign`:
`!== 'remote'` grava local · `!== 'local' && onSave` chama a porta. Os três valores batem.

✅ **`'remote'` substitui, não funde.** E o teste prova de verdade: `expect(result.sidebarWidth).toBeUndefined()`
sobre um `prev` sintético que simula o sobrevivente do `localStorage`. É a asserção certa para a afirmação.

✅ **O warn é único por sessão**, e o teste chama três vezes esperando **um** warn. O flag é de **módulo**, não
`useRef` — com o motivo escrito ao lado, e é a escolha certa (dois Providers avisam uma vez juntos). Os testes
usam `vi.resetModules()` + import dinâmico, que é o único jeito honesto de testar flag de módulo.

✅ **Isolamento entre tenants**, e cobrindo as duas portas: leitura direta **e** `crossTabSync` por
`StorageEvent` real.

✅ **`docs/migracoes.md`** no formato de [[03-versionamento-e-release]] §5, com as quatro partes. É a melhor
entrada do arquivo.

### 🔴 O achado

**`src/core/Provider/hooks/useDesignRemoteLoader.ts:55`** — `getSeedConfig` entrou no array de dependências
do efeito, e **ele não é referencialmente estável**. A cadeia é mecânica:

```
getSeedConfig  = useCallback(…, [resolveSeedThemeId, allThemes])   useDesignManager.ts:69
resolveSeedThemeId = useCallback(…, [activeThemeId, initialTheme, allThemes])   :56
allThemes = useMemo(…, [customThemes])   SarakUIProvider.tsx:118-120
```

E o próprio código declara o buraco, em `SarakUIProvider.tsx:44-46`:

> *"Consumidores que passam `customThemes` inline (`customThemes={[...]}` a cada render) **continuam
> expostos ao padrão** — por isso o guard em `useDesignSync` é a correção definitiva."*

**Antes desta plan, as cinco dependências daquele efeito eram TODAS estáveis** (dois booleanos, um ref e dois
setters de `useState`) — conferido em `git show HEAD`. E `getSeedConfig` era usada **só dentro do
inicializador do `useState`**, que roda uma vez. **Esta execução é a primeira vez que ela entra num array de
dependências.**

**O que acontece:** com `customThemes` inline **e** `onLoad` configurado, o efeito passa a re-executar a cada
render na janela entre a primeira chamada e o `setIsBackendLoaded(true)` do `finally` — que é **assíncrono**.
Cada re-execução cancela a anterior e **dispara `onLoad()` de novo**. Não é loop infinito (o
`isBackendLoaded` fecha), mas são **N chamadas ao backend do consumidor por boot, onde o contrato prometia
uma** — e com `strictBackendSync` ligado, a tela em branco dura mais.

**Por que isso reprova, e não é preciosismo:**

1. O critério de aceite diz que `'hybrid'` (default) *"reproduz **byte a byte** o comportamento de antes desta
   plan"*. Para esse consumidor, **não reproduz**: era 1 chamada, passam a ser N. Nenhum teste cobre o caso —
   os testes usam props estáveis. É "atendido por interpretação", que [[00-prompt-revisor]] §6.2 reprova.
2. A §8 desta plan nomeia exatamente isto: *"`strategy: 'hybrid'` que se comporta diferente em qualquer caso
   **não coberto por teste**"*.
3. É a classe que [[02-design-engine]] §3.1 documenta com um incidente real, e cuja lição escrita é: **"a
   defesa robusta é o guard por valor, não a estabilização da referência"**. O guard existe aqui
   (`isBackendLoaded`), mas fecha **depois** da chamada remota — não antes.

**O conserto é pequeno e o idioma já está no arquivo:** `useDesignManager.ts:32-35` mantém `optionsRef`,
`configRef` e `onThemeChangeRef` exatamente para isto. Um `getSeedConfigRef` tira a função do array de
dependências e devolve o efeito ao conjunto estável que ele tinha antes — sem mudar semântica, porque ler a
semente **no momento em que `onLoad` resolve** é o comportamento desejado.

### Duas coisas que eu conferi em vez de aceitar, e estão certas

1. **`sarak-dev/` está no diff e NÃO é scope creep.** A §3.1 não o lista, mas `dev-kit:check` estava
   **vermelho antes de a execução começar** — resíduo meu, da sessão em que criei os ADRs 009 e 010 sem
   regerar o kit. [[00-prompt-executor]] §3 item 7 é explícito: *"gate de baseline verde sai verde, mesmo que
   a causa seja de outra plan"*. Conferi que é **regeneração limpa**, sem edição à mão: o diff traz só a
   contagem de ADR (8→10) e a versão da lib (4.0.0→4.0.1, defasagem pré-existente). Fez o certo.
2. **O JSDoc de `crossTabSync` compactado** — extensão declarada, e legítima. `types.ts` fechou em **247 de
   250 linhas** (R9): sem abrir a margem, o arquivo estouraria o teto por causa de dois campos novos. É a
   mesma frase, no mesmo objeto que a plan já mandava editar, e **nenhum conteúdo se perdeu** — só a
   formatação. Extensão de bloco em edição não é scope creep.

### Prompt de correção

```
Leia specs/00-prompt-executor.md e corrija a execução de
specs/plan/plan-34-persistencia-tema-tenant-aware.md.

Veredito de 2026-08-12: REPROVADO. UM achado. Todo o resto está APROVADO —
não toque em mais nada.

1. src/core/Provider/hooks/useDesignRemoteLoader.ts:55 — `getSeedConfig` entrou no
   array de dependências do efeito e NÃO é referencialmente estável:
     getSeedConfig ← [resolveSeedThemeId, allThemes]  (useDesignManager.ts:69)
     allThemes     ← useMemo([customThemes])          (SarakUIProvider.tsx:118)
   e SarakUIProvider.tsx:44-46 declara que consumidor com `customThemes` inline
   CONTINUA exposto a referência instável.

   Efeito: com `customThemes` inline + `onLoad` configurado, o efeito re-executa a
   cada render na janela até `setIsBackendLoaded(true)` (que é assíncrono, no
   `finally`), disparando `onLoad()` N vezes. Antes desta plan as 5 dependências
   daquele efeito eram todas estáveis — conferido em `git show HEAD`.

   Critério violado: "strategy 'hybrid' (default) reproduz BYTE A BYTE o
   comportamento de antes desta plan" (§7) e a §8 ("comportamento diferente em
   caso não coberto por teste").

   CONSERTO: passe `getSeedConfig` por REF, tirando-o do array de dependências —
   o idioma já está no arquivo vizinho (`optionsRef`/`configRef`/`onThemeChangeRef`
   em useDesignManager.ts:32-35). Ler a semente no momento em que `onLoad` resolve
   é o comportamento desejado, então o ref não muda semântica.

   E ESCREVA O TESTE QUE FALTAVA: monte o hook com `getSeedConfig` trocando de
   identidade a cada render e prove que `onLoad` é chamado UMA vez. Sem ele, o
   achado volta na próxima refatoração — foi a ausência dele que o deixou passar.

LINHAS VERMELHAS:
  · Você NÃO mexe em mais nada — os 6 critérios aprovados ficam como estão.
  · Você NÃO muda o comportamento de 'remote' (substituir, não fundir): ele está
    certo e testado.
  · Você NÃO toca em SarakUIProvider.tsx nem em useDesignManager.ts:69
    (getSeedConfig em si) — o conserto é do lado do consumidor da função.

Rode e cole: npx vitest run (INTEIRA) · run_audit ·
check-audit-baseline.mjs --with-tsc · npx tsc --noEmit · git diff --stat.

Não commite. Acrescente um bloco NOVO de resumo (o anterior permanece intacto) e
mova o status para 🟠 Em revisão.
```

### Nota de método, para mim

O achado **não veio de rodar comando** — todos passaram. Veio de ler o diff perguntando *"esta dependência é
estável?"* diante de um efeito que ganhou uma dep nova. **Suíte verde não é produto correto**
([[15-divida-conhecida]] §3.1), e a prova é que 1206 testes passaram por cima disto.

## Veredito (correção 1) — 2026-08-12 — 🟢 Aprovada

O achado está fechado, o conserto é o certo, e o teste que faltava é **de verdade**.

### O conserto, verificado no arquivo

`useDesignRemoteLoader.ts:26-29` cria o `getSeedConfigRef` **dentro do próprio consumidor**, com o idioma
idêntico ao do arquivo vizinho — inclusive a atribuição durante o render, exatamente como
`useDesignManager.ts:37-39` faz com `optionsRef`/`configRef`/`onThemeChangeRef`. Não é um idioma novo
inventado para este conserto; é o que o bloco já pratica.

O que fecha o achado é a linha `:62`:

```
HEAD          }, [isHydrated, isBackendLoaded, optionsRef, setDesign, setIsBackendLoaded]);
worktree      }, [isHydrated, isBackendLoaded, optionsRef, setDesign, setIsBackendLoaded]);
```

**Byte a byte igual ao array de antes desta plan** — conferido com `git show HEAD:…| grep`. O efeito
voltou ao conjunto de dependências estáveis que tinha, que era a definição do conserto pedido.

E a semântica não regrediu: `:50` lê `getSeedConfigRef.current()` **no momento em que `onLoad` resolve**,
que é o comportamento desejado (semente do render corrente, não a capturada quando o efeito disparou).

### O teste, e por que ele conta

O teste novo segura `isBackendLoaded` em `false` e troca a identidade de `getSeedConfig` em três
`rerender()` — reproduzindo o footgun de `customThemes` inline sem depender do `SarakUIProvider`.

O executor fez a **verificação por mutação**: aplicou o teste contra o código *sem* o conserto e ele
reprovou com `onLoad` chamado **4 vezes**. Esse número é a corroboração — 1 render inicial + 3 `rerender`
= 4 execuções do efeito é exatamente o que o código sem o ref prevê. Teste que não falha sem o conserto
não é rede, é decoração; este falha.

### Gates, saída real

| Verificação | Saída |
|---|---|
| `npx vitest run` | **308 arquivos / 1207 testes, 100% verde** (152,4 s) — **+1** teste sobre a entrega anterior, nenhum sumiu |
| `npx tsc --noEmit` | **0**, exit 0 |
| `check-audit-baseline --with-tsc` | `igual ao baseline de 2026-08-11 — nenhuma regressão` |
| `run_audit` | 2 regras estruturais — **as mesmas duas** do baseline |
| `dev-kit:check` | `kit em dia (3 arquivos, 0 ponteiros mortos)` |
| `section-pointers:check` | `[OK]` |
| R9 | `useDesignRemoteLoader.ts` **63** linhas · `types.ts` 247 · `useDesignManager.ts` 161 |

### Escopo — a afirmação mais fácil de inflar, e é verdadeira

`git diff --stat` desta rodada contra a anterior: **só `useDesignRemoteLoader.ts` (24→31) e seu teste
(94→117) se moveram**. As outras 9 entradas — `types.ts` 10, `useDesignManager.ts` 34,
`useDesignManager.test.ts` 118, `docs/migracoes.md` 58, `sarak-dev/` 4/4/6, `specs/` 34/2 — têm contagem
**idêntica** à da entrega reprovada. A linha vermelha "não toque em mais nada" foi respeitada, e
`SarakUIProvider.tsx` não aparece no diff.

Os 6 critérios de aceite aprovados no veredito anterior seguem válidos e não foram reverificados por
inteiro — não mudaram de arquivo. **É isto que esta seção não vê**, e é intencional: o que mudou foi
auditado por inteiro.

### Uma coisa que o executor fez certo, e não era óbvia

Criar o ref **no consumidor** em vez de pedir a `useDesignManager.ts:69` que estabilizasse `getSeedConfig`.
Estabilizar na origem exigiria mexer em `allThemes`/`customThemes` — território do `SarakUIProvider`, com
efeito colateral em todo mundo que lê `allThemes`. Conserto local, sem raio de alcance. É a leitura certa
da linha vermelha, não só obediência a ela.

### Pendência de processo (minha, não do executor)

`plan-index:check` ficou vermelho entre a correção e este veredito, porque o §1 do `00-indice` é gerado do
frontmatter e a plan mudou de status. **O executor agiu certo ao não tocar nele** —
[[00-prompt-executor]] §168 diz que `00-indice` é do revisor. Regenerado por `npm run plan-index` junto
com esta aprovação.

### Próximo passo

Aprovada, **não sintetizada**. O destino já está declarado na §9 (`09-temas-e-presets.md` §4.4 ·
`02-design-engine.md` §8; `docs/migracoes.md` já foi escrito pelo executor, não é síntese futura). A
síntese só acontece por `spec-atualizar`, depois do commit do dono — não por iniciativa minha.
