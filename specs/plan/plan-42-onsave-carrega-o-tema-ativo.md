---
tipo: "plan"
titulo: "A porta de persistência passa a dizer QUAL tema está ativo, não só o design"
dominio: "Sarak-Lib-UI-Core / Provider / Persistência"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "persistencia", "temas", "contrato-publico", "adr-009"]
relacionados: ["[[009-persistencia-tenant-aware]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[09-temas-e-presets]]"]
depende_de: ""
destino_sintese: "specs/specs/09-temas-e-presets.md · specs/arquitetura/02-design-engine.md"
objetivo: "Quem implementa `persistence.onSave` consegue guardar qual tema está ativo — hoje recebe só o conjunto de tokens e não tem como saber de qual tema ele veio"
---

# 1. Objetivo

O importador que persiste o tema aplicado consegue registrar **qual tema é o ativo**, e não apenas o
conjunto de tokens resultante. Hoje isso é impossível pela porta pública.

# 2. Contexto

## 2.1 O que foi medido — 2026-08-13

A porta entrega **só o design**:

```ts
persistence.onSave?: (design: SarakThemePayload) => Promise<void> | void
```

E a identidade do tema — `activeThemeId` / `resolvedThemeId` — vive em **`SarakUIContextType`**
(`src/core/Provider/types.ts`, dentro do bloco de contexto), **não no payload**.

Consequência prática, levantada ao desenhar a tabela de referência do consumidor: quando o usuário aplica
um tema e a lib chama `onSave`, o backend recebe os tokens e **nenhuma indicação de que aquilo é o
`erp-noturno`**. Uma coluna "tema ativo" no lado do importador não tem de onde ser preenchida.

**E não há saída pelo lado do consumidor:** `onSave` é chamada *pela lib*, com um argumento só, e a função
vive **fora** da árvore do Provider — não tem como ler o contexto para completar a informação.

## 2.2 Por que isso importa, e não é cosmético

Sem o id, o importador não consegue **destacar o tema selecionado** na própria interface: ele tem o design
aplicado e a lista de temas, e nenhuma forma confiável de dizer qual dos dois bate — comparar payloads
token a token é frágil e quebra assim que o usuário ajusta um valor.

## 2.3 A viabilidade, conferida antes de escrever esta plan

`resolvedThemeId` nasce em `useDesignManager.ts:75` e `persistDesign` é definida em `:110` — **mesmo hook,
mesmo escopo**. O dado está ao alcance; falta atravessá-lo.

⚠️ **E aqui está a armadilha, medida:** `persistDesign` tem `useCallback` com dependências
**deliberadamente mínimas** (`[isHydrated, storageKey]`); todo o resto entra por ref (`optionsRef`,
`onThemeChangeRef`). Ela é consumida num efeito com `[design, persistDesign]` (`:134`). **Pôr
`resolvedThemeId` no array de dependências** trocaria a identidade de `persistDesign` a cada mudança de
tema, refazendo aquele efeito e gravando de novo.

É exatamente a classe de defeito que reprovou a `plan-34` — dependência instável entrando em array de
dependências. **Passe por ref.**

# 3. Escopo

## 3.1 Dentro

1. **`src/core/Provider/types.ts`** — `persistence.onSave` ganha um **segundo parâmetro opcional** com o id
   do tema ativo. Segundo parâmetro, não campo dentro do payload: o payload é o **design**, e é o mesmo
   objeto que o export de tema produz — enfiar identidade ali confunde as duas coisas e contamina o arquivo
   exportado.
   - **É aditivo**: quem já implementa `onSave(design)` continua compilando e funcionando, porque em
     JavaScript uma função pode ignorar argumentos extras. **MINOR**, não MAJOR.
   - JSDoc explicando: o que é, quando vem preenchido, e quando vem indefinido.
2. **`src/core/Provider/hooks/useDesignManager.ts`** — `persistDesign` passa o id ao chamar `onSave`.
   ⛔ **Por REF.** `resolvedThemeId` **não** entra no array de dependências de `persistDesign` — o idioma
   já está no arquivo (`optionsRef`, `configRef`, `onThemeChangeRef`).
3. **Testes** (R8): `onSave` recebe o id do tema ativo; recebe `undefined` quando não há tema resolvido; e
   — o teste que a `plan-34` ensinou — **`persistDesign` não muda de identidade quando o tema muda**.
