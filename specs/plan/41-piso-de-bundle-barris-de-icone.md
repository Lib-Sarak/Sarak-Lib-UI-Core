---
tipo: "spec"
titulo: "Piso de Bundle: barris de ícone e o custo do despacho dinâmico"
dominio: "Performance / Build / Componentes UI Base / Ícones"
status: "🟢 Concluída (2026-07-25) — chunk de boot do consumidor 3203,6 KB → 1533,6 KB (−52,1%); §1.3 e §1.4 REFUTADAS por medição"
prioridade: "Média-Alta"
tags: ["spec", "performance", "bundle", "icones", "tree-shaking", "pos-selo"]
relacionados: ["30-fechamento-achados-pos-selo", "42-generalizar-cardgrid-corecard", "26-instalacao-teste", "otimizacao-nivel-1"]
---

# 1. Visão Geral e Descrição do Problema

## 1.1 O achado que originou esta spec

A Spec 30 §2.2 tentou reduzir o bundle do consumidor com `manualChunks` e **falhou em reduzir bytes** (chunk principal ~2,44 MB antes e depois; critério fechado como "Parcial, com ressalva honesta"). A execução descobriu a razão estrutural:

> **Num renderizador de manifesto, a ligação componente↔uso é por STRING em RUNTIME (`{"type": "SarakDataTable"}`). O bundler não tem como saber quais tipos um manifesto vai pedir — o manifesto é DADO, pode vir do servidor, pode ser escrito depois do build. Logo o Registry precisa mapear todo nome possível → componente de forma ansiosa, e todo componente não-lazy cai no grafo estático inicial.**

Isso **não é bug nem má configuração** — é o preço de ser genérico (mesma patologia de sistemas de plugin e DI por reflexão). Consequência prática, a registrar de vez: **`manualChunks` não reduz bundle num renderizador de manifesto.** O que reduz é diminuir o que entra no grafo estático. Duas rodadas de teste (relatórios 1 e 2) reclamaram do bundle de 3,9 MB; a expectativa de resolver isso por configuração de build era ingênua e precisa ser encerrada por escrito, senão volta como "achado" na próxima rodada.

## 1.2 A causa concreta e atacável: barris de ícone com acesso dinâmico

Um `import * as X from 'lib'` **é** tree-shakeable quando o uso é estático (`X.Home`). Com **acesso por índice dinâmico** (`X[nomeEmRuntime]`), o bundler não pode saber qual membro será usado e **mantém a biblioteca inteira**.

É exatamente o padrão em 6 arquivos:

| Arquivo | Linha do barril |
|---|---|
| `src/components/atomic/Icon/SarakIcon.tsx` | 4 (verificar se é vestigial — o resolvedor real é o `IconMap`, linha 21) |
| `src/components/atomic/Cards/SarakActionCard.tsx` | 3 |
| `src/components/atomic/Cards/SarakSearchCard.tsx` | 3 |
| `src/components/atomic/Cards/SarakTitleCard.tsx` | 3 |
| `src/components/atomic/Templates/components/SarakCoreCard.tsx` | 4 |
| `src/components/atomic/Templates/SarakCardGrid.tsx` | 13 |

Padrão de acesso (ex. `SarakActionCard`): `LucideIcons[mapping.icon as keyof typeof LucideIcons]` → **dinâmico**. `lucide-react` tem ~1500 ícones.

**A ironia útil: a solução já existe na casa.** O `SarakIcon` resolve via `IconMap` **curado** (`IconMap[name as IconName]?.[family]`) — é o átomo oficial de ícone. Os 5 cards **burlam** o `SarakIcon` e vão direto ao barril. É simultaneamente um problema de bundle e um cheiro de arquitetura (componente contornando o átomo oficial).

## 1.3 Duas mecânicas diferentes — medir separadamente

