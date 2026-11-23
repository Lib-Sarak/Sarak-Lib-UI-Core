---
tipo: "plan"
titulo: "Consertar os três testes que estouraram o tempo no npm version da 9.0.0-rc.1"
objetivo: "Tirar dos três testes que derrubaram o preversion o custo que eles mesmos criam (laço num único caso, duas montagens num caso), para a nova tentativa da 9.0.0-rc.1 com a máquina ociosa"
dominio: "Qualidade / Suíte"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "suite", "release-9-0-0"]
relacionados: ["[[01-gates-e-baseline]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/01-gates-e-baseline.md"
---

# 1. Objetivo

O `npm version 9.0.0-rc.1` caiu no `preversion` em 2026-11-23, depois de 74 minutos. A suíte deu 7032 testes verdes e 3 vermelhos, todos
por estourar o tempo de 5 s. A regra dura da [[01-gates-e-baseline]] §2.4 manda consertar no próprio teste. Esta plan conserta os três.

# 2. Contexto

**Os três que caíram.** Cada um junta num único `it` um custo que pode ser repartido.

| # | Teste | Sozinho, máquina ociosa | Na medição da suíte inteira | Causa |
|---|---|---|---|---|
| 1 | `src/core/Design/palette/__tests__/resolve.test.ts` › *passes every contrast pair for extreme colors, harmonies, and modes* | 2846 ms | 1345 ms | 60 casos (6 bases × 5 harmonias × 2 modos), cada um resolvendo a paleta e avaliando todos os `PAIRS`, num único `it` |
| 2 | `src/core/Design/presets/themes/__tests__/themeSetCoverage.test.ts` › *declara cores hierárquicas acessíveis no tema e em cada contraparte* | 2441 ms | 1318 ms | 25 temas × 2 modos de `composeThemeForMode` num único `it` |
| 3 | `src/features/DesignEngine/components/__tests__/ExceptionRelation.test.tsx` › *o canto declarado ignora o mestre…* | 1713 ms | 1126 ms | duas montagens do `SarakUIProvider` num único `it` |

**A saída da rodada que caiu** foi colada pelo dono na conversa: `Test Files 3 failed | 781 passed (784)`, `Tests 3 failed | 7032
passed (7035)`, `Duration 4440.65s`.

**O que a medição da suíte inteira mostrou (2026-11-23, lote 1 parado no passo 2).** A rodada levou 59 minutos. Nela:
- Os três acima ficaram entre 1,1 s e 1,3 s. No `preversion` passaram de 5 s, ou seja, a carga daquela rodada multiplicou o tempo por 4
  ou mais.
- 75 arquivos têm caso de 2000 ms ou mais. 29 deles já têm prazo próprio, com motivo. Os outros 46 não têm.
- 93 arquivos sem prazo próprio têm caso de 1250 ms ou mais, a mesma faixa dos três que caíram.
- Caíram dois testes que esta plan não tocou:
  - `ChromeUserThemeGroup.test.tsx` › *showUser sem identidade: aparece desabilitado*: uma montagem e um `expect`, em 6917 ms.
  - `SarakQRCodeImpl.test.tsx`: o `beforeAll` que importa o módulo lazy estourou o prazo próprio de 30 s.

A queda de um teste de uma montagem só, e a de um `import` de 30 s, mostram que a variável é a carga da máquina, e não o custo dos
testes. Consertar teste por teste não fecha esse risco: há cerca de 90 na faixa dos que caíram. Por isso esta plan fica só com os três
que têm custo próprio a repartir. A nova tentativa da rc sai com a máquina ociosa, e o risco estrutural foi para o backlog (#1).

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- Os três arquivos de teste da §2.

## 3.2 Fora (o que NÃO pode ser tocado)

- Qualquer outro arquivo de teste, inclusive `ChromeUserThemeGroup.test.tsx` e `SarakQRCodeImpl.test.tsx`. Os dois não têm custo próprio
  a repartir, e a queda deles foi carga da máquina.
- Código de `src/` que não seja teste. Se o teste for lento porque o código é lento, pare e traga ao revisor.
- O tempo padrão do vitest para a suíte (`testTimeout`) e os `maxWorkers` do `vitest.config.ts`.
- `dist/`, `sarak-ui/`, `sarak-dev/` e os `buildInfo.ts`.
- A versão do `package.json`. Esta plan não roda `npm version`.

# 4. Critério de pronto

- Nenhum caso dos três arquivos passa de 1000 ms rodado sozinho na raiz.
- Cada asserção que existia continua existindo. Um laço que vira `it.each` cobre os mesmos casos, e a contagem de casos é escrita no
  resumo (por exemplo, 60 de 60 combinações). Nenhum `expect` foi afrouxado e nenhum caso foi retirado.
- Nenhum teste ganhou prazo próprio.
- Os três arquivos rodados juntos estão verdes, e o `audit:baseline --with-tsc` está verde, com o `tsc` em 0.

# 5. Passos

## Lote 1 — consertar os três

1. Antes de rodar vitest na raiz, entre com `C:` maiúsculo:
   `cd "C:/Users/Igor/Desktop/Sarak/X - Trabalho/Code/Biblioteca/Sarak-Lib-UI-Core"`.
2. **`resolve.test.ts`:** troque o laço por `it.each` sobre as 60 combinações (base × harmonia × modo), com o nome do caso dizendo a
   combinação. Cada caso resolve uma paleta e espera `getPairFailures(...)` igual a `[]`.
3. **`themeSetCoverage.test.ts`:** troque o laço por `it.each` sobre os 25 temas (ou tema × modo), com o id do tema no nome do caso. As
   mesmas quatro funções e as mesmas duas asserções por função e modo.
4. **`ExceptionRelation.test.tsx`:** separe o caso em dois, *o canto declarado…* e *o não declarado só informa*, cada um com uma
   montagem. Se ainda passar de 1000 ms, meça o que custa na montagem: se for o `SarakUIProvider`, veja se o `DynamicTokenControl`
   precisa dele nesse caso. Não troque o Provider por um mock que mude o que o teste prova.
5. Rode os três arquivos com `--reporter=json --outputFile=<arquivo fora do repositório>` e confira o critério de 1000 ms.
6. Rode `npm run audit:baseline -- --with-tsc`. A suíte inteira não é preciso: o `preversion` da nova tentativa a roda.

**Resumo do lote:** a duração antes e depois de cada caso tocado; a contagem de casos de cada `it.each` (antes e depois); o resultado
do passo 6. Não commite. O revisor confere e manda o comando de commit.

## Nota do revisor — 2026-11-23 — escopo reduzido aos três depois da medição

O lote 1 parou no passo 2 da versão anterior desta plan. A medição achou 75 arquivos com caso de 2000 ms ou mais, acima do teto de 8.
Nenhum arquivo foi editado. O critério de 2000 ms supunha que a lentidão era do teste. A medição mostrou que é da carga (§2). Escopo
decidido: só os três da §2. As duas quedas novas ficam fora (§3.2). O risco estrutural é o item #1 do backlog. A medição está em
`C:\Users\Igor\AppData\Local\Temp\claude\fc62b12331e54c06\5bd5c0df-68ca-468c-a080-c6b46eae4732\scratchpad\baseline.json`.

## Resumo da execução — 2026-11-23

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
 M specs/00-backlog.md
 M specs/00-indice.md
?? specs/plan/plan-171-testes-que-estouram-o-tempo-no-npm-version-da-rc.md
```

**O que foi feito**
- `resolve.test.ts`: o laço de 60 combinações virou `it.each` com nome `base $base, harmony $type, mode $mode`. Cada caso resolve uma paleta e espera `getPairFailures(...)` igual a `[]`.
- `themeSetCoverage.test.ts`: o laço de 25 temas × 2 modos virou `it.each` com `$id` e `$mode` no nome. As mesmas 4 funções e as mesmas 2 asserções por função e modo.
- `ExceptionRelation.test.tsx`: o caso foi separado em *o canto declarado ignora o mestre e volta a segui-lo pelo botão* e *o canto não declarado só informa que segue o mestre*, cada um com uma montagem do `SarakUIProvider` (o `unmount()` deixou de ser necessário).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/__tests__/resolve.test.ts` | alterado | laço de 60 → `it.each` de 60 |
| `src/core/Design/presets/themes/__tests__/themeSetCoverage.test.ts` | alterado | laço de 25 temas × 2 modos → `it.each` de 50 |
| `src/features/DesignEngine/components/__tests__/ExceptionRelation.test.tsx` | alterado | 1 caso → 2, uma montagem cada |

**Verificações executadas**
- Os 3 arquivos juntos (`--reporter=json`) → 125 testes, 125 verdes. `resolve`: 65 casos, maior 264 ms. `themeSetCoverage`: 54 casos, maior 127 ms.
- `ExceptionRelation` sozinho, 2 rodadas → 6 casos verdes, maior 966 ms e 797 ms (o caso mais lento é o vizinho *o mestre mostra…*, que não toquei). Na rodada com os 3 arquivos juntos, o maior chegou a 2380 ms (pior caso, `vizinho`), por concorrência entre os arquivos.
- `npm run audit:baseline -- --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão" (tsc incluído).

**Duração por caso, antes → depois**
- `resolve`, caso único com 60 combinações → 60 casos, maior 264 ms, um `it` de 1345 ms na medição da suíte e 2846 ms sozinho na máquina ociosa.
- `themeSetCoverage`, caso único (25 temas × 2 modos) de 1318 ms → 50 casos, maior 127 ms.
- `ExceptionRelation`, caso *o canto declarado…* de 1126 ms → dois casos de 713 a 743 ms sozinhos (1646 e 1049 ms quando os 3 arquivos rodaram juntos).

**Contagem de casos (antes → depois)**
- `resolve`: 6 `it` → 65 casos (5 inalterados + 60 de 60 combinações).
- `themeSetCoverage`: 5 `it` → 54 casos (4 inalterados + 50 de tema × modo, no lugar de 1 caso).

**Critérios de aceite**
- [x] Nenhum caso passa de 1000 ms sozinho — evidência: `ExceptionRelation` 966 e 797 ms nas duas rodadas isoladas; os outros dois, abaixo de 300 ms.
- [x] Mesmas asserções, nenhuma afrouxada ou retirada — evidência: diff dos 3 arquivos; `resolve` 60 de 60 combinações, `themeSetCoverage` 25 temas × 2 modos = 50 casos.
- [x] Nenhum prazo próprio adicionado.
- [x] Os 3 arquivos juntos verdes e `audit:baseline --with-tsc` verde.

**Decisões e suposições**
- Em `themeSetCoverage`, optei por tema × modo (50 casos) em vez de só tema, para o nome de cada caso dizer o modo.
- Em `ExceptionRelation`, não mexi na montagem do `SarakUIProvider`: o custo de ~700 ms por montagem é do Provider, e a plan proíbe trocá-lo por mock que mude o que o teste prova.

**Achados fora do escopo (não corrigidos)**
- `ExceptionRelation.test.tsx` ainda tem ~700 ms por montagem do Provider, perto do limite de 1000 ms em carga; o caso *o mestre mostra…* (797–966 ms sozinho) não foi tocado pela plan.

**Pendências / riscos**
- Sob a carga de uma suíte inteira, os casos de `ExceptionRelation` continuam perto da faixa dos que caíram (item #1 do backlog). A suíte inteira não foi rodada por decisão da plan; o `preversion` a roda.

## Veredito — 2026-11-23 — lote 1 — 🟢 Aprovada

**Como medi:** li o diff dos três arquivos linha a linha e rodei na raiz `trail-citation:check`, que passou. Não repeti a rodada do executor
(125 de 125 e `audit:baseline --with-tsc` sem regressão).

- **`resolve.test.ts`:** as mesmas 60 combinações, e cada caso faz a mesma conta e a mesma asserção do laço.
- **`themeSetCoverage.test.ts`:** os mesmos 25 temas × 2 modos, com as mesmas duas asserções por papel. A mensagem agora diz o
  modo pelo nome, e não pelo índice.
- **`ExceptionRelation.test.tsx`:** os dois comportamentos viraram dois casos, com uma montagem cada. O `unmount` saiu sem perda,
  porque `globals: true` liga a limpeza automática da Testing Library entre casos.

**Fica no backlog #1:** a montagem do `SarakUIProvider` custa cerca de 700 ms. É a mesma faixa dos 93 arquivos do item.

**Status da plan: 🟢 Aprovada.**