4. **`docs/migracoes.md`** — entrada nova, **MINOR**, dizendo o que ganhou e que ninguém precisa fazer nada.

## 3.2 Fora

- ⛔ **Mudar `onLoad`.** O id serve ao importador, para a interface dele; a lib não precisa dele de volta.
  Simetria por simetria é escopo inventado.
- ⛔ **Pôr o id dentro de `SarakThemePayload`.** Payload é design. Ver §3.1 item 1.
- ⛔ Mexer em `theme.onSave` (temas criados) — ele já recebe `ThemeEntry` com `id` e `name`.
- ⛔ Mexer em `strategy`, `tenantId`, `crossTabSync` ou em qualquer outra parte da persistência.
- ⛔ Criar tabela, schema, SQL ou documentação de persistência — **é a `plan-43`**, que depende desta.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-34-…md` §11 | o veredito que reprovou dependência instável em array de dependências — **a armadilha desta plan é a mesma** |
| ADR | `specs/adr/009-persistencia-tenant-aware.md` | o contrato de `persistence` que esta plan estende |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.4 | o ciclo de persistência |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` §3 | por que isto é MINOR |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 · R33 | teste ao lado; payload de tema é contrato público |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/core/Provider/hooks/useDesignManager.ts:75,110,134` | onde o id nasce, onde é usado, e o efeito que a armadilha afeta |

# 5. Instruções de execução

1. **Estender o tipo**, com JSDoc de contrato. **Pronto quando** compila e um consumidor que só declara
   `onSave(design)` continua compilando.
2. **Atravessar o id, por ref.** **Pronto quando** existe teste provando que `persistDesign` **não** muda de
   identidade ao trocar de tema.
3. **`docs/migracoes.md`.**
4. **Fechar.** Nesta ordem, colando a saída real: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` ·
   `npx tsc --noEmit` · `npm run container-query:check` · `npm run guide:check` · `git diff --stat`.

> `guide:check` está na lista porque esta plan mexe em **superfície pública** e o kit do consumidor deriva
> dela — lição da `plan-38`, onde eu esqueci de pedir e o gate ficou vermelho.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-42-onsave-carrega-o-tema-ativo.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/adr/009-persistencia-tenant-aware.md,
specs/specs/09-temas-e-presets.md §4.4,
specs/specs/00-regras-e-invariantes.md R8 e R33,
e a §11 da plan-34 — o veredito dela é sobre EXATAMENTE a armadilha desta plan.

O PROBLEMA: persistence.onSave recebe só o design. O id do tema ativo
(resolvedThemeId) vive no CONTEXTO, não no payload. Então quem persiste não tem
como registrar QUAL tema está ativo — e não consegue destacar o selecionado na
própria interface.

O CONSERTO: onSave ganha um SEGUNDO PARÂMETRO OPCIONAL com o id do tema ativo.
Segundo parâmetro, NÃO campo dentro do payload — payload é design, e é o mesmo
objeto que o export de tema produz; enfiar identidade ali contamina o arquivo
exportado. É aditivo: quem já implementa onSave(design) continua funcionando.
MINOR.

🔴 A ARMADILHA, e ela já reprovou uma plan hoje:
  persistDesign (useDesignManager.ts:110) tem useCallback com dependências
  DELIBERADAMENTE mínimas — [isHydrated, storageKey] — e todo o resto entra por
  ref (optionsRef, onThemeChangeRef). Ela é consumida num efeito com
  [design, persistDesign] (:134).
  Se você puser resolvedThemeId no array de dependências, persistDesign muda de
  identidade a cada troca de tema, o efeito refaz, e grava de novo.
  PASSE POR REF. O idioma já está no arquivo.
  E ESCREVA O TESTE: persistDesign NÃO muda de identidade quando o tema muda.

LINHAS VERMELHAS:
  · Você NÃO mexe em onLoad. O id serve ao importador, não à lib.
  · Você NÃO põe o id dentro de SarakThemePayload.
  · Você NÃO mexe em theme.onSave — ele já recebe ThemeEntry com id e name.
  · Você NÃO cria SQL, schema nem documentação de persistência: é a plan-43.