- **`lucide-react` é `peerDependency` e está em `--external` no `build:js`.** Ou seja: NÃO entra no `dist/` da lib; o `import * as` sobrevive como import externo e é o **bundle do CONSUMIDOR** que incha (os 2,44 MB medidos). 
- **`@phosphor-icons/react` e `@tabler/icons-react` são `dependencies` e NÃO estão na lista `--external`.** Hipótese a VERIFICAR na medição: podem estar sendo **empacotadas inteiras dentro do `dist/` da própria lib**. Se confirmado, é um segundo vetor, possivelmente maior, e independente do consumidor.

## 1.4 Terceira dimensão, confirmada no Teste Real: o `export *` do consumidor (2026-07-25)
O `RELATORIO-TESTE-REAL` (§7.5) mediu, no bundle REAL do ERP, um vetor ADICIONAL (possivelmente maior que os ícones): o `export * from '@sarak/lib-ui-core'` — feito no `ui-kit` do consumidor — reexporta **todo o grafo alcançável**, arrastando para o `dist/` do consumidor chunks lazy pesados que o app nem importa: `pdf.worker` (~1,2 MB), `prism`/syntax-highlighter (~736 KB), `SarakPDFViewerImpl` (~479 KB), `SarakChartEngine`/echarts (~374 KB), `SarakFlowEngine`/reactflow (~139 KB). São chunks **separados** (o browser não baixa em produção real), mas **peso morto** em disco/CDN. **Medir também esta dimensão** e avaliar mitigações (o consumidor reexportar só o que usa; a lib oferecer **subpaths/entradas granulares**; ampliar `HEAVY_LAZY`). Não confundir com os ícones (§1.2), que atacam o **grafo estático inicial**; este ataca o **total de chunks emitidos**.

