---
tipo: "spec"
titulo: "Piso de Bundle: barris de ícone e o custo do despacho dinâmico"
dominio: "Performance / Build / Componentes UI Base / Ícones"
status: "🔴 Planejada (executar ANTES da Spec 42 — 2 arquivos em comum, nunca em paralelo)"
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
- [ ] Medição registrada ANTES do refactor: contribuição de lucide (bundle do consumidor) e de phosphor/tabler (`dist/` da lib), com números e método reprodutível.
- [ ] Zero `import * as *Icons` com **acesso por índice dinâmico** em `src/` (grep limpo); os cards usam o átomo `SarakIcon`.
- [ ] Medição DEPOIS, comparável à de antes, registrada no `00-progresso.md`. **Se o ganho for irrelevante, a spec fecha com a conclusão negativa documentada e o refactor revertido ou justificado por outro motivo (coerência de arquitetura).**
- [ ] Nenhuma regressão de ícone: `IconMap` cobre os nomes usados nos templates/manifestos da casa; nome desconhecido → `console.warn` + degradação visível, nunca tela quebrada.
- [ ] Nomes de ícone válidos documentados no catálogo gerado.
- [ ] Conclusão do §1.1 (manualChunks não reduz bundle em renderizador de manifesto) registrada no `vite.config.ts` do `init` e/ou na skill.
- [ ] Gates verdes: `RegistryParity`, `catalog:check`, `npm run build`, `run_audit.mjs` sem regressão (baseline conhecido); suítes de `Cards`, `Templates` e `Icon` verdes.

# 4. Plano de Testes (Quality Gate)
## Medição (é o coração desta spec)
- [ ] Build de app mínimo do `init` antes/depois, com tamanho do chunk principal e dos chunks de ícone isolados; `npm pack`/análise do `dist/` para phosphor/tabler.
## Unitários
- [ ] Cada card renderiza o ícone correto via `SarakIcon` (nome válido) e degrada com warn em nome inválido, sem quebrar.
- [ ] `IconMap`: nomes documentados no catálogo existem no mapa (gate de paridade nome↔catálogo).
## Regressão
- [ ] Snapshots dos 5 cards atualizados conscientemente (o elemento de ícone muda de `React.createElement(Lucide[...])` para `SarakIcon` — diferença esperada, revisar cada um).
- [ ] Suítes de `src/components/atomic/Cards`, `Templates` e `Icon` verdes.

# 5. Coordenação com a Spec 42 (obrigatório)
Esta spec e a **42** tocam 2 arquivos em comum (`SarakCoreCard.tsx`, `SarakCardGrid.tsx`). **Nunca executar em paralelo.** Ordem recomendada: **41 primeiro** (mecânica, baixo risco, entrega ganho mensurável), **42 depois** (breaking change de contrato tipado, exige caracterização). Se a 42 rodar antes, ela deve preservar a troca de ícone desta spec.