Feche rodando também `npm run guide:check` — esta plan mexe em superfície
pública e o kit do consumidor deriva dela.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] `onSave` recebe o id do tema ativo, como **segundo parâmetro opcional**, com JSDoc de contrato.
- [ ] Um consumidor que declara apenas `onSave(design)` **continua compilando** — evidência: teste de tipo
      ou exemplo no teste.
- [ ] `persistDesign` **não muda de identidade** ao trocar de tema — evidência: teste dedicado.
- [ ] Existe teste do caso "sem tema resolvido" → o segundo parâmetro chega indefinido.
- [ ] `docs/migracoes.md` com entrada **MINOR**.
- [ ] `npx vitest run` inteira, verde, não encolheu.
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0; `guide:check` e `container-query:check` verdes.
- [ ] `git diff --stat` — só `types.ts`, `useDesignManager.ts`, testes, `docs/` e o kit regenerado.

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

grep -n "onSave" src/core/Provider/types.ts
grep -n "resolvedThemeId\|persistDesign" src/core/Provider/hooks/useDesignManager.ts

npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
npm run guide:check
```

**O que reprova:**
- `resolvedThemeId` no array de dependências de `persistDesign` — é a repetição literal do achado da
  `plan-34`, e desta vez estava escrito no prompt;
- id enfiado dentro do payload em vez de segundo parâmetro;
- `onLoad` alterado "para ficar simétrico";
- ausência do teste de identidade de `persistDesign` — sem ele, a armadilha volta na próxima refatoração.

**O que esta verificação não vê:** se o importador de fato consegue usar o id para destacar o tema
selecionado. Isso é a `plan-43` (artefato) e depois o consumidor.

# 9. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` · `specs/arquitetura/02-design-engine.md`

- `09-temas-e-presets.md` §4.4 (Persistir) registra que a porta entrega **design + id do tema ativo**, e
  por que o id não viaja dentro do payload.
- `02-design-engine.md` §8 registra o caminho do id, do `useResolvedThemeId` até a porta, e a razão de ele
  ir por ref.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-13

**Resultado:** Concluído

**O que foi feito**
- `src/core/Provider/types.ts:162-169` — `persistence.onSave` ganhou um segundo parâmetro opcional,
  `activeThemeId?: string`, com JSDoc de contrato (o que é, quando vem preenchido, quando vem `undefined`,
  por que não entra no payload). Assinatura ficou
  `onSave?: (design: SarakThemePayload, activeThemeId?: string) => Promise<void> | void`. Por quê: é o
  pedido central da plan — dar ao importador o id do tema sem contaminar o payload de design.
- `src/core/Provider/hooks/useDesignManager.ts:77-83` — novo `resolvedThemeIdRef`, atualizado a cada
  render (`resolvedThemeIdRef.current = resolvedThemeId`), no mesmo idioma de `optionsRef`/`configRef`/
  `onThemeChangeRef` já existentes no arquivo. Por quê: é o único jeito de `persistDesign` enxergar o id
  atual sem entrar no array de dependências do `useCallback` (a armadilha da plan-34 §11).
- `src/core/Provider/hooks/useDesignManager.ts:127` — `persistDesign` passa a chamar
  `opt.persistence.onSave(config, resolvedThemeIdRef.current)`. O array de dependências do `useCallback`
  em `useDesignManager.ts:133` **permanece** `[isHydrated, storageKey]` — byte a byte igual ao que já
  estava. Por quê: é o conserto pedido, sem tocar no que reprovou a plan-34.
- `src/core/Provider/hooks/__tests__/useDesignManager.test.ts` — 4 testes novos: (1) `onSave` recebe o id
  do tema ativo como segundo parâmetro; (2) um consumidor que só declara `onSave(design)` — sem o segundo
  parâmetro, assinatura de antes desta plan — continua compilando (`tsc`) e sendo chamado; (3) sem tema
  resolvido (`setResolvedThemeId(undefined)` explícito), o segundo parâmetro chega `undefined`; (4)
  `persistDesign` **não muda de identidade** quando o tema muda (`activeThemeId` trocando via `rerender`).
  Por quê: R8 (teste ao lado) + o critério de aceite específico de cada linha vermelha da plan.