> **Nota de sequência (2026-07-25):** o raciocínio do §1.1 (piso vindo do Registry ansioso do #2) muda quando a **Spec 46 remove o #2** — parte do piso sai. Por isso 41 roda **DEPOIS da 46** e re-mede do zero (a linha de base é outra). As três dimensões (ícones §1.2, phosphor/tabler §1.3, `export *` §1.4) são independentes — medir cada uma.

# 2. Regras de Negócio (Solução)

## 2.1 MEDIR ANTES de refatorar (regra dura)
- Nada de refatorar às cegas. Primeiro isolar, com número, **quanto cada família de ícone contribui**: (a) no `dist/` da lib (phosphor/tabler, não-external) e (b) no bundle do consumidor (lucide, external). Usar `sarak:otimizacao-nivel-1` (disciplina antes/depois) e um app mínimo do `init` como cobaia, mesmo método da Spec 30.
- **Se a medição mostrar que o ganho é pequeno**, esta spec para aqui e registra o número — a conclusão negativa também é entrega. Não force o refactor para justificar a spec.
- Registrar o baseline no `00-progresso.md` (o número da Spec 30 é 2,44 MB no app mínimo do scaffold; o 3,9 MB da rodada 2 era o app do ERP — não são comparáveis, não misture).

## 2.2 Eliminar o acesso dinâmico ao barril (o refactor)
- Nos 5 cards, trocar `React.createElement(LucideIcons[nome], {...})` pelo átomo oficial `<SarakIcon name={nome} ... />`. O `SarakIcon` já faz a resolução nome→componente via `IconMap`.
- Em `SarakIcon.tsx`, avaliar se o `import * as LucideIcons` (linha 4) ainda é necessário ou é vestigial; se for fallback para nomes fora do `IconMap`, ver 2.3 antes de removê-lo.
- Se phosphor/tabler estiverem sendo empacotadas por inteiro (2.1-a), aplicar o mesmo princípio: import nomeado/estático do subconjunto curado, nunca barril + índice dinâmico.

## 2.3 Cobertura do `IconMap` + contrato público de nomes (mitigação de regressão)
- **Risco real:** hoje qualquer nome do lucide funciona (barril). Com o `IconMap` curado, nome fora do mapa deixa de renderizar — isso é **regressão para o consumidor**.
- Antes de trocar: levantar a cobertura do `IconMap` e **estendê-lo** com os nomes comuns que faltarem. Garantir que nome desconhecido degrada com `console.warn` ensinando (postura da Spec 17), nunca quebra a tela.
- **Documentar os nomes de ícone válidos no catálogo gerado** (`docs/manifest-catalog.*`). Hoje ícone é a exceção não documentada da "regra dura de tokens" que a onda estabeleceu — todo valor deve vir do catálogo. Fechar essa lacuna é ganho de contrato, além de performance.

## 2.4 Encerrar por escrito a expectativa errada do `manualChunks`
- Registrar a conclusão de §1.1 onde ela será lida: comentário no `vite.config.ts` gerado pelo `init` (já tem a nota da armadilha dos 5 MB — complementar) e/ou na skill de consumo. Objetivo: o próximo relatório de teste não repetir "bundle grande, faltou code-splitting" como se fosse configuração pendente.
- Deixar explícito o que REALMENTE reduziria além dos ícones, sem se comprometer com isso agora: ampliar `HEAVY_LAZY`; Registry lazy / import dinâmico por tipo citado no manifesto; análise do manifesto em build-time (esta última quebra a promessa de "manifesto pode vir do servidor" — registrar o trade-off, não implementar).

# 3. Critérios de Aceite
- [x] Medição registrada ANTES do refactor: contribuição de lucide (bundle do consumidor) e de phosphor/tabler (`dist/` da lib), com números e método reprodutível. — ver §6.
- [x] Zero `import * as *Icons` com **acesso por índice dinâmico** em `src/` (grep limpo); os cards usam o átomo `SarakIcon`.
- [x] Medição DEPOIS, comparável à de antes, registrada no `00-progresso.md`. **Ganho relevante** — o refactor fica.
- [x] Nenhuma regressão de ícone: `IconMap` 55 → **100 nomes**, cobrindo os 26 usados na casa (+ o `Home` do ERP) e um conjunto comum de negócio; nome desconhecido → `console.warn` (dedup por nome) + `AlertCircle` visível, nunca tela quebrada.
- [x] Nomes de ícone válidos documentados no catálogo gerado (`docs/component-catalog.{md,json}`, seção "Ícones", derivada por AST de `ICON_NAMES` + gate em suíte).
- [x] Conclusão do §1.1 registrada **no arquivo gerado** pelo `init` (`vite.config.ts`) e na skill `ui-integra-consumidor`. Reescrita: o argumento "renderizador de manifesto" morreu com a Spec 46 — a conclusão correta e medida é mais geral (ver §6.5).
- [x] Gates verdes: `catalog:check`, `barrel:check`, `npm run build` (DTS), `package:check`; `run_audit.mjs` **no baseline exato** (2 falhas pré-existentes: 1 hardcode `SarakTypography:42` + 3 ghostvars); suíte completa **272 arquivos / 781 testes, 0 falhas**. *(`RegistryParity` não existe mais — removido na Spec 46.)*

# 6. Resultado da execução (2026-07-25)

## 6.1 Método (reprodutível)
App mínimo em Vite (React 18 + `@sarak/lib-ui-core` apontado para o `dist/` local), importando 8 símbolos
representativos (`SarakUIProvider`, `SarakAppChrome`, `SarakButton`, `SarakIcon`, `SarakBadge`, `SarakLink`,
`SarakInput`, `SarakSkeleton`). Build de produção; atribuição de bytes por pacote npm via plugin Rollup em
`generateBundle` (`renderedLength` por módulo). Duas variantes do MESMO app, para isolar o §1.4: **A** importa
direto do barril da lib; **C** importa de um `ui-kit` local que faz `export * from '@sarak/lib-ui-core'`
(réplica exata do `packages/ui-kit` do ERP). Medição do `dist/` da lib por bytes de arquivo + inspeção dos
imports externos remanescentes.

## 6.2 §1.2 — barril de ícone com índice dinâmico: **CONFIRMADA, e era o previsto**
`lucide-react` no chunk de boot do consumidor: **789,2 KB → 56,5 KB (−732,7 KB, −92,8%)**. O pacote tem
`sideEffects: false` e tree-shaking perfeito — o que segurava os ~1500 ícones era exclusivamente o
`LucideIcons[nomeEmRuntime]`. Dos 6 arquivos listados no §1.2, **2 eram barril vestigial** (`SarakSearchCard`,
`SarakCardGrid` importavam `* as LucideIcons` sem nunca usar) e 3 tinham o acesso dinâmico de fato
(`SarakActionCard`, `SarakTitleCard`, `SarakCoreCard`); o `SarakIcon` usava o barril como **fallback**
para nome fora do `IconMap` — era ele o vetor central, não os cards.

## 6.3 §1.3 — phosphor/tabler dentro do `dist/`: **HIPÓTESE REFUTADA**
Contribuição das duas ao `dist/` da lib: **0 bytes**. O `tsup` externaliza automaticamente tudo que está em
`dependencies`/`peerDependencies` — a lista `--external` do `build:js` apenas ACRESCENTA. Prova direta:
`dist/index.js` contém `from"@phosphor-icons/react"` e `from"@tabler/icons-react"` como imports externos.
*(Armadilha de medição: um harness esbuild que espelhe só a flag `--external` mede 143,7 KB de phosphor no
bundle — número que NÃO existe no artefato real. Sempre cruze com o `dist/` de verdade.)*

Onde elas custam: no bundle do **consumidor** (são `dependencies`, instaladas e empacotadas por ele).
Custo marginal medido: **~2,6 KB por nome** (phosphor 2,35 + tabler 0,28 — o módulo de cada ícone phosphor
embute os 6 pesos; o lucide é external e custa ~0,17 KB). Estender o `IconMap` de 55 → 100 nomes custou
**+179,5 KB** no chunk de boot (phosphor 188,4 → 345,1 KB; tabler 29,4 → 52,2 KB) — preço consciente da
cobertura de nomes do §2.3, contra os 732,7 KB economizados.

**Achado estrutural registrado, NÃO executado:** as 3 famílias vivem no grafo estático, mas só UMA renderiza
por vez (token `iconFamily`) — ~265 KB de família que nunca desenha. Carregar phosphor/tabler sob demanda
resolveria, mas o tema padrão (`sarak-sovereign`) é `phosphor`: haveria troca visível de ícone no primeiro
paint. Isso é concessão de UX (`otimizacao-nivel-2`), fora do nível 1 — fica para decisão do dono.

## 6.4 §1.4 — o `export *` do consumidor: **HIPÓTESE REFUTADA, ganho ZERO**
Os cenários A e C produzem saída **byte a byte idêntica**: antes, 4658,6 KB em 12 chunks nos dois; depois,
4401,3 vs 4401,2 KB em 13 chunks (0,1 KB de diferença = nome do arquivo de entrada). **O `export *` não é a
causa** dos chunks pesados que o `RELATORIO-TESTE-REAL §7.5` mediu — o Rollup emite os chunks de `import()`
dinâmico alcançáveis a partir do barril da lib com ou sem ele. Trocar o `export *` do `ui-kit` do ERP por
imports nomeados não economizaria um byte; a recomendação foi **retirada** da skill de consumo, com o número.

**A causa real, achada ao medir:** `src/index.ts` exportava o `default` de `SarakChartEngine`, anulando o
`React.lazy` que `components/engines/index.ts` já declarava. Resultado: echarts (1761,9 KB) + zrender (448,6)
+ recharts (453,5) + lodash (110,3) + d3-* (~100) no chunk de **boot de todo consumidor**, mesmo o que nunca
desenha um gráfico. Corrigido com fronteira lazy que preserva o contrato público (`Suspense` interno via
`LazyEngineWrapper` — quem usa `<SarakChartEngine />` continua sem precisar declarar `Suspense`).

## 6.5 Números finais

| Métrica | Antes | Depois | Δ |
| --- | --- | --- | --- |
| **Chunk de boot do consumidor** (minificado) | 3203,6 KB | **1533,6 KB** | **−1670,0 KB (−52,1%)** |
| Chunk de boot, soma por pacote (pré-minificação) | 5874,6 KB | 2290,8 KB | −3583,8 KB (−61,0%) |
| ↳ `lucide-react` | 789,2 KB | 56,5 KB | −732,7 KB |
| ↳ echarts + zrender + recharts + lodash + d3-* | ~2884 KB | 0 (virou chunk sob demanda) | −2884 KB |
| ↳ `@phosphor-icons/react` + `@tabler/icons-react` | 217,8 KB | 397,3 KB | +179,5 KB (`IconMap` 55→100) |
| Total JS emitido (disco/CDN) | 4658,6 KB / 12 chunks | 4401,3 KB / 13 chunks | −257,3 KB |
| `dist/` da lib (JS+CJS) | 2 546 236 B | 2 554 100 B | +7 864 B (+0,3%) |
| `npm pack` | 54 arquivos | 54 arquivos | = |

**A conclusão que substitui a do §1.1** (o argumento "renderizador de manifesto" caiu com a Spec 46):
`manualChunks` não reduz bytes — só decide em qual arquivo cada byte cai, e uma regra ampla demais ainda
DESFAZ o code-splitting existente. O que reduz o boot são duas coisas, ambas na origem: (1) nada de acesso
dinâmico a barril; (2) peso de verdade atrás de `React.lazy` + `import()`. As duas juntas cortaram 52% do
boot sem tocar em uma linha de `manualChunks`. Registrado no `vite.config.ts` **gerado** pelo `init` e na
skill `ui-integra-consumidor`.

## 6.6 Mudança de comportamento (intencional) a conhecer
Os cards resolviam o ícone sempre em lucide, ignorando o tema. Agora passam pelo `SarakIcon` e **obedecem o
token `iconFamily`** — sob o tema padrão (`sarak-sovereign`, phosphor) o glifo muda. É o fim do desvio do
átomo oficial apontado no §1.2, e a razão dos 2 snapshots atualizados (diferença puramente de geometria SVG).

# 4. Plano de Testes (Quality Gate)
## Medição (é o coração desta spec)
- [x] Build de app mínimo antes/depois, com tamanho do chunk de boot e atribuição por pacote; `dist/`/`npm pack` para phosphor/tabler. — §6.
## Unitários
- [x] Cada card renderiza o ícone correto via `SarakIcon` (nome válido, incl. troca de família) e degrada com warn em nome inválido, sem quebrar — `Cards/__tests__/cardsIcon.test.tsx`.
- [x] `IconMap`: paridade 1:1:1 entre as famílias garantida pelo compilador (`Record<IconName, …>`) **e** por teste — `Icon/__tests__/iconContract.test.tsx`; paridade nome↔catálogo em `Icon/__tests__/iconCatalogParity.test.ts`.
## Regressão
- [x] Snapshots atualizados conscientemente: 2 dos 5 cards mudaram (`SarakActionCard`, `SarakTitleCard`); o diff é só geometria de `<path>`/`viewBox` — o glifo passou a ser o da família do tema (§6.6). `SarakSearchCard`/`SarakCardGrid` não mudaram (barril vestigial) e `SarakCoreCard` não tem snapshot próprio (é a Spec 42 que o cria).
- [x] Suítes de `Cards`, `Templates` e `Icon` verdes; suíte completa 272 arquivos / 781 testes.

# 5. Coordenação com a Spec 42 (obrigatório)
Esta spec e a **42** tocam 2 arquivos em comum (`SarakCoreCard.tsx`, `SarakCardGrid.tsx`). **Nunca executar em paralelo.** Ordem recomendada: **41 primeiro** (mecânica, baixo risco, entrega ganho mensurável), **42 depois** (breaking change de contrato tipado, exige caracterização). Se a 42 rodar antes, ela deve preservar a troca de ícone desta spec.