- `docs/migracoes.md` — entrada nova no topo (mais recente primeiro), classificação **MINOR**, com o
  "antes"/"depois" e um exemplo de `onSave` usando o segundo parâmetro. Por quê: item 3.1.4 da plan.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/types.ts` | alterado | `persistence.onSave` ganhou 2º parâmetro opcional `activeThemeId` + JSDoc |
| `src/core/Provider/hooks/useDesignManager.ts` | alterado | `resolvedThemeIdRef` (novo) atravessa o id por ref; `persistDesign` passa a chamar `onSave` com 2 argumentos; array de dependências inalterado |
| `src/core/Provider/hooks/__tests__/useDesignManager.test.ts` | alterado | 4 testes novos (id presente, compat de assinatura antiga, `undefined` sem tema, identidade estável de `persistDesign`) |
| `docs/migracoes.md` | alterado | entrada nova, MINOR, no topo do arquivo |

**Verificações executadas**
- `npx vitest run src/core/Provider/hooks/__tests__/useDesignManager.test.ts` (isolado, antes da suíte
  inteira) → **10/10 verde**.
- **Verificação por mutação** (autoverificação, não faz parte da entrega): reintroduzi `resolvedThemeId`
  no array de dependências de `persistDesign` (a armadilha) e rodei o mesmo arquivo de teste → o teste de
  identidade **reprovou** (`AssertionError: expected [AsyncFunction] to be [AsyncFunction]`), os outros 9
  continuaram verdes. Revertido antes de prosseguir — confirma que o teste é rede, não decoração.
- `npx vitest run` (suíte INTEIRA) → **314 arquivos / 1312 testes, 100% verde** (162,9 s). Cresceu (era
  308/1207 na plan-34; mais plans rodaram desde então) — não encolheu.
- `node gates/scripts/audit/run_audit.mjs` → **2 auditores vermelhos**: `auditor_composicaoatomica` (2
  ocorrências, `SarakMultiSelect.tsx:113` e `SarakUploader.tsx:111`, `<input>` nativo cru) e o auditor de
  variável-fantasma (1 consumo). Nenhum dos dois arquivos faz parte do escopo desta plan.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `igual ao baseline de 2026-08-11 —
  nenhuma regressão`.
- `npx tsc --noEmit` → **0 erros**, saída vazia, exit 0.
- `npm run container-query:check` → `[OK] Nenhuma classe de container query montada por interpolação`.
- `npm run guide:check` → `kit em dia (6 arquivos)` — nenhuma regeneração necessária; o gerador do kit não
  reflete o corpo de `onSave` em nível de assinatura.
- `git diff --stat` → só `docs/migracoes.md`, `useDesignManager.test.ts`, `useDesignManager.ts`,
  `types.ts` (mais `specs/00-indice.md`, que já estava modificado antes desta execução começar — não é
  meu).

**Critérios de aceite**
- [x] `onSave` recebe o id do tema ativo, como segundo parâmetro opcional, com JSDoc de contrato —
      evidência: `types.ts:162-169`.
- [x] Um consumidor que declara apenas `onSave(design)` continua compilando — evidência: teste
      `'um consumidor que só declara onSave(design) — SEM o segundo parâmetro — continua compilando (tsc)
      e sendo chamado'`, mais `npx tsc --noEmit` limpo sobre o arquivo de teste.
- [x] `persistDesign` não muda de identidade ao trocar de tema — evidência: teste dedicado + verificação
      por mutação (acima).
- [x] Existe teste do caso "sem tema resolvido" → o segundo parâmetro chega indefinido — evidência: teste
      `'sem tema resolvido, o segundo parâmetro chega undefined…'`.
- [x] `docs/migracoes.md` com entrada MINOR — evidência: topo do arquivo.
- [x] `npx vitest run` inteira, verde, não encolheu — evidência: 314/1312, era 308/1207.
- [x] `run_audit` sem regressão; `npx tsc --noEmit` → 0; `guide:check` e `container-query:check` verdes —
      evidência: seção "Verificações executadas".
- [x] `git diff --stat` — só `types.ts`, `useDesignManager.ts`, testes, `docs/` — evidência: seção acima.

**Decisões e suposições**
- **Como simular "sem tema resolvido" num teste.** `resolveSeedThemeId` sempre cai num tema de
  `GLOBAL_THEMES` quando não há `activeThemeId`/`initialTheme` — ou seja, no fluxo normal
  `resolvedThemeId` quase nunca nasce `undefined`. Usei o setter público `setResolvedThemeId(undefined)`
  (já exposto pelo hook e pelo contexto, "quem aplica um preset novo anuncia o id aqui") para forçar o
  estado sem tema resolvido. É o único caminho real pelo qual esse estado acontece — um consumidor que
  limpa a seleção de tema explicitamente — e não inventa comportamento novo no hook.
- **Ids de tema arbitrários no teste de identidade** (`'tema-a'`, `'tema-b'`). O `useEffect` de
  `useResolvedThemeId.ts:17-19` seta `resolvedThemeId` a partir de `activeThemeId` sem checar
  `allThemes` — qualquer string dispara a troca. Usar ids inventados evitou acoplar o teste ao catálogo
  real de temas (que pode crescer/mudar) e ao array `allThemes`, que não é o que este teste verifica.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. Os 2 auditores vermelhos de `run_audit` (`SarakMultiSelect.tsx:113`,
  `SarakUploader.tsx:111`, e a variável-fantasma) já eram vermelhos no baseline e não têm relação com os
  arquivos desta plan.

**Pendências / riscos**
- Nenhuma pendência conhecida. A síntese para `specs/specs/09-temas-e-presets.md` §4.4 e
  `specs/arquitetura/02-design-engine.md` §8 é do revisor/`spec-atualizar`, fora do escopo do executor
  (§9 da plan).

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-13 — 🟢 Aprovada

A armadilha foi evitada, e evitada pelo motivo certo — não por sorte.

### O que confirmei

**O array de dependências está byte a byte igual ao do `HEAD`:**

```
HEAD      }, [isHydrated, storageKey]);
worktree  }, [isHydrated, storageKey]);
```

O id atravessa por `resolvedThemeIdRef`, com atribuição durante o render — o mesmo idioma de `optionsRef`
logo acima. E o comentário ao lado **não descreve o mecanismo, descreve o motivo**: cita o efeito de `:134`
e a `plan-34` §11 nominalmente. Quem ler daqui a seis meses entende por que aquele ref existe, que é
exatamente o que impede a reintrodução.

**O JSDoc do contrato é melhor do que eu pedi.** Diz o que é, **quando vem preenchido**, **quando vem
`undefined`**, por que não faz parte de `design` ("é identidade, não token") e por que o consumidor antigo
continua funcionando. Um consumidor lê isso e não precisa perguntar nada.

**Os quatro testes cobrem o que importa**, incluindo um que eu não teria formulado assim: *"um consumidor
que só declara `onSave(design)` continua sendo chamado"* — prova comportamento, não só compilação. E o teste
de identidade (`expect(result.current.persistDesign).toBe(persistDesignBeforeThemeChange)`) foi **verificado
por mutação**: a dependência instável foi reintroduzida, o teste reprovou, e o conserto voltou.

### Gates

| | |
|---|---|
| `npx vitest run` | **314 arquivos / 1312 testes, verde**, zero falhas (era 1308) |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `guide:check` | **kit em dia** — a lição da `plan-38` colada, e desta vez não ficou vermelho |
| `container-query-boundary:check` | verde |
| Linhas vermelhas | `useDesignRemoteLoader.ts` e `utils/` → **0 linhas** no diff (`onLoad` intacto); payload **não** tocado; nenhum SQL |

### Escopo

`types.ts`, `useDesignManager.ts`, o teste, `docs/migracoes.md`. Nada além — e o kit nem precisou ser
regenerado, o que confirma que a mudança não vazou para a superfície catalogada.

### Nota

A suíte rodou verde nesta verificação. O achado de intermitência registrado no veredito da `plan-41` (uma
execução vermelha em três, testes não identificados) **continua de pé** e não tem relação com esta plan.

### Destino da síntese

Declarado na §9, **não executado por mim**: `09-temas-e-presets.md` §4.4 registra que a porta entrega
**design + id do tema ativo** e por que o id não viaja dentro do payload; `02-design-engine.md` §8 registra
o caminho do id e a razão de ele ir por ref. Só por `spec-atualizar`, depois do commit do dono.

**A `plan-43` está destravada.**
